const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

const authRoutes = require("./routes/auth.routes");
const interviewRoutes = require("./routes/interview.routes");
const voiceRoutes = require("./routes/voice.routes");
const mockInterviewRoutes = require("./routes/mockInterview.routes");

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/mock-interview", mockInterviewRoutes);

module.exports = app;