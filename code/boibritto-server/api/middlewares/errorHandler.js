const { sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");
const { logWarning, logError } = require("../utils/logger");

const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    logWarning("Invalid JSON payload in request body", {
      url: req.originalUrl,
      error: err.message,
    });

    return sendError(
      res,
      HTTP.BAD_REQUEST,
      "invalid JSON payload in request body",
    );
  }
  next(err);
};

const routeNotFoundHandler = (req, res, next) => {
  logWarning("route not found", { method: req.method, url: req.originalUrl });
  return sendError(res, HTTP.NOT_FOUND, "The requested resource was not found");
};

const globalErrorHandler = (err, req, res, next) => {
  logError("unhandled error occurred", {
    method: req.method,
    url: req.originalUrl,
    error: err,
  });

  return sendError(
    res,
    HTTP.INTERNAL_SERVER_ERROR,
    "An unexpected error occurred",
  );
};

module.exports = {
  jsonErrorHandler,
  routeNotFoundHandler,
  globalErrorHandler,
};
