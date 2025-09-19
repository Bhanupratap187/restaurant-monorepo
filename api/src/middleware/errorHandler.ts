import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

/**
 * Global Error Handler
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let error = err;

  // Convert known errors to ApiError
  if (!(error instanceof ApiError)) {
    if (error.name === 'ValidationError') {
      const message = Object.values((error as any).errors)
        .map((val: any) => val.message)
        .join(', ');
      error = ApiError.badRequest(`Validation Error: ${message}`);
    } else if ((error as any).code === 11000) {
      const field = Object.keys((error as any).keyValue)[0];
      error = ApiError.conflict(`Duplicate field value: ${field}`);
    } else if (error.name === 'CastError') {
      error = ApiError.badRequest('Invalid ID format');
    } else {
      error = ApiError.internal('Something went wrong');
    }
  }

  const apiError = error as ApiError;

  // Log error
  logger.error('API Error', {
    message: apiError.message,
    statusCode: apiError.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: apiError.stack,
  });

  // Send error response
  res.status(apiError.statusCode).json({
    error: {
      message: apiError.message,
      status: apiError.statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      ...(process.env.NODE_ENV === 'development' && { stack: apiError.stack }),
    },
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
}
