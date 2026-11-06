const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    console.log("BEFORE TOKEN EXTRACTION");

    const authHeader = req.header("Authorization");

const token = authHeader?.startsWith("Bearer ")
  ? authHeader.slice(7)
  : null;

    console.log("AFTER TOKEN EXTRACTION");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    try {
    //   console.log("TOKEN RECEIVED:", token);
      console.log("TOKEN TYPE:", typeof token);
      const decode = jwt.verify(token, process.env.JWT_SECRET);

    //   console.log("Decoded token:", decode);

      req.user = decode;
    } catch (error) {
      console.error("JWT verification error:", error);

      // 👇 Yahan check karo, andar wale catch mein
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired, please login again",
          tokenExpired: true,
        });
      }

      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};