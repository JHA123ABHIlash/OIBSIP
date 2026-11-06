const { io } = require("socket.io-client");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNoYW5kYW5taXNocmE1MTkzQGdtYWlsLmNvbSIsImlkIjoiNmFiNzRlZjc0ZWMwN2ViZDJmMDA2ZTBiIiwicm9sZSI6IlVzZXIiLCJpYXQiOjE3OTA0MjEyNzUsImV4cCI6MTc5MzAxMzI3NX0.h7XolXTiAuzOb5Bz6ngKdEl5nQ5qdjH_u_yplstfsFY";

const orderId = "6ab7b2124db74e1c9da8c8ac";

const socket = io("http://localhost:4000", {
  auth: {
    token,
  },
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("joinOrder", orderId);
});

socket.on("joinedOrder", (data) => {
  console.log("Joined Order Room:", data);
});

socket.on("joinOrderError", (data) => {
  console.log("Join Error:", data);
});

socket.on("orderStatusUpdated", (data) => {
  console.log("Order Status Updated:", data);
});

socket.on("connect_error", (error) => {
  console.log("Connection Error:", error.message);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});