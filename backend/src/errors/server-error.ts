export class InternalServerError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 500;
    this.name = this.constructor.name;  // в логах отобразится класс ошибки
    Error.captureStackTrace(this, this.constructor);  // в логах убираем вызов конструктора ошибки
  }
}
