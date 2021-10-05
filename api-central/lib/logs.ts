import * as winston from 'winston';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({
            stack: true
        }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: 'errors.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'combined.log'
        }),
        new winston.transports.Console({
            
        }),
    ]
});