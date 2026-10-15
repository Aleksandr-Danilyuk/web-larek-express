import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import * as path from 'path';
import fs from 'fs';

const logsDir = path.join(__dirname, '../../logs');

// Создаём папку, если её нет (один раз при старте)
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Логгер запросов: только успешные и обычные запросы (не ошибки)
export const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'request.log'),
      format: winston.format.json(),
    }),
  ],
  // Что логировать в request.log
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}}',
  expressFormat: true, // добавляет req.method, req.url, res.statusCode и т.п.
  colorize: false,
});

// только ошибки 
export const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      format: winston.format.json(),
    }),
  ],
  meta: true,
  msg: 'ERROR {{req.method}} {{req.url}} {{err.message}}',
});
