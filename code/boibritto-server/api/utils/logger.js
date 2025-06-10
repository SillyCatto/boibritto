const chalk = require("chalk");

// format timestamp
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

// log info message to console.

const logInfo = (message, data = null) => {
  const prefix = chalk.bgBlue.white.bold(" INFO ");
  const timestamp = chalk.dim(getTimestamp());
  console.log(`${prefix} ${timestamp} ${chalk.blue(message)}`);
  if (data !== null) {
    console.log(chalk.blue("    Data:"), data);
  }
};

// log warning
const logWarning = (message, data = null) => {
  const prefix = chalk.bgYellow.black.bold(" WARN ");
  const timestamp = chalk.dim(getTimestamp());
  console.warn(`${prefix} ${timestamp} ${chalk.yellow(message)}`);
  if (data !== null) {
    console.warn(chalk.yellow("    Data:"), data);
  }
};

// log error

const logError = (message, error = null) => {
  const prefix = chalk.bgRed.white.bold(" ERROR ");
  const timestamp = chalk.dim(getTimestamp());
  console.error(`${prefix} ${timestamp} ${chalk.red(message)}`);

  if (error !== null) {
    // If it's an Error instance, log its message and stack
    if (error instanceof Error) {
      console.error(
        chalk.red("    Error Message:"),
        chalk.red.bold(error.message),
      );
      if (error.stack) {
        console.error(chalk.red("    Stack Trace:"), chalk.red(error.stack));
      }
    } else {
      // Otherwise, log the provided data directly
      console.error(chalk.red("    Details:"), error);
    }
  }
};

module.exports = {
  logInfo,
  logWarning,
  logError,
};
