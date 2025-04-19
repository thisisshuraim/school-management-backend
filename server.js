const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");

require("dotenv").config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", require("./routes/authRoutes"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));