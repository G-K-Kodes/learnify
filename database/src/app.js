const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const startCleanupJob = require("./jobs/cleanup");
const { initSocket } = require("./socket");

connectDB();
startCleanupJob();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Routes
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const progressRoutes = require("./routes/progress");
const instructorRoutes = require("./routes/instructor");

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/instructor", instructorRoutes);

app.get("/", (_req, res) => res.send("Lern.it backend running..."));

// ✅ Server + WebSocket
const server = http.createServer(app);
initSocket(server); // Initialize socket logic here

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
