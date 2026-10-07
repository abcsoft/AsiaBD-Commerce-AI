export type AppErrorCode =
  | 'validation'
  | 'not_found'
  | 'insufficient_credits'
  | 'rate_limited'
  | 'unauthorized'
  | 'conflict'
  | 'provider_error'
  | 'invalid_output'
  | 'internal';

const STATUS: Record<AppErrorCode, number> = {
  validation: 400,
  not_found: 404,
  insufficient_credits: 402,
  rate_limited: 429,
  unauthorized: 401,
  conflict: 409,
  provider_error: 502,
  invalid_output: 502,
  internal: 500,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = STATUS[code];
    this.details = details;
  }
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof Error) {
    return new AppError('internal', err.message || 'Unexpected error');
  }
  return new AppError('internal', 'Unexpected error');
}
