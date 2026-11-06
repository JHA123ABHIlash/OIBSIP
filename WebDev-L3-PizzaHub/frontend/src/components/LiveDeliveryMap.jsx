
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export default function LiveDeliveryMap({ orderId }) {
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("Waiting for delivery agent...");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!orderId || !token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      socket.emit("joinOrder", orderId);
    });

    socket.on("joinedOrder", () => {
      setMessage("Connected. Waiting for agent GPS...");
    });

    socket.on("joinOrderError", (data) => {
      setMessage(data.message || "Unable to access this order.");
    });

    socket.on("agentLocation", (data) => {
      if (String(data.orderId) !== String(orderId)) return;

      setLocation([data.latitude, data.longitude]);
      setMessage(
        `Last updated: ${new Date(data.updatedAt).toLocaleTimeString()}`
      );
    });

    socket.on("connect_error", () => {
      setMessage("Could not connect to live tracking.");
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, token]);

  if (!location) {
    return <p className="p-4">{message}</p>;
  }

  return (
    <div className="space-y-2">
      <p>{message}</p>

      <MapContainer
        center={location}
        zoom={16}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={location}>
          <Popup>Delivery agent's current location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
