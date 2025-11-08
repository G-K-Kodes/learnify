const { Server } = require("socket.io");
const getInstructorStats = require("./utils/getInstructorStats");

let io;
const instructorSockets = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("📡 New connection:", socket.id);

    socket.on("registerInstructor", async (instructorId) => {
      instructorSockets.set(instructorId, socket.id);
      console.log(`Instructor ${instructorId} registered`);

      const stats = await getInstructorStats(instructorId);
      socket.emit("statsUpdate", stats);
    });

    socket.on("disconnect", () => {
      for (const [id, sockId] of instructorSockets.entries()) {
        if (sockId === socket.id) {
          instructorSockets.delete(id);
          console.log(`❌ Instructor ${id} disconnected`);
          break;
        }
      }
    });
  });
}

async function sendInstructorStats(instructorId) {
  if (!io) return console.warn("⚠️ Socket.io not initialized yet");

  try {
    const stats = await getInstructorStats(instructorId);
    const socketId = instructorSockets.get(instructorId.toString());
    console.log("📊 Instructor sockets map:", instructorSockets);
    console.log("📡 Trying to send stats to:", instructorId, "socket:", socketId);
    
    if (socketId) {
      io.to(socketId).emit("statsUpdate", stats);
      console.log(`📤 Sent updated stats to instructor ${instructorId}`);
    } else {
      console.warn(`⚠️ No active socket found for instructor ${instructorId}`);
    }
  } catch (err) {
    console.error("❌ Error sending instructor stats:", err);
  }
}

module.exports = { initSocket, sendInstructorStats };
