const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/response.util");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return errorResponse(res, "No token provided", 401, "AUTH_MISSING_TOKEN");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return errorResponse(res, "Malformed token", 401, "AUTH_INVALID_TOKEN");
    }

    const secret = process.env.JWT_SECRET || "default_secret_please_change";
    const decoded = jwt.verify(token, secret);

    req.user = decoded; // { id, role, tenantId }
    next();
  } catch (error) {
    return errorResponse(
      res,
      "Invalid or expired token",
      401,
      "AUTH_EXPIRED_TOKEN",
      error,
    );
  }
};

module.exports = authMiddleware;
