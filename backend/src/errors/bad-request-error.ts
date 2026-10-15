class BadRequestError extends Error {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 400;
    this.name = this.constructor.name; // в логах отобразится класс ошибки
    // в логах убираем вызов конструктора ошибки
    Error.captureStackTrace(this, this.constructor);
  }
}

export default BadRequestError;
