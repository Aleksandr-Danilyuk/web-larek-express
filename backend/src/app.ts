import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import productsRouter from './routes/products';
import orderRouter from './routes/order';
import { errors as celebrateErrors } from 'celebrate';
import { errorHandler } from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';


const { PORT = 3000 } = process.env;
const app = express();
app.use(express.json());

app.use(requestLogger); // логгер запросов

app.use('/product', productsRouter);
app.use('/order', orderRouter);

app.use(celebrateErrors());  // стандартное решение middleware errors из библиотеки celebrate
app.use(errorLogger);   // логгер ошибок
app.use(errorHandler);  // централизованный обработчик ошибок

mongoose.connect('mongodb://127.0.0.1:27017/weblarek')

app.use(express.static(path.join(__dirname, 'public'))); // теперь клиент имеет доступ только к публичным файлам

app.listen(PORT, () => {
    console.log(`Hello world !`)
    console.log(`App listening on port ${PORT}`)
})