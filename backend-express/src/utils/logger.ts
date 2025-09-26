import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Custom format for development
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}${
        info.stack ? "\n" + info.stack : ""
      }`
  )
);

// Custom format for production
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// File rotate transport for errors
const errorRotateTransport = new DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "14d",
});

// File rotate transport for all logs
const combinedRotateTransport = new DailyRotateFile({
  filename: "logs/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
});

// Console transport for development
const consoleTransport = new winston.transports.Console({
  level: process.env.LOG_LEVEL || "debug",
  format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
  handleExceptions: true,
  handleRejections: true,
});

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels,
  format: prodFormat,
  transports: [errorRotateTransport, combinedRotateTransport, consoleTransport],
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
});

// Helper methods for common logging patterns
export const logRequest = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    logger.http(
      `${method} ${originalUrl} ${statusCode} ${duration}ms - IP: ${
        ip || "unknown"
      }`
    );
  });

  next();
};

export const logError = (error: Error, context?: string) => {
  logger.error(`Error${context ? ` in ${context}` : ""}: ${error.message}`, {
    stack: error.stack,
    context,
  });
};

export const logAuth = (action: string, userId?: string, details?: any) => {
  logger.info(`Auth: ${action}`, {
    userId,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

export const logBusiness = (action: string, userId?: string, details?: any) => {
  logger.info(`Business: ${action}`, {
    userId,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

export default logger;
