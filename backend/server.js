const express=express()
const app = express();
const server = createServer(app);
const { createServer } = require("http");
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8000",
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for connections`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});