const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");

// Apply base middleware
router.use(authMiddleware, tenantMiddleware);

// Routes
// Create: USER (and ADMIN)
router.post(
  "/",
  roleMiddleware(["USER", "ADMIN"]),
  ticketController.createTicket,
);

// Get: All roles (logic inside controller handles filtering)
router.get("/", ticketController.getTickets);

// Update Status: AGENT, ADMIN
router.put(
  "/:id/status",
  roleMiddleware(["AGENT", "ADMIN"]),
  ticketController.updateTicketStatus,
);

// Assign: ADMIN
router.put(
  "/:id/assign",
  roleMiddleware(["ADMIN"]),
  ticketController.assignTicket,
);

// Delete: ADMIN
router.delete(
  "/:id",
  roleMiddleware(["ADMIN"]),
  ticketController.softDeleteTicket,
);

module.exports = router;
