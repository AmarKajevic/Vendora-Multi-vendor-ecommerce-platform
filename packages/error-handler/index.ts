export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean,
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace?.(this);
  }
}

//not found error
export class NotFoundError extends AppError {
  constructor(message = "Resources not found") {
    super(message, 404, true);
  }
}

//validation error(use for joi/zod/react-hook-form validation )
export class ValidationError extends AppError {
  constructor(message = "Invalid request data", details?: any) {
    super(message, 400, true, details);
  }
}

//authentication error
export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, true);
  }
}

//forbiden error
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, true);
  }
}

//databse error
export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any) {
    super(message, 500, true, details);
  }
}

//rate limit error(if user exceed the rate limit)
export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later.") {
    super(message, 429, true);
  }
}
