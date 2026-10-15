import { Router } from 'express';
import { createOrder } from '../controllers/order';
import { validateProductOrder } from '../middlewares/validatons';

const router = Router();

router.post('/', validateProductOrder, createOrder);

export default router;


