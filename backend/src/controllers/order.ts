import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import { BadRequestError } from '../errors/bad-request-error';

interface ProductLeanDoc {
  _id: string;
  price: number | null;
}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
  const { payment, email, phone, address, total, items } = req.body;

  // --- Проверка существования товаров и их цены ---
  const products = await Product.find(
    { _id: { $in: items as string[] } },
    { title: 1, price: 1 }
  ).lean<ProductLeanDoc[]>();

  const foundIds = new Set(products.map((p) => p._id));
  for (const id of items) {
    if (!foundIds.has(id)) {
      throw new BadRequestError(`Товар с ID ${id} не найден`);
    }
  }

  // проверить, что товар продается, т. е. поле price не равно null
  const invalidPriceProducts = products.filter(
    (p) => p.price === null || typeof p.price !== 'number'
  );
  if (invalidPriceProducts.length > 0) {
    const badIds = invalidPriceProducts.map((p) => p._id);
    throw new BadRequestError(
        `У следующих товаров цена не установлена (null): ${badIds.join(', ')}`
    );
  }

  // --- Пересчёт суммы и проверка total ---
  const calculatedTotal = products.reduce((sum, p) => sum + Number(p.price), 0);
  const isTotalValid = Math.abs(calculatedTotal - total) < 0.01;  // смотрим разницу что бы сумма в заказе совпадала со стоимостью товаров

  if (!isTotalValid) {
    throw new BadRequestError(
        'Сумма total не совпадает с суммой цен переданных товаров'
    );
  }

  // --- Генерация ID заказа ---
  const orderId = faker.string.uuid();

  res.status(201).json({
    id: orderId,
    total: calculatedTotal, // Возвращаем сумму перещитанную в API
  });
  } catch (error) {
    next(error); // передаём ошибку в глобальный обработчик
  }
};
