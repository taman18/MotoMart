import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "motomart-dev-secret-change-in-production"
);

const ACCESS_TTL  = "15m";   // short-lived access token
const REFRESH_TTL = "7d";    // long-lived refresh token

export interface TokenPayload extends JWTPayload {
  sub: string;          // user identifier (phone / email / admin username)
  name: string;
  role: "admin" | "user";
}

export async function signAccessToken(payload: Omit<TokenPayload, "iss" | "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("motomart")
    .setExpirationTime(ACCESS_TTL)
    .sign(SECRET);
}

export async function signRefreshToken(payload: Omit<TokenPayload, "iss" | "iat" | "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("motomart")
    .setExpirationTime(REFRESH_TTL)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, SECRET, { issuer: "motomart" });
  return payload as TokenPayload;
}
