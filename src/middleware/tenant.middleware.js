const { errorResponse } = require("../utils/response.util");

const tenantMiddleware = (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    return errorResponse(
      res,
      "Access denied: No tenant context",
      403,
      "AUTH_NO_TENANT",
    );
  }
  // You could also verify if the tenant still exists in DB here if strictly required,
  // but for performance, we usually trust the token (which has expiration).
  next();
};

module.exports = tenantMiddleware;
