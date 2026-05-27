import type { Context } from "hono";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const Errors = {
  UNAUTHORIZED:      new ApiError(401, "Unauthorized",               "UNAUTHORIZED"),
  FORBIDDEN:         new ApiError(403, "Forbidden",                  "FORBIDDEN"),
  NOT_FOUND:         new ApiError(404, "Resource not found",         "NOT_FOUND"),
  INVALID_OTP:       new ApiError(400, "Invalid or expired OTP",     "INVALID_OTP"),
  USER_NOT_FOUND:    new ApiError(404, "Account not found",          "USER_NOT_FOUND"),
  USER_EXISTS:       new ApiError(409, "Account already exists",     "USER_EXISTS"),
  INVALID_CREDS:     new ApiError(401, "Invalid credentials",        "INVALID_CREDS"),
  VALIDATION_ERROR:  new ApiError(422, "Validation error",           "VALIDATION_ERROR"),
  TOKEN_EXPIRED:     new ApiError(401, "Token expired",              "TOKEN_EXPIRED"),
  INTERNAL:          new ApiError(500, "Internal server error",      "INTERNAL"),
} as const;

/** Consistent JSON error response shape */
export function errorResponse(c: Context, err: ApiError | Error) {
  if (err instanceof ApiError) {
    return c.json(
      { ok: false, error: { code: err.code, message: err.message } },
      err.statusCode as Parameters<typeof c.json>[1]
    );
  }
  console.error("[MotoMart API]", err);
  return c.json(
    { ok: false, error: { code: "INTERNAL", message: "Internal server error" } },
    500
  );
}

/** Consistent JSON success response shape */
export function successResponse<T>(c: Context, data: T, status = 200) {
  return c.json({ ok: true, data }, status as Parameters<typeof c.json>[1]);
}
