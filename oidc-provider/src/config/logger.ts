import winston from 'winston';

import config from '../config';

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
    level: config.log.level,
    levels: winston.config.npm.levels,
    transports
});

export default LoggerInstance;
