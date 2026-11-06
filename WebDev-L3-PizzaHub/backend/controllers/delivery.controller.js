
const User = require("../models/User");
const Order = require("../models/Order");

// Admin assigns an order to a verified delivery agent.
exports.assignDeliveryAgent = async (req, res) => {
  try {
    const { orderId, agentId } = req.body;

    if (!orderId || !agentId) {
      return res.status(400).json({
        success: false,
        message: "Order ID and agent ID are required."
      });
    }

    const agent = await User.findOne({
      _id: agentId,
      role: "DeliveryAgent",
      isVerified: true
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Verified delivery agent not found."
      });
    }

    if (!agent.isAvailable) {
      return res.status(409).json({
        success: false,
        message: "Delivery agent is not available."
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    if (order.paymentStatus !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "Only successfully paid orders can be assigned."
      });
    }

    if (order.deliveryStatus === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "This order is already delivered."
      });
    }

   const updatedOrder = await Order.findByIdAndUpdate(
  orderId,
  {
    $set: {
      deliveryAgent: agent._id,
      deliveryStatus: "Assigned",
    },
  },
  {
    new: true,
    runValidators: true,
  }
);

if (!updatedOrder) {
  return res.status(404).json({
    success: false,
    message: "Order not found.",
  });
}

    return res.status(200).json({
  success: true,
  message: "Delivery agent assigned successfully.",
  order: updatedOrder,
});

  } catch (error) {
    console.error("Assign agent error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to assign delivery agent."
    });
  }
};


// Agent sees only their own assigned orders.
exports.getMyDeliveryOrders = async (req, res) => {
  try {
    if (req.user.role !== "DeliveryAgent") {
      return res.status(403).json({
        success: false,
        message: "Delivery agent access required."
      });
    }

    const orders = await Order.find({
      deliveryAgent: req.user.id,
      deliveryStatus: { $ne: "Delivered" }
    })
      .populate("user", "name email")
      .populate("deliveryAgent", "name email currentLocation");

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Get delivery orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch delivery orders."
    });
  }
};


// Agent marks an assigned order as picked up.
exports.markPickedUp = async (req, res) => {
  try {
    if (req.user.role !== "DeliveryAgent") {
      return res.status(403).json({
        success: false,
        message: "Delivery agent access required."
      });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      deliveryAgent: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Assigned order not found."
      });
    }

    if (order.paymentStatus !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "Order payment is not successful."
      });
    }

    if (order.deliveryStatus !== "Assigned") {
  return res.status(400).json({
    success: false,
    message: "Only assigned orders can be picked up.",
  });
}

    order.deliveryStatus = "PickedUp";
    order.orderStatus = "Sent to Delivery";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as picked up.",
      order
    });
  } catch (error) {
    console.error("Pickup update error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update delivery status."
    });
  }
};


// Agent confirms delivery of their assigned order.
exports.markDelivered = async (req, res) => {
  try {
    if (req.user.role !== "DeliveryAgent") {
      return res.status(403).json({
        success: false,
        message: "Delivery agent access required."
      });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      deliveryAgent: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Assigned order not found."
      });
    }

    if (order.deliveryStatus !== "PickedUp") {
      return res.status(400).json({
        success: false,
        message: "Pick up the order before marking it delivered."
      });
    }

    order.deliveryStatus = "Delivered";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order delivered successfully.",
      order
    });
  } catch (error) {
    console.error("Delivery completion error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete delivery."
    });
  }
};
