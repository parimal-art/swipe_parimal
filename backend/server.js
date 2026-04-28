const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const questionSetRoutes = require("./routes/questionSetRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { submitAnswer } = require("./controllers/candidateController");
const { getDashboardData } = require("./controllers/questionSetController");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/question-set", questionSetRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/ai", aiRoutes);
app.post("/api/answer", submitAnswer);
app.get("/api/dashboard/:code", getDashboardData);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
