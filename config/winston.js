const winston = require("winston");
const appRoot = require("app-root-path");

const options = {
  File: {
    level: "info",
    filename: `${appRoot}/logs/app.json`,
    handleExceptions: true,
    format: winston.format.json(),
    maxsize: 5000000, //5MB
    maxFile: 3,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  },
};

const logger = new winston.createLogger({
  transports: [
    new winston.transports.File(options.File),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

logger.stream = {
  write: function (message) {
    logger.info(message);
  },
};

module.exports = logger;
