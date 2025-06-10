const { sendError } = require("../utils/response");
const { HTTP } = require("node:http");

const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendError(
      res,
      HTTP.BAD_REQUEST,
      "invalid JSON payload in request body",
    );
  }
  next(err);
};

// const routeNotFoundHandler = (err, req, res, next) => {};

const globalErrorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  return sendError(
    res,
    HTTP.INTERNAL_SERVER_ERROR,
    "An unexpected error occurred",
  );
};

module.exports = {
  jsonErrorHandler,
  globalErrorHandler,
};
