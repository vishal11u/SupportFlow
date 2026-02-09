const http = require("http");
const app = require("./src/app");
const db = require("./src/models");
const { init } = require("./src/socket");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected");

    await db.sequelize.sync({ alter: true });
    console.log("✅ Models synced");

    const server = http.createServer(app);

    // Initialize Socket.io
    init(server);
    console.log("✅ Socket.io initialized");

    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`),
    );
  } catch (err) {
    console.error("❌ Startup failed:", err);
  }
})();
