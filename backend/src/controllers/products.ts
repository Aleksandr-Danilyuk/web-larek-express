import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product, { ProductDocument } from '../models/product';
import type { IProduct } from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import InternalServerError from '../errors/server-error';

interface ProductImageDto {
  fileName: string;
  originalName: string;
}

interface ProductItemDto {
  _id: string;
  title: string;
  image: ProductImageDto;
  category: string;
  description?: string;
  price?: number | null;
}

interface ProductsListResponse {
  items: ProductItemDto[];
  total: number;
}

export const getProducts = (_req: Request, res: Response, next: NextFunction): void => {
  Product.find({}, { __v: 0 })
    .then((products) => products.map((doc: ProductDocument) => ({
      _id: doc._id!.toString(),
      title: doc.title,
      image: {
        fileName: doc.image.fileName,
        originalName: doc.image.originalName,
      },
      category: doc.category,
      description: doc.description,
      price: doc.price,
    })))
    .then((items) => {
      const response: ProductsListResponse = {
        items,
        total: items.length,
      };
      res.json(response);
    })
    .catch((_err) => {
      next(new InternalServerError('Ошибка при получении списка товаров'));
    });
};

export const createProduct = (req: Request, res: Response, next: NextFunction): void => {
  const {
    title, image, category, description, price,
  } = req.body as Partial<IProduct>;

  Product.create({
    title, image, category, description, price,
  })
    .then((product) => {
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
      if (err instanceof Error && err.message.includes('E11000')) {
        next(new ConflictError('Товар с таким заголовком уже существует'));
      } else if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError('Ошибка валидации данных при создании товара'));
      } else {
        next(new InternalServerError('Ошибка при создании товара'));
      }
    });
};
