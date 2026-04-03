import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

import database from "./utils/database.js";
import UserProfile from "./routes/User.route.js";
import profileRouter from "./routes/profileRoute.js";
import GenerativeRouter from "./routes/genrativeRoute.js";
import profileSettingRouter from "./routes/profileDetailRoute.js";
import InterviewRouter from "./routes/interviewRoute.js";
import ChatbotRouter from "./routes/chatbotRoute.js";

dotenv.config();

const app = express();


//  Middleware
app.use(cookieParser());
app.use(express.json());

//  CORS Configuration
const rawOrigin = process.env.CLIENT_URL || "http://localhost:5173";
const cleanOrigin = rawOrigin.replace(/\/$/, ""); // strips trailing slash

app.use(
  cors({
    origin: cleanOrigin,
    credentials: true,
  })
);


//  Connect to database
database();

//  Routes
app.use("/api/v1", UserProfile);
app.use("/api/v2",profileRouter)
app.use("/api/v3",GenerativeRouter)

app.use("/api/v4",profileSettingRouter)

app.use("/api/v5",InterviewRouter)

app.use("/api/v6",ChatbotRouter)

// Global error handler (optional, but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
  });
});

// ✅ Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
