const User = require("../models/User");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const OTP = require("../models/OTP");
const mailSender = require("../utils/mailSender");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;
    // Check All details are there or not.
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "All Fields are required",
      });
    }

    // Phone Validation
    if (!/^[6-9]\d{9}$/.test(phone || "")) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number",
      });
    }

    // Password or Confirm Password are Same or Not
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      });
    }

    // Check User Already Exist or Not.

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists. Please Login to Continue.",
      });
    }

    // Hash Password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    // remove password in user
    user.password = undefined;

    // generate Otp
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("otp", otp);

    // Save Otp
    await OTP.create({
      email,
      otp: otp,
    });

    // Send OTP to User through Email.

    const subject = "Verify Your Email - Pizza Delivery";
    const body = `
        Hello,

Thank you for registering with Pizza Delivery.

Your email verification OTP is:

${otp} 

This OTP is valid for 5 minutes.

If you did not request this, please ignore this email.

Regards,
Pizza Delivery Team`;

    await mailSender(email, subject, body);

    // Return response.
    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

// VERIFY EMAILs.

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    //validate fields,

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Verify OTP

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (!response.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP Not Found.",
      });
    }

    // Validate OTP
    if (response[0].otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP Invailid",
      });
    }

    //Find User and do true "isVerified".
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found.",
      });
    }
    user.isVerified = true;

    await user.save();

    // Delete otp.
    await OTP.findByIdAndDelete(response[0]._id);

    return res.status(200).json({
      success: true,
      message: "Email Verified Successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Not verified, Please try again.",
    });
  }
};

//Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Get User ans validate.
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Your email is already verified.",
      });
    }

    // generate Otp
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("otp", otp);

    // Save Otp
    await OTP.create({
      email,
      otp: otp,
    });

    // Send OTP to User through Email.

    const subject = "Verify Your Email - Pizza Delivery";
    const body = `
        Hello! ${user.name},

Thank you for registering with Pizza Delivery.

Your email verification OTP is:

${otp} 

This OTP is valid for 5 minutes.

If you did not request this, please ignore this email.

Regards,
Pizza Delivery Team`;

    await mailSender(email, subject, body);

    res.status(200).json({
      success: true,
      message: "OTP Send Successfully.",
    });
  } catch (error) {
    console.log("Error comes while in resend OTP.", error.message);
    return res.status(500).json({
      success: false,
      message: "Error comes while Resend OTP",
    });
  }
};

// LOGIN FUNC.

exports.Login = async (req, res) => {
  try {
    // get email,password from user
    const { email, password } = req.body;

    //validate email,password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // find user.
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // check isVerified status.

    if (user.isVerified === false) {
      return res.status(400).json({
        success: false,
        message: "Please verify Your Email.",
      });
    }

    // Compare password and Generate Token.

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        },
      );

      // Save token to user document in database

      user.password = undefined;
      // await user.save();

      res.status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    });
  }
};

//Forget Password.
exports.forgotPassword = async (req, res) => {
  try {
    // Get Email and Validate
    const { email } = req.body;

    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Please Enter Your Email.",
      });
    }

    // Find User And Validate.
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found.",
      });
    }

    //generate token using crypto.
    const token = crypto.randomBytes(20).toString("hex");

    // update token in user and set expires.
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        resetToken: token,
        resetTokenExpires: Date.now() + 3600000,
      },
      { new: true },
    );
    console.log("DETAILS", updatedDetails);

    //Generate Token and Send reset Email.
    const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await mailSender(
      email,
      "Password Reset",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`,
    );

    res.json({
      success: true,
      message:
        "Email Sent Successfully, Please Check Your Email to Continue Further",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Message`,
    });
  }
};

//Reset Password.
exports.resetPassword = async (req, res) => {
  try {
    // get value from body & params.

    const { password, confirmPassword } = req.body;
    const token = req.params.token;

    //validate Password.

    if (confirmPassword !== password) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      });
    }

    //get user and validate
    const userDetails = await User.findOne({ resetToken: token });
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Token is Invalid",
      });
    }

    //check resetTokenExpires

    if (!(userDetails.resetTokenExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please Regenerate Your Token`,
      });
    }

    //Hash Password
    const encryptedPassword = await bcrypt.hash(password, 10);

    //Find and Update User.

    await User.findOneAndUpdate(
      { resetToken: token },
      {
        password: encryptedPassword,
        resetToken: undefined,
        resetTokenExpires: undefined,
      },
      { new: true },
    );

    // send response.
    res.status(200).json({
      success: true,
      message: `Password Reset Successful`,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Password`,
    });
  }
};

exports.registerDeliveryAgent = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (!/^[6-9]\d{9}$/.test(phone || "")) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const agent = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: "DeliveryAgent",
      isVerified: false,
    });

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await OTP.create({
      email: normalizedEmail,
      otp,
    });

    await mailSender(
      normalizedEmail,
      "Verify Delivery Agent Email - PizzaHub",
      `Your verification OTP is ${otp}. It is valid for 5 minutes.`,
    );

    return res.status(201).json({
      success: true,
      message: "Delivery agent registered. Please verify your email.",
    });
  } catch (error) {
    console.error("Delivery agent registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register delivery agent.",
    });
  }
};
