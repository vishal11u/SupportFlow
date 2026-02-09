const { errorResponse } = require("../utils/response.util");

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        "Access denied: Insufficient permissions",
        403,
        "AUTH_FORBIDDEN",
      );
    }
    next();
  };
};

module.exports = roleMiddleware;
