const express = require("express");
const cors = require("cors");
const { successResponse, errorResponse } = require("./utils/response.util");
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  successResponse(
    res,
    "Multi-tenant Ticket System API is running!",
    {
      documentation: {
        auth: "/auth",
        users: "/users",
        tickets: "/tickets",
      },
    },
    200,
    "API_RUNNING",
  );
});

app.use("/auth", require("./routes/auth.routes"));
app.use("/users", require("./routes/user.routes"));
app.use("/tickets", require("./routes/ticket.routes"));
app.use("/notifications", require("./routes/notification.routes"));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  errorResponse(
    res,
    "Something went wrong!",
    500,
    "INTERNAL_SERVER_ERROR",
    err,
  );
});

module.exports = app;
