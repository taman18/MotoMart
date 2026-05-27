import type { Context, Next } from "hono";
import { verifyToken, type TokenPayload } from "./jwt";
import { errorResponse, ApiError } from "./errors";

export type HonoEnv = { Variables: { tokenPayload: TokenPayload } };

export async function requireAuth(c: Context<HonoEnv>, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse(c, new ApiError(401, "Missing or malformed Authorization header", "UNAUTHORIZED"));
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token);
    c.set("tokenPayload", payload);
    await next();
  } catch (err: unknown) {
    const isExpired = err instanceof Error && err.message.includes("expired");
    return errorResponse(
      c,
      new ApiError(401, isExpired ? "Token expired" : "Invalid token", isExpired ? "TOKEN_EXPIRED" : "UNAUTHORIZED")
    );
  }
}

export async function requireAdmin(c: Context<HonoEnv>, next: Next) {
  const payload = c.get("tokenPayload");
  if (payload?.role !== "admin") {
    return errorResponse(c, new ApiError(403, "Admin access required", "FORBIDDEN"));
  }
  await next();
}
