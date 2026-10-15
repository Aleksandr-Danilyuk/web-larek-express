import { celebrate, Joi, Segments } from 'celebrate';

const orderSchema = Joi.object({
  payment: Joi.string().valid('card', 'online').required()
    .messages({
      'string.base': 'Значение payment должно быть строкой',
      'string.valid': 'Значение payment должено быть только card или online',
      'any.required': 'поле payment обязательно',
    }),
  email: Joi.string().email({ minDomainSegments: 2 }).required()
    .messages({
      'string.base': 'email должно быть строкой',
      'string.email': 'email должен быть валидным адресом',
      'any.required': 'поле email обязательно',
    }),
  phone: Joi.string().min(1).required()
    .messages({
      'string.base': 'Значение phone должно быть строкой',
      'string.min': 'Значение phone не может быть пустым',
      'any.required': 'поле phone обязательно',
    }),
  address: Joi.string().min(1).required()
    .messages({
      'string.base': 'Значение address должно быть строкой',
      'string.min': 'Значение address не может быть пустым',
      'any.required': 'поле address обязательно',
    }),
  total: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Значение total должно быть числом',
      'number.positive': 'Значение total должно быть положительным числом',
      'number.precision': 'Значение total должно содержать не более 2-х знаков после запятой',
      'any.required': 'поле total обязательно',
    }),
  items: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      'array.min': 'массив items должен содержать хотя бы один элемент',
      'any.required': 'поле items обязательно',
    }),
}).unknown(false);

const validateProductOrder = celebrate(
  { [Segments.BODY]: orderSchema },
  { abortEarly: false },
);

const productSchema = Joi.object({
  title: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'title должно быть строкой',
      'string.min': 'title должен быть не короче 3 символов',
      'string.max': 'title не должен превышать 100 символов',
      'any.required': 'поле title обязательно',
    }),
  category: Joi.string().min(2).max(50).required()
    .messages({
      'string.base': 'category должно быть строкой',
      'string.min': 'category должен быть не короче 2 символов',
      'string.max': 'category не должен превышать 50 символов',
      'any.required': 'поле category обязательно',
    }),
  description: Joi.string().allow(null, '').optional(),
  price: Joi.number().allow(null)
    .messages({
      'number.base': 'price должно быть числом или null',
    }),
  image: Joi.object({
    fileName: Joi.string().min(1).required()
      .messages({ 'any.required': 'image.fileName обязателен', 'string.min': 'image.fileName не может быть пустым' }),
    originalName: Joi.string().min(1).required()
      .messages({ 'any.required': 'image.originalName обязателен', 'string.min': 'image.originalName не может быть пустым' }),
  }).required()
    .messages({ 'any.required': 'объект image обязателен' }),
}).unknown(false);

const validateCreateProduct = celebrate(
  { [Segments.BODY]: productSchema },
  { abortEarly: false },
);

export default validateProductOrder;
export { validateCreateProduct };
