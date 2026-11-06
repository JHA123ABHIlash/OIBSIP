
const Settings = require("../models/Settings");

const DEFAULT_SETTINGS = {
  key: "global",
  storeName: "PizzaHub",
  supportEmail: "",
  supportPhone: "",
  storeAddress: "",
  currency: "INR",
  taxRate: 5,
  preparationTime: 30,
  acceptOrders: true,
  emailNotifications: true,
  lowStockAlerts: true,
};

const ALLOWED_FIELDS = [
  "storeName",
  "supportEmail",
  "supportPhone",
  "storeAddress",
  "currency",
  "taxRate",
  "preparationTime",
  "acceptOrders",
  "emailNotifications",
  "lowStockAlerts",
];

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "global" });

    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS);
    }

    return res.status(200).json({
      success: true,
      settings,
      message: "Settings fetched successfully.",
    });
  } catch (error) {
    console.error("Get Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch settings.",
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updateData = {};

    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (
      updateData.storeName !== undefined &&
      (typeof updateData.storeName !== "string" ||
        !updateData.storeName.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Store name is required.",
      });
    }

    if (updateData.supportEmail !== undefined) {
      if (
        typeof updateData.supportEmail !== "string" ||
        (updateData.supportEmail.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            updateData.supportEmail.trim()
          ))
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid support email.",
        });
      }

      updateData.supportEmail = updateData.supportEmail.trim();
    }

    for (const field of ["supportPhone", "storeAddress"]) {
      if (
        updateData[field] !== undefined &&
        typeof updateData[field] !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must be text.`,
        });
      }

      if (updateData[field] !== undefined) {
        updateData[field] = updateData[field].trim();
      }
    }

    if (updateData.currency !== undefined &&
        updateData.currency !== "INR") {
      return res.status(400).json({
        success: false,
        message: "Unsupported currency.",
      });
    }

    if (updateData.taxRate !== undefined) {
      const taxRate = Number(updateData.taxRate);

      if (
        updateData.taxRate === "" ||
        !Number.isFinite(taxRate) ||
        taxRate < 0 ||
        taxRate > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Tax rate must be between 0 and 100.",
        });
      }

      updateData.taxRate = taxRate;
    }

    if (updateData.preparationTime !== undefined) {
      const preparationTime = Number(updateData.preparationTime);

      if (
        updateData.preparationTime === "" ||
        !Number.isInteger(preparationTime) ||
        preparationTime < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Preparation time must be a positive integer.",
        });
      }

      updateData.preparationTime = preparationTime;
    }

    for (const field of [
      "acceptOrders",
      "emailNotifications",
      "lowStockAlerts",
    ]) {
      if (
        updateData[field] !== undefined &&
        typeof updateData[field] !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must be true or false.`,
        });
      }
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "global" },
      {
        $set: updateData,
        $setOnInsert: { key: "global" },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      settings,
      message: "Settings saved successfully.",
    });
  } catch (error) {
    console.error("Update Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save settings.",
    });
  }
};
