import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
  )
);

export const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    
    new winston.transports.Console(),
    
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'app.log') 
    })
  ]
});
