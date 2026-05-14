export default class AppError extends Error {
  constructor(message, statusCode) {
    this.statusCode = statusCode;
    this.explanation = message;
    r;
  }
}
