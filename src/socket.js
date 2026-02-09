const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

exports.init = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    // Client should send token in auth object: { token: "..." }
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const secret = process.env.JWT_SECRET || "default_secret_please_change";
      const decoded = jwt.verify(token, secret);
      socket.user = decoded; // { id, role, tenantId }
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id} (User: ${socket.user.id})`);

    // Join room based on User ID for personal notifications
    socket.join(socket.user.id);

    // Join room based on Tenant ID for tenant-wide notifications
    socket.join(socket.user.tenantId);

    // Join room based on Role (e.g., "tenantId_AGENT")
    socket.join(`${socket.user.tenantId}_${socket.user.role}`);

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
