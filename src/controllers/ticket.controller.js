const { Ticket, User, Notification } = require("../models");
const { successResponse, errorResponse } = require("../utils/response.util");
const { getIO } = require("../socket");

// Helper to find ticket safely
const findTicket = async (id, tenantId) => {
  return await Ticket.findOne({ where: { id, tenantId } });
};

// Helper to send notification
const sendNotification = async (recipientId, tenantId, type, message, data) => {
  try {
    // 1. Save to DB
    const notification = await Notification.create({
      recipientId,
      tenantId,
      type,
      message,
      data,
    });

    // 2. Emit via Socket.io
    try {
      const io = getIO();
      io.to(recipientId).emit("notification", {
        id: notification.id,
        type,
        message,
        data,
        createdAt: notification.createdAt,
      });
    } catch (socketErr) {
      console.warn(
        "Socket.io not initialized or failed to emit:",
        socketErr.message,
      );
    }
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
};

exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const { tenantId, id: userId } = req.user;

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      status: "OPEN",
      tenantId,
      createdById: userId,
    });

    // Emit live event to all staff in the tenant
    try {
      const io = getIO();
      // Notify Agents and Admins about new ticket
      io.to(`${tenantId}_AGENT`)
        .to(`${tenantId}_ADMIN`)
        .emit("ticket_created", {
          ticket: await Ticket.findByPk(ticket.id, {
            include: [
              {
                model: User,
                as: "creator",
                attributes: ["id", "name", "email"],
              },
            ],
          }),
        });
    } catch (err) {
      console.warn("Real-time emission failed:", err.message);
    }

    successResponse(
      res,
      "Ticket created successfully",
      ticket,
      201,
      "TICKET_CREATED",
    );
  } catch (error) {
    console.error(error);
    errorResponse(res, "Server error", 500, "SERVER_ERROR", error);
  }
};

exports.getTickets = async (req, res) => {
  try {
    const { tenantId, id: userId, role } = req.user;
    const where = { tenantId };

    if (role === "USER") {
      where.createdById = userId;
    } else if (role === "AGENT") {
      where.assignedToId = userId;
    }

    const tickets = await Ticket.findAll({
      where,
      include: [
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
        { model: User, as: "assignee", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    successResponse(
      res,
      "Tickets retrieved successfully",
      tickets,
      200,
      "TICKETS_RETRIEVED",
    );
  } catch (error) {
    errorResponse(res, "Server error", 500, "SERVER_ERROR", error);
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { tenantId, id: userId, role } = req.user;

    const where = { id, tenantId };

    if (role === "AGENT") {
      where.assignedToId = userId;
    }

    const ticket = await Ticket.findOne({ where });

    if (!ticket) {
      return errorResponse(
        res,
        "Ticket not found or access denied",
        404,
        "TICKET_NOT_FOUND",
      );
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    // Notify Creator if status changed
    if (oldStatus !== status && ticket.createdById !== userId) {
      await sendNotification(
        ticket.createdById,
        tenantId,
        "TICKET_UPDATED",
        `Ticket #${ticket.id} status updated to ${status}`,
        { ticketId: ticket.id, oldStatus, newStatus: status },
      );
    }

    // Notify Assignee if someone else updated it (e.g. Admin)
    if (
      oldStatus !== status &&
      ticket.assignedToId &&
      ticket.assignedToId !== userId
    ) {
      await sendNotification(
        ticket.assignedToId,
        tenantId,
        "TICKET_UPDATED",
        `Ticket #${ticket.id} status updated to ${status}`,
        { ticketId: ticket.id, oldStatus, newStatus: status },
      );
    }

    // Emit live event to the entire tenant or relevant rooms
    try {
      const io = getIO();
      const updatedTicket = await Ticket.findByPk(id, {
        include: [
          { model: User, as: "creator", attributes: ["id", "name", "email"] },
          { model: User, as: "assignee", attributes: ["id", "name", "email"] },
        ],
      });

      const eventType =
        status === "CLOSED" ? "ticket_closed" : "ticket_updated";
      io.to(tenantId).emit(eventType, {
        ticketId: id,
        status,
        updatedTicket,
        updatedBy: userId,
      });
    } catch (err) {
      console.warn("Real-time emission failed:", err.message);
    }

    successResponse(
      res,
      "Ticket status updated successfully",
      ticket,
      200,
      "TICKET_UPDATED",
    );
  } catch (error) {
    errorResponse(res, "Server error", 500, "SERVER_ERROR", error);
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToId } = req.body;
    const { tenantId, role } = req.user;

    if (role !== "ADMIN") {
      return errorResponse(
        res,
        "Only Admin can assign tickets",
        403,
        "AUTH_FORBIDDEN",
      );
    }

    const ticket = await findTicket(id, tenantId);
    if (!ticket)
      return errorResponse(res, "Ticket not found", 404, "TICKET_NOT_FOUND");

    // Verify assignee exists and is in same tenant
    if (assignedToId) {
      const assignee = await User.findOne({
        where: { id: assignedToId, tenantId },
      });
      if (!assignee)
        return errorResponse(
          res,
          "Assignee not found in this tenant",
          400,
          "ASSIGNEE_NOT_FOUND",
        );
    }

    ticket.assignedToId = assignedToId;
    await ticket.save();

    if (assignedToId) {
      await sendNotification(
        assignedToId,
        tenantId,
        "TICKET_ASSIGNED",
        `You have been assigned ticket #${ticket.id}`,
        { ticketId: ticket.id },
      );
    }

    successResponse(
      res,
      "Ticket assigned successfully",
      ticket,
      200,
      "TICKET_ASSIGNED",
    );
  } catch (error) {
    errorResponse(res, "Server error", 500, "SERVER_ERROR", error);
  }
};

exports.softDeleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const ticket = await findTicket(id, tenantId);
    if (!ticket) {
      return errorResponse(res, "Ticket not found", 404, "TICKET_NOT_FOUND");
    }

    await ticket.destroy();
    // Emit live delete event
    try {
      const io = getIO();
      io.to(tenantId).emit("ticket_deleted", { ticketId: id });
    } catch (err) {
      console.warn("Real-time emission failed:", err.message);
    }

    successResponse(
      res,
      "Ticket deleted successfully",
      null,
      200,
      "TICKET_DELETED",
    );
  } catch (error) {
    errorResponse(res, "Server error", 500, "SERVER_ERROR", error);
  }
};

exports.getTicketStats = async (req, res) => {
  try {
    const { tenantId, id: userId, role } = req.user;
    const where = { tenantId };

    if (role === "USER") {
      where.createdById = userId;
    } else if (role === "AGENT") {
      where.assignedToId = userId;
    }

    const tickets = await Ticket.findAll({ where });

    const stats = {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      closed: tickets.filter((t) => t.status === "CLOSED").length,
      highPriority: tickets.filter((t) => t.priority === "HIGH").length,
    };

    successResponse(
      res,
      "Stats retrieved successfully",
      stats,
      200,
      "STATS_RETRIEVED",
    );
  } catch (error) {
    console.error(error);
    errorResponse(res, "Server error", 500, "SERVER_ERROR", error);
  }
};
