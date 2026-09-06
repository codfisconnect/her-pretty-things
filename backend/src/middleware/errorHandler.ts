import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'

export class HttpError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
  }
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.'

  response.status(statusCode).json({ success: false, message })
}
