const db = require("./src/models");
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Connected...");
    await db.sequelize.sync({ force: true });
    console.log(
      "✅ Database reset successfully (Tables dropped and recreated)",
    );
  } catch (err) {
    console.error("❌ Reset failed:", err);
  } finally {
    process.exit();
  }
})();
