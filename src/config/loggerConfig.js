import winston, { createLogger, format, transports } from 'winston';

const { combine, timestamp, label, printf } = format;

const customeFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const createCustomLogger = (moduleName) => {
  return createLogger({
    format: combine(label({ label: moduleName }), timestamp(), customeFormat),
    transports: [new transports.Console(), new transports.File({ filename: 'combined.log' })],
  });
};

export default createCustomLogger;
