import chalk from "chalk";

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
  const prefix = chalk.bgBlue.black.bold(" INFO ");
  const timestamp = chalk.dim(getTimestamp());

  console.log(`${prefix} ${timestamp} ${chalk.blue.bold(message)}`);
  if (data !== null) {
    console.log(chalk.blue.underline("data:"), data);
  }
};

// log warning
const logWarning = (message, data = null) => {
  const prefix = chalk.bgYellow.black.bold(" WARN ");
  const timestamp = chalk.dim(getTimestamp());

  console.warn(`${prefix} ${timestamp} ${chalk.yellow.bold(message)}`);
  if (data !== null) {
    console.warn(chalk.yellow.underline("data:"), data);
  }
};

// log error
const logError = (message, error = null) => {
  const prefix = chalk.bgRed.black.bold(" ERROR ");
  const timestamp = chalk.dim(getTimestamp());

  console.error(`${prefix} ${timestamp} ${chalk.red.bold(message)}`);

  if (error !== null) {
    if (error instanceof Error) {
      console.error(
        chalk.red.underline("error message:"),
        chalk.red(error.message)
      );
      if (error.stack) {
        console.error(
          chalk.red.underline("stack trace:"),
          chalk.red(error.stack)
        );
      }
    } else {
      console.error(chalk.red.underline("details:"), error);
    }
  }
};

export { logInfo, logWarning, logError };
