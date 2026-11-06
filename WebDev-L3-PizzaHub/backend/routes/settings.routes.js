
const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSettings,
} = require("../controllers/settings.controller");

const { auth } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");

router.get("/get-settings", auth, isAdmin, getSettings);
router.put("/update-settings", auth, isAdmin, updateSettings);

module.exports = router;
