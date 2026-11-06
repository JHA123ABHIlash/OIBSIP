
const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
      immutable: true,
    },
    storeName: {
      type: String,
      default: "PizzaHub",
      trim: true,
      required: true,
    },
    supportEmail: {
      type: String,
      default: "",
      trim: true,
    },
    supportPhone: {
      type: String,
      default: "",
      trim: true,
    },
    storeAddress: {
      type: String,
      default: "",
      trim: true,
    },
    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },
    taxRate: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
    preparationTime: {
      type: Number,
      default: 30,
      min: 1,
    },
    acceptOrders: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    lowStockAlerts: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
