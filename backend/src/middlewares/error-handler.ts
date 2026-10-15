import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BadRequestError } from '../errors/bad-request-error';
import { ConflictError} from '../errors/conflict-error';
import { NotFoundError } from '../errors/not-found-error';
import { InternalServerError } from '../errors/server-error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Если это наша кастомная ошибка — используем её статус и сообщение
  if (err instanceof BadRequestError || err instanceof ConflictError || 
      err instanceof NotFoundError || err instanceof InternalServerError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Обработка дубликата уникального поля (E11000) — это не наша кастомная ошибка, но мы её распознаём
  if (err instanceof Error && err.message.includes('E11000')) {
    return res.status(409).json({
      message: 'Ресурс с такими данными уже существует (например, дубликат title)',
    });
  }

  // Валидационные ошибки Mongoose (если вдруг попали сюда мимо celebrate)
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Ошибка валидации данных',
    });
  }

  // Всё остальное — внутренняя ошибка
  return res.status(500).json({
    message: 'Внутренняя ошибка сервера',
  });
};
