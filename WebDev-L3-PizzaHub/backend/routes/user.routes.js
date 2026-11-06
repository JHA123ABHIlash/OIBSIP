
const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getDeliveryAgents,
} = require("../controllers/user.controller");

const { auth } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");

// Get all users
router.get("/get-all-users", auth, isAdmin, getAllUsers);

// Update user role
router.put("/update-role/:userId", auth, isAdmin, updateUserRole);

// Delete user
router.delete("/delete-user/:userId", auth, isAdmin, deleteUser);

// get Agent 
router.get("/get-delivery-agents", auth, isAdmin, getDeliveryAgents);

module.exports = router;
