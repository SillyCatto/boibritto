const chalk = require("chalk");
const chk = chalk.default || chalk;

const getTimestamp = () => {
  const now = new Date();

  return now.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

// log info message
const logInfo = (message, data = null) => {
  const prefix = chk.bgBlue.black.bold(" INFO ");
  const timestamp = chk.dim(getTimestamp());

  console.log(`${prefix} ${timestamp} ${chk.blue.bold(message)}`);
  if (data !== null) {
    console.log(chk.blue.underline("data:"), data);
  }
};

// log warning
const logWarning = (message, data = null) => {
  const prefix = chk.bgYellow.black.bold(" WARN ");
  const timestamp = chk.dim(getTimestamp());

  console.warn(`${prefix} ${timestamp} ${chk.yellow.bold(message)}`);
  if (data !== null) {
    console.warn(chk.yellow.underline("data:"), data);
  }
};

// log error
const logError = (message, error = null) => {
  const prefix = chk.bgRed.black.bold(" ERROR ");
  const timestamp = chk.dim(getTimestamp());

  console.error(`${prefix} ${timestamp} ${chk.red.bold(message)}`);

  if (error !== null) {
    if (error instanceof Error) {
      console.error(
        chk.red.underline("error message:"),
        chk.red(error.message),
      );
      if (error.stack) {
        console.error(chk.red.underline("stack trace:"), chk.red(error.stack));
      }
    } else {
      console.error(chk.red.underline("details:"), error);
    }
  }
};

module.exports = {
  logInfo,
  logWarning,
  logError,
};
