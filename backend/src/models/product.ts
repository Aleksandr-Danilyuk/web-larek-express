import mongoose from 'mongoose';

interface IImageProduct {
  fileName: string;
  originalName: string;
}

export interface IProduct {
  title: string;
  image: IImageProduct;
  category: string;
  description?: string;
  price?: number | null;
}

const imageProductSchema = new mongoose.Schema<IImageProduct>({
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
});

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
    required: [true, 'Поле "title" должно быть заполнено'],
    unique: true,
  },
  image: imageProductSchema,
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: false,
    default: null,
  },
});

// Тип документа для работы с экземплярами модели
export type ProductDocument = mongoose.Document<{}, {}, IProduct> & IProduct;

export default mongoose.model<IProduct>('Product', productSchema);
