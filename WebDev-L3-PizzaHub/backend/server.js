const dotenv = require("dotenv");
const Database = require("./config/db");
const mongoose = require("mongoose");
const User = require("./models/User");

dotenv.config();

const app = require("./app");

const http = require("http");
const server = http.createServer(app);

const { initSocket } = require("./utils/socket");

const jwt = require("jsonwebtoken");
const Order = require("./models/Order");

const authRoutes = require("./routes/auth.routes");
const pizzaRoutes = require("./routes/pizza.routes");
const orderRoutes = require("./routes/order.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const userRoutes = require("./routes/user.routes");
const settingsRoutes = require("./routes/settings.routes");
const deliveryRoutes = require("./routes/delivery.routes");

const port = process.env.PORT || 4000;

Database();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/pizza", pizzaRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/delivery", deliveryRoutes);

// Socket.IO
const io = initSocket(server);

// Socket Authentication

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication token is required."));
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decode.id).select("role isVerified");

    if (!user || !user.isVerified || user.role !== decode.role) {
      return next(new Error("Unauthorized or unverified account."));
    }

    socket.userId = user._id.toString();
    socket.role = user.role;

    return next();
  } catch (error) {
    return next(new Error("Invalid or expired token."));
  }
});

// Socket Connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  console.log("User ID:", socket.userId);

  // Join Order Room
  // Customer, assigned delivery agent, or admin can join an order room.
  socket.on("joinOrder", async (orderId) => {
    try {
      if (!orderId) {
        socket.emit("joinOrderError", {
          message: "Order ID is required.",
        });
        return;
      }
      if (!mongoose.isValidObjectId(orderId)) {
        socket.emit("joinOrderError", {
          message: "Invalid order ID.",
        });
        return;
      }

      let order;

      if (socket.role === "Admin") {
        order = await Order.findById(orderId);
      } else if (socket.role === "DeliveryAgent") {
        order = await Order.findOne({
          _id: orderId,
          deliveryAgent: socket.userId,
        });
      } else {
        order = await Order.findOne({
          _id: orderId,
          user: socket.userId,
        });
      }

      if (!order) {
        socket.emit("joinOrderError", {
          message: "Order not found or access denied.",
        });
        return;
      }

      const room = `order_${orderId}`;
      socket.join(room);

      socket.emit("joinedOrder", {
        orderId,
        message: "Joined order room successfully.",
      });
    } catch (error) {
      console.error("Join Order Error:", error.message);

      socket.emit("joinOrderError", {
        message: "Unable to join order room.",
      });
    }
  });

  // Delivery agent shares GPS coordinates for an active assigned order.
  socket.on("agentLocationUpdate", async (data) => {
    try {
      if (socket.role !== "DeliveryAgent") {
        socket.emit("locationUpdateError", {
          message: "Only delivery agents can share delivery location.",
        });
        return;
      }

      const { orderId, latitude, longitude } = data || {};

      if (
        !orderId ||
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        socket.emit("locationUpdateError", {
          message: "Valid order ID and GPS coordinates are required.",
        });
        return;
      }

      // The agent must be assigned to this order.
      const order = await Order.findOne({
        _id: orderId,
        deliveryAgent: socket.userId,
        deliveryStatus: "PickedUp",
        paymentStatus: "SUCCESS",
      });

      if (!order) {
        socket.emit("locationUpdateError", {
          message: "No active assigned delivery found.",
        });
        return;
      }

      const updatedAgent = await User.findOneAndUpdate(
        {
          _id: socket.userId,
          role: "DeliveryAgent",
          isVerified: true,
        },
        {
          $set: {
            "currentLocation.latitude": latitude,
            "currentLocation.longitude": longitude,
            "currentLocation.updatedAt": new Date(),
          },
        },
        { new: true },
      ).select("_id currentLocation");

      if (!updatedAgent) {
        socket.emit("locationUpdateError", {
          message: "Delivery agent account not found.",
        });
        return;
      }

      // Only clients in this order's authorized room receive the location.
      io.to(`order_${orderId}`).emit("agentLocation", {
        orderId,
        agentId: String(updatedAgent._id),
        latitude,
        longitude,
        updatedAt: updatedAgent.currentLocation.updatedAt,
      });

      socket.emit("locationUpdateReceived", {
        success: true,
        orderId,
      });
    } catch (error) {
      console.error("Agent location update error:", error);

      socket.emit("locationUpdateError", {
        message: "Unable to update delivery location.",
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
