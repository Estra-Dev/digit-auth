import type { Response } from "express";

export interface SuccessResponse<T> {
  success: true;
  message: string;
  timestamp: string;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  timestamp: string;
  errors?: unknown;
}

export type ApiResponseData<T> = SuccessResponse<T> | ErrorResponse;

export class ApiResponse {
  static success<T>(
    res: Response,
    options: {
      statusCode?: number;
      message: string;
      data?: T;
    },
  ) {
    const response: SuccessResponse<T> = {
      success: true,
      message: options.message,
      timestamp: new Date().toISOString(),
      ...(options.data !== undefined && {
        data: options.data,
      }),
    };

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
    const response: ErrorResponse = {
      success: false,
      message: options.message,
      timestamp: new Date().toISOString(),
      ...(options.errors !== undefined && {
        errors: options.errors,
      }),
    };

    return res.status(options.statusCode ?? 500).json(response);
  }
}
