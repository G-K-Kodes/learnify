const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const courseRoutes = require("./routes/courses");
app.use("/api/courses", courseRoutes);

const progressRoutes = require("./routes/progress");
app.use("/api/progress", progressRoutes);

app.get("/", (req, res) => {
  res.send("Learnify backend running...");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
