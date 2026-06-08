import "dotenv/config";

import express from "express";
import "./config/google.passport.js";
import "./config/linkedin.passport.js";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import aiResumeRoutes from "./routes/resumeRoutes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Session (required for Passport OAuth)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Test route
app.get("/run", (req, res) => res.send("Backend is running ✅"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ai-resume", aiResumeRoutes);
app.use("/api/payment", paymentRoutes);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("Mongo error:", err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`http://localhost:${PORT} 🚀`));

