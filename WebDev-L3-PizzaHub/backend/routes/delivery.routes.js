
const express = require("express");
const router = express.Router();

const {
  assignDeliveryAgent,
  getMyDeliveryOrders,
  markPickedUp,
  markDelivered
} = require("../controllers/delivery.controller");
const { isDeliveryAgent } = require("../middleware/deliveryAgent");

const { auth } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");

// Admin only
router.post(
  "/assign",
  auth,
  isAdmin,
  assignDeliveryAgent
);

// Delivery agent only (role is checked in controller)
router.get(
  "/my-orders",
  auth,
  isDeliveryAgent,
  getMyDeliveryOrders
);

router.patch(
  "/orders/:orderId/picked-up",
  auth,
  isDeliveryAgent,
  markPickedUp
);

router.patch(
  "/orders/:orderId/delivered",
  auth,
  isDeliveryAgent,
  markDelivered
);

module.exports = router;
