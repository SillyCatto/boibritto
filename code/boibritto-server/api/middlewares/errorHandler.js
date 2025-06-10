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

module.exports = {
  jsonErrorHandler,
};
