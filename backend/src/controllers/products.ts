import { Request, Response, NextFunction } from 'express';
import Product, { ProductDocument } from '../models/product';
import type { IProduct } from '../models/product';
import { BadRequestError } from '../errors/bad-request-error';
import { ConflictError } from '../errors/conflict-error';
import { InternalServerError } from '../errors/server-error';

import mongoose from 'mongoose';

// По ТЗ необходимо привести ответ к нужному формату реализовано через Data Transfer Object — «объект передачи данных»
// DTO для image (только нужные поля)
interface ProductImageDto {
  fileName: string;
  originalName: string;
}

// DTO для одного товара (строгий формат ответа)
interface ProductItemDto {
  _id: string;
  title: string;
  image: ProductImageDto;
  category: string;
  description?: string;
  price?: number | null;
}

// Формат списка товаров
interface ProductsListResponse {
  items: ProductItemDto[];
  total: number;
}


export const getProducts = (req: Request, res: Response, next: NextFunction) => {
  // Используем проекцию: не тянем __v 
  return Product.find({}, { __v: 0 })
    .then((products) => {
      // Используем .map для формирования объекта передачи данных : явный контроль структуры ответа
      const items: ProductItemDto[] = products.map((doc: ProductDocument) => ({
        _id: doc._id!.toString(), // приводим ObjectId к строке по ТЗ
        title: doc.title,
        image: {
          fileName: doc.image.fileName,
          originalName: doc.image.originalName,
        },
        category: doc.category,
        description: doc.description,
        price: doc.price,
      }));

      const response: ProductsListResponse = {    // Формируем ответ с подсчётом общего колличества
        items,
        total: items.length,
      };

      res.json(response);
    })
    .catch((err) => {next(new InternalServerError('Ошибка при получении списка товаров'));});
};

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const { title, image, category, description, price } = req.body as Partial<IProduct>;;

  // Простая валидация на уровне контроллера 
  if (!title || !category || !image || !image.fileName || !image.originalName) {
    throw new BadRequestError( 'Обязательны: title, category, image (fileName, originalName)');
  }

  return Product.create({ title, image, category, description, price })
    .then((product) => {
      // В POST тоже возвращаем DTO формат, чтобы API был консистентным
      const item: ProductItemDto = {
        _id: product._id.toString(),
        title: product.title,
        image: {
          fileName: product.image.fileName,
          originalName: product.image.originalName,
        },
        category: product.category,
        description: product.description,
        price: product.price,
      };
      res.status(201).json({ data: item });
    })
    .catch((err) => {
      if (err instanceof Error && err.message.includes('E11000')) { // Проверка на дубликат (E11000)
        return next(new ConflictError('Товар с таким заголовком уже существует'));
      };

      if (err instanceof mongoose.Error.ValidationError) {  // Проверка на валидацию Mongoose
        return next(new BadRequestError('Ошибка валидации данных при создании товара'));
      };

      next(new InternalServerError('Ошибка при создании товара')); // Всё остальное — внутренняя ошибка
    });
};
