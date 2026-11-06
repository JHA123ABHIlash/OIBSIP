
const User = require("../models/User");
const mongoose = require("mongoose");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -resetToken -resetTokenExpires")
      .sort({ _id: -1 });

    return res.status(200).json({
      success: true,
      users,
      message: "Users fetched successfully.",
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users.",
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (!["Admin", "User"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be Admin or User.",
      });
    }

    // Prevent an admin from changing their own role
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password -resetToken -resetTokenExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
      message: "User role updated successfully.",
    });
  } catch (error) {
    console.error("Update User Role Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user role.",
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // Prevent an admin from deleting their own account
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete user.",
    });
  }
};


exports.getDeliveryAgents = async (req, res) => {
  try {
    const agents = await User.find({
      role: "DeliveryAgent",
      isVerified: true,
    }).select("_id name email isAvailable");

    return res.status(200).json({
      success: true,
      agents,
    });
  } catch (error) {
    console.error("Get Delivery Agents Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch delivery agents",
    });
  }
};