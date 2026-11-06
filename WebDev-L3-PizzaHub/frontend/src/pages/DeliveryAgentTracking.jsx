
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export default function DeliveryAgentTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const token = localStorage.getItem("token");

  const activeOrderIds = orders
    .filter((order) => order.deliveryStatus === "PickedUp")
    .map((order) => order._id);

  const activeOrderIdsKey = activeOrderIds.join(",");

  const loadOrders = async () => {
    try {
      const response = await api.get("/delivery/my-orders");
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load assigned orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handlePickup = async (orderId) => {
    setActionLoading(orderId);
    setError("");

    try {
      await api.patch(`/delivery/orders/${orderId}/picked-up`);
      await loadOrders();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to confirm pickup."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDelivered = async (orderId) => {
    setActionLoading(orderId);
    setError("");

    try {
      await api.patch(`/delivery/orders/${orderId}/delivered`);
      await loadOrders();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to complete delivery."
      );
    } finally {
      setActionLoading("");
    }
  };

  useEffect(() => {
    if (!activeOrderIds.length || !token) {
      setSharing(false);
      return;
    }

    if (!navigator.geolocation) {
      setSharing(false);
      setError("This device does not support GPS location.");
      return;
    }

    let socket;
    let watchId;

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setError("");
    });

    socket.on("connect_error", () => {
      setSharing(false);
      setError("Live connection failed. Please check your login.");
    });

    socket.on("locationUpdateError", (data) => {
      setError(data?.message || "Location update failed.");
    });

    socket.on("locationUpdateReceived", () => {
      setSharing(true);
    });

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!socket.connected) return;

        activeOrderIds.forEach((orderId) => {
          socket.emit("agentLocationUpdate", {
            orderId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        });
      },
      (geoError) => {
        setSharing(false);

        setError(
          geoError.code === 1
            ? "Location permission denied. Enable GPS permission."
            : "Unable to read GPS location."
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      }
    );

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }

      socket.disconnect();
    };
  }, [activeOrderIdsKey, token]);

  if (loading) {
    return <p className="p-5">Loading assigned orders...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-5">
      <h1 className="text-2xl font-bold">My Deliveries</h1>

      {error && (
        <p className="rounded bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {sharing && (
        <p className="rounded bg-green-100 p-3 text-green-700">
          Live location sharing is active.
        </p>
      )}

      {orders.length === 0 && (
        <p>No active deliveries assigned.</p>
      )}

      {orders.map((order) => {
        const isProcessing = actionLoading === order._id;

        return (
          <div
            key={order._id}
            className="space-y-2 rounded-lg border p-4"
          >
            <p className="break-all font-semibold">
              Order ID: {order._id}
            </p>

            <p>Status: {order.deliveryStatus}</p>

            <p>
              Customer: {order.deliveryAddress?.fullName || "N/A"}
            </p>

            <p>
              Address:{" "}
              {[
                order.deliveryAddress?.house,
                order.deliveryAddress?.street,
                order.deliveryAddress?.city,
                order.deliveryAddress?.state,
                order.deliveryAddress?.pincode,
              ]
                .filter(Boolean)
                .join(", ") || "Address unavailable"}
            </p>

            {order.deliveryStatus === "Assigned" && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handlePickup(order._id)}
                className="rounded bg-red-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Confirm Pickup"}
              </button>
            )}

            {order.deliveryStatus === "PickedUp" && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleDelivered(order._id)}
                className="rounded bg-green-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Mark Delivered"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

