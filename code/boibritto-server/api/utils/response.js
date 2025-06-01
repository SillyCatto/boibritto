const sendSuccess = (res, statusCode = 200, message = "", data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (
  res,
  statusCode = 500,
  message = "Something went wrong",
  error = null,
) => {
  const errorResponse = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === "development" && error) {
    errorResponse.debug = {
      error: error.message,
      stack: error.stack,
    };
  }

  return res.status(statusCode).json(errorResponse);
};

module.exports = { sendSuccess, sendError };
