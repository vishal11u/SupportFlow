const { Notification } = require("../models");
const { successResponse, errorResponse } = require("../utils/response.util");

exports.getNotifications = async (req, res) => {
  try {
    const { id: userId, tenantId } = req.user;
    const notifications = await Notification.findAll({
      where: { recipientId: userId, tenantId },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    return successResponse(res, notifications, "Notifications retrieved");
  } catch (error) {
    return errorResponse(
      res,
      "Failed to retrieve notifications",
      500,
      "SERVER_ERROR",
      error,
    );
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, tenantId } = req.user;

    const notification = await Notification.findOne({
      where: { id, recipientId: userId, tenantId },
    });
    if (!notification) {
      return errorResponse(res, "Notification not found", 404, "NOT_FOUND");
    }

    notification.isRead = true;
    await notification.save();

    return successResponse(res, notification, "Notification marked as read");
  } catch (error) {
    return errorResponse(
      res,
      "Failed to mark notification as read",
      500,
      "SERVER_ERROR",
      error,
    );
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { id: userId, tenantId } = req.user;

    await Notification.update(
      { isRead: true },
      { where: { recipientId: userId, tenantId, isRead: false } },
    );

    return successResponse(res, null, "All notifications marked as read");
  } catch (error) {
    return errorResponse(
      res,
      "Failed to mark all as read",
      500,
      "SERVER_ERROR",
      error,
    );
  }
};
