import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/products';
import { validateCreateProduct } from '../middlewares/validatons';

const router = Router();

router.get('/', getProducts);
router.post('/', validateCreateProduct, createProduct);

export default router;
