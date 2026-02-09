const successResponse = (
  res,
  message,
  data = null,
  statusCode = 200,
  code = "SUCCESS",
) => {
  return res.status(statusCode).json({
    message,
    code,
    data,
  });
};

const errorResponse = (
  res,
  message,
  statusCode = 500,
  code = "ERROR",
  error = null,
) => {
  const response = {
    message,
    code,
    data: null,
  };

  if (process.env.NODE_ENV === "development" && error) {
    response.debug = error.message || error;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};
