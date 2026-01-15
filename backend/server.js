const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const questionSetRoutes = require("./routes/questionSetRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/question-set", questionSetRoutes);
app.use("/api/candidate", candidateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
