import { type Response } from "express";

interface SuccessResponse<T> {
  success: true;
  message: string;
  data?: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors: unknown;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    options: {
      statusCode?: number;
      message: string;
      data?: T;
    },
  ) {
    const response: Record<string, unknown> = {
      success: true,
      message: options.message,
      timestamp: new Date().toISOString(),
    };

    if (options.data !== undefined) {
      response.data = options.data;
    }

    return res.status(options.statusCode ?? 200).json(response);
  }

  static error(
    res: Response,
    options: {
      statusCode?: number;
      message: string;
      errors?: unknown;
    },
  ) {
    const response: Record<string, unknown> = {
      success: false,
      message: options.message,
      timestamp: new Date().toISOString(),
    };

    if (options.errors !== undefined) {
      response.errors = options.errors;
    }

    return res.status(options.statusCode ?? 500).json(response);
  }
}
