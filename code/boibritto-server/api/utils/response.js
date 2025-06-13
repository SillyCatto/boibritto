const sendSuccess = (res, statusCode = 200, message = "", data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, statusCode = 500, message = "Something went wrong") => {
  const errorResponse = {
    success: false,
    message,
  };

  return res.status(statusCode).json(errorResponse);
};

module.exports = { sendSuccess, sendError };
