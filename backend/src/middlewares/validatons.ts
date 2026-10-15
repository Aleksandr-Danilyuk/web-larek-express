import { celebrate, Joi, Segments } from 'celebrate';

const orderSchema = Joi.object({   // Создание схемы Joi
    payment: Joi.string().valid('card', 'online').required().messages({
          'string.base': 'Значение payment должно быть строкой',
          'string.valid': 'Значение payment должено быть только card или online',
          'any.required': 'поле payment обязательно',
        }),
    email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
          'string.base': 'email должно быть строкой',
          'string.email': 'email должен быть валидным адресом',
          'any.required': 'поле email обязательно',
        }),
    phone: Joi.string().min(1).required().messages({
        'string.base': 'Значение phone должно быть строкой',
        'string.min': 'Значение phone не может быть пустым',
        'any.required': 'поле phone обязательно',
      }),
    address: Joi.string().min(1).required().messages({
        'string.base': 'Значение address должно быть строкой',
        'string.min': 'Значение address не может быть пустым',
        'any.required': 'поле address обязательно',
      }),
    total: Joi.number().positive().precision(2).required().messages({
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

export const validateProductOrder = celebrate({[Segments.BODY]: orderSchema},{ abortEarly: false, })
