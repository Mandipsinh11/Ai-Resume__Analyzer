import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      subscription: {
        plan: "pro",
        status: "active",
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "Signup successful",
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginId = (identifier || email || username || "").trim();

    if (!loginId) {
      return res.status(400).json({ message: "Email or username is required" });
    }

    const user = await User.findOne({
      $or: [{ email: loginId }, { name: loginId }],
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or username" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account was registered using Google/LinkedIn. Please sign in via your social provider, or use Forgot Password to create a password.",
        success: false
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Force subscription to pro for testing purposes
    if (!user.subscription || user.subscription.plan !== "pro" || user.subscription.status !== "active") {
      user.subscription = {
        plan: "pro",
        status: "active",
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required", success: false });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Generate a reset token valid for 1 hour
    const resetToken = jwt.sign({ id: user._id, type: "reset" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    console.log(`\n==========================================`);
    console.log(`PASSWORD RESET SIMULATION FOR: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`==========================================\n`);

    res.json({
      message: "Reset link generated (simulated)",
      success: true,
      resetUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required", success: false });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired reset token", success: false });
    }

    if (decoded.type !== "reset") {
      return res.status(400).json({ message: "Invalid token type", success: false });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
