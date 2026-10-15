import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

interface ProductLeanDoc {
  _id: string;
  price: number | null;
}

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      _payment,
      _email,
      _phone,
      _address,
      total,
      items,
    } = req.body;

    // --- Проверка существования товаров и их цены ---
    const products = await Product.find(
      { _id: { $in: items as string[] } },
      { title: 1, price: 1 },
    ).lean<ProductLeanDoc[]>();

    const foundIds = new Set(products.map((p) => p._id));
    const missingIds = items.filter((id: string) => !foundIds.has(id));
    if (missingIds.length > 0) {
      throw new BadRequestError(`Товар с ID ${missingIds[0]} не найден`);
    }

    // проверить, что товар продается, т. е. поле price не равно null
    const invalidPriceProducts = products.filter(
      (p) => p.price === null || typeof p.price !== 'number',
    );
    if (invalidPriceProducts.length > 0) {
      const badIds = invalidPriceProducts.map((p) => p._id);
      throw new BadRequestError(
        `У следующих товаров цена не установлена (null): ${badIds.join(', ')}`,
      );
    }

    // --- Пересчёт суммы и проверка total ---
    const calculatedTotal = products.reduce((sum, p) => sum + Number(p.price), 0);
    // смотрим разницу что бы сумма в заказе совпадала со стоимостью товаров
    const isTotalValid = Math.abs(calculatedTotal - total) < 0.01;

    if (!isTotalValid) {
      throw new BadRequestError(
        'Сумма total не совпадает с суммой цен переданных товаров',
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

export default createOrder;
