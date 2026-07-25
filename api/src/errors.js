export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = "InputError";
    this.statusCode = 400;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "internal key required") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

