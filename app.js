require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const memberRoutes = require("./routes/memberRoutes");

const app = express();

// Middleware
app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json());

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI,)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("Failed to connect to MongoDB", err));

// Routes
app.use("/api/members", memberRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
