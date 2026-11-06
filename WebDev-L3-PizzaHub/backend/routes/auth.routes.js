const express = require("express");
const router = express.Router();

const {
  register,
  verifyEmail,
  resendOTP,
  Login,
  resetPassword,
  forgotPassword,
  registerDeliveryAgent
} = require("../controllers/auth.controller");

// Route for User Signup.
router.post("/register", register);

// Router for Verify Email.
router.post("/verify-email", verifyEmail);

// Router for Resend OTP.
router.post("/resendOTP", resendOTP);

//Router for Login.
router.post("/login", Login);

//Router for Forget Password.
router.post("/forgot-password", forgotPassword);

//Router for Reset Password.
router.post("/reset-password/:token", resetPassword);

//Router for Delivery Agent.
router.post("/register-delivery-agent", registerDeliveryAgent);


module.exports = router;
