import winston from 'winston';

const myFormat = winston.format.printf(({level, message, timestamp}) => {
    return `${timestamp} [${level.toUpperCase()}] ${process.pid}: ${message || ''}`;
});

const transports = [];
transports.push(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            myFormat
        )
    })
);

const LoggerInstance = winston.createLogger({
    level: process.env.LOG_LEVEL || 'silly',
    levels: winston.config.npm.levels,
    transports
});

export default LoggerInstance;
