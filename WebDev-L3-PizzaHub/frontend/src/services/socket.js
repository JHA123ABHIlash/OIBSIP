import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:4000/api";

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;