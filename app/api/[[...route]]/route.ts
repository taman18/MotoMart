/**
 * MotoMart — Hono API handler mounted at /api/*
 *
 * Route map:
 *   POST /api/auth/send-otp          — send OTP to phone/email
 *   POST /api/auth/verify-otp        — verify OTP, returns tokens (login)
 *   POST /api/auth/register          — register new user with OTP proof
 *   POST /api/auth/admin/login       — admin username+password login
 *   POST /api/auth/refresh           — exchange refresh token for new access token
 *   POST /api/auth/logout            — invalidate refresh token
 *   GET  /api/auth/me                — get current user (requires auth)
 */

import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";

import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/api/jwt";
import { requireAuth, requireAdmin, type HonoEnv } from "@/lib/api/auth.middleware";
import { errorResponse, successResponse, ApiError } from "@/lib/api/errors";
import { prisma, MAX_OTP_ATTEMPTS, OTP_TTL_MS } from "@/lib/api/db";
import {
  SendOtpSchema,
  VerifyOtpSchema,
  RegisterSchema,
  AdminLoginSchema,
  RefreshTokenSchema,
  type AuthResponse,
} from "@/lib/validators/auth.validators";
import {
  CreatePartSchema,
  UpdatePartSchema,
  ListPartsSchema,
} from "@/lib/validators/parts.validators";
import {
  CreateBrandSchema,
  UpdateBrandSchema,
} from "@/lib/validators/brands.validators";

export const runtime = "nodejs";


// DB stores role as string; narrow it to the union expected by TokenPayload
function asRole(role: string): "admin" | "user" {
  return role as "admin" | "user";
}

const app = new Hono<HonoEnv>().basePath("/api");

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ ok: true, timestamp: new Date().toISOString() }));

const auth = new Hono<HonoEnv>();

// POST /api/auth/send-otp
auth.post("/send-otp", zValidator("json", SendOtpSchema), async (c) => {
  const { identifier } = c.req.valid("json");

  const existing = await prisma.otp.findUnique({ where: { identifier } });
  if (existing && Date.now() < existing.expiresAt.getTime() - (OTP_TTL_MS - 30_000)) {
    return errorResponse(c, new ApiError(429, "Please wait 30 seconds before requesting a new OTP", "OTP_RATE_LIMIT"));
  }

  const otp = Math.floor(100_000 + Math.random() * 900_000).toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otp.upsert({
    where: { identifier },
    update: { otp, expiresAt, attempts: 0 },
    create: { identifier, otp, expiresAt, attempts: 0 },
  });

  console.info(`[OTP] ${identifier} → ${otp}`);

  return successResponse(c, {
    message: "OTP sent successfully",
    ...(process.env.NODE_ENV !== "production" && { otp }),
  }, 200);
});

// POST /api/auth/verify-otp  (login for existing users)
auth.post("/verify-otp", zValidator("json", VerifyOtpSchema), async (c) => {
  const { identifier, otp } = c.req.valid("json");

  const record = await prisma.otp.findUnique({ where: { identifier } });
  if (!record) {
    return errorResponse(c, new ApiError(400, "No OTP found. Please request a new one.", "OTP_NOT_FOUND"));
  }
  if (Date.now() > record.expiresAt.getTime()) {
    await prisma.otp.delete({ where: { identifier } });
    return errorResponse(c, new ApiError(400, "OTP expired. Please request a new one.", "OTP_EXPIRED"));
  }
  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.otp.delete({ where: { identifier } });
    return errorResponse(c, new ApiError(400, "Too many attempts. Please request a new OTP.", "OTP_MAX_ATTEMPTS"));
  }
  if (record.otp !== otp) {
    await prisma.otp.update({ where: { identifier }, data: { attempts: record.attempts + 1 } });
    return errorResponse(c, new ApiError(400, "Incorrect OTP.", "INVALID_OTP"));
  }

  await prisma.otp.delete({ where: { identifier } });

  const user = await prisma.user.findUnique({ where: { identifier } });
  if (!user) {
    return errorResponse(c, new ApiError(404, "Account not found. Please register first.", "USER_NOT_FOUND"));
  }

  const tokenPayload = { sub: user.id, name: user.name, role: asRole(user.role) };
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(tokenPayload),
    signRefreshToken(tokenPayload),
  ]);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      sub: user.id,
      role: user.role,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return successResponse<AuthResponse>(c, {
    user: { id: user.id, name: user.name, identifier: user.identifier, role: asRole(user.role) },
    tokens: { accessToken, refreshToken, expiresIn: 15 * 60 },
  }, 200);
});

// POST /api/auth/register
auth.post("/register", zValidator("json", RegisterSchema), async (c) => {
  const { name, identifier, otp } = c.req.valid("json");

  const existingUser = await prisma.user.findUnique({ where: { identifier } });
  if (existingUser) {
    return errorResponse(c, new ApiError(409, "Account already exists. Please log in.", "USER_EXISTS"));
  }

  const record = await prisma.otp.findUnique({ where: { identifier } });
  if (!record) {
    return errorResponse(c, new ApiError(400, "Verify OTP before registering.", "OTP_NOT_FOUND"));
  }
  if (Date.now() > record.expiresAt.getTime()) {
    await prisma.otp.delete({ where: { identifier } });
    return errorResponse(c, new ApiError(400, "OTP expired.", "OTP_EXPIRED"));
  }
  if (record.otp !== otp) {
    await prisma.otp.update({ where: { identifier }, data: { attempts: record.attempts + 1 } });
    return errorResponse(c, new ApiError(400, "Incorrect OTP.", "INVALID_OTP"));
  }

  await prisma.otp.delete({ where: { identifier } });

  const newUser = await prisma.user.create({
    data: { name: name.trim(), identifier, role: "user" },
  });

  const tokenPayload = { sub: newUser.id, name: newUser.name, role: asRole(newUser.role) };
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(tokenPayload),
    signRefreshToken(tokenPayload),
  ]);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      sub: newUser.id,
      role: newUser.role,
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return successResponse<AuthResponse>(c, {
    user: { id: newUser.id, name: newUser.name, identifier: newUser.identifier, role: asRole(newUser.role) },
    tokens: { accessToken, refreshToken, expiresIn: 15 * 60 },
  }, 201);
});

// POST /api/auth/admin/login
auth.post("/admin/login", zValidator("json", AdminLoginSchema), async (c) => {
  const { username, password } = c.req.valid("json");

  const admin = await prisma.admin.findUnique({ where: { identifier: username } });
  if (!admin) {
    return errorResponse(c, new ApiError(401, "Invalid username or password.", "INVALID_CREDS"));
  }

  const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatch) {
    return errorResponse(c, new ApiError(401, "Invalid username or password.", "INVALID_CREDS"));
  }

  const tokenPayload = { sub: admin.id, name: admin.name, role: asRole(admin.role) };
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(tokenPayload),
    signRefreshToken(tokenPayload),
  ]);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      sub: admin.id,
      role: admin.role,
      adminId: admin.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return successResponse<AuthResponse>(c, {
    user: { id: admin.id, name: admin.name, identifier: admin.identifier, role: asRole(admin.role) },
    tokens: { accessToken, refreshToken, expiresIn: 15 * 60 },
  }, 200);
});

// POST /api/auth/refresh
auth.post("/refresh", zValidator("json", RefreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid("json");

  let decoded;
  try {
    decoded = await verifyToken(refreshToken);
  } catch {
    return errorResponse(c, new ApiError(401, "Invalid or expired refresh token.", "TOKEN_EXPIRED"));
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored) {
    return errorResponse(c, new ApiError(401, "Refresh token revoked.", "TOKEN_REVOKED"));
  }

  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const newPayload = { sub: decoded.sub!, name: decoded.name, role: decoded.role } as const;
  const [newAccess, newRefresh] = await Promise.all([
    signAccessToken(newPayload),
    signRefreshToken(newPayload),
  ]);

  await prisma.refreshToken.create({
    data: {
      token: newRefresh,
      sub: stored.sub,
      role: stored.role,
      userId: stored.userId,
      adminId: stored.adminId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return successResponse(c, {
    tokens: { accessToken: newAccess, refreshToken: newRefresh, expiresIn: 15 * 60 },
  });
});

// POST /api/auth/logout
auth.post("/logout", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  if (body?.refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: body.refreshToken } });
  }
  return successResponse(c, { message: "Logged out successfully" });
});

// GET /api/auth/me
auth.get("/me", requireAuth, async (c) => {
  const payload = c.get("tokenPayload");

  if (payload.role === "admin") {
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });
    if (!admin) return errorResponse(c, new ApiError(404, "Admin not found", "NOT_FOUND"));
    return successResponse(c, {
      user: { id: admin.id, name: admin.name, identifier: admin.identifier, role: asRole(admin.role) },
    });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return errorResponse(c, new ApiError(404, "User not found", "NOT_FOUND"));

  return successResponse(c, {
    user: { id: user.id, name: user.name, identifier: user.identifier, role: asRole(user.role) },
  });
});

app.route("/auth", auth);

// ── Parts CRUD ─────────────────────────────────────────────────────────────────
const parts = new Hono<HonoEnv>();

// GET /api/parts — list with search, filter, sort, pagination (public)
parts.get("/", zValidator("query", ListPartsSchema), async (c) => {
  const { search, category, brand, sortBy, sortDir, page, limit } = c.req.valid("query");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (brand)    where.brand    = brand;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku:  { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.part.count({ where }),
    prisma.part.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return successResponse(c, {
    parts: items.map(serializePart),
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

// GET /api/parts/featured — featured parts for homepage (public)
parts.get("/featured", async (c) => {
  const items = await prisma.part.findMany({
    where: { isFeatured: true, stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return successResponse(c, { parts: items.map(serializePart) });
});

// GET /api/parts/:id — single part (public)
parts.get("/:id", async (c) => {
  const part = await prisma.part.findUnique({ where: { id: c.req.param("id") } });
  if (!part) return errorResponse(c, new ApiError(404, "Part not found", "NOT_FOUND"));
  return successResponse(c, { part: serializePart(part) });
});

// POST /api/parts — admin only
parts.post("/", requireAuth, requireAdmin, zValidator("json", CreatePartSchema), async (c) => {
  const data = c.req.valid("json");
  const sku  = `SKU-${Date.now().toString().slice(-8)}`;

  const part = await prisma.part.create({
    data: { ...data, sku, price: data.price, mrp: data.mrp },
  });

  // Fire stock alert immediately if new part is already low/out
  await maybeCreateStockAlert(part.id, part.name, part.stock, part.minStock, null);

  return successResponse(c, { part: serializePart(part) }, 201);
});

// PUT /api/parts/:id — admin only
parts.put("/:id", requireAuth, requireAdmin, zValidator("json", UpdatePartSchema), async (c) => {
  const id   = c.req.param("id");
  const data = c.req.valid("json");

  const existing = await prisma.part.findUnique({ where: { id } });
  if (!existing) return errorResponse(c, new ApiError(404, "Part not found", "NOT_FOUND"));

  const part = await prisma.part.update({ where: { id }, data });

  // Check stock threshold after update
  const prevStock = existing.stock;
  const newStock  = part.stock;
  const minStock  = part.minStock;
  // Only alert when stock transitions into a threshold band (not on every edit)
  const wasOk     = prevStock > minStock;
  const nowLow    = newStock > 0 && newStock <= minStock;
  const nowOut    = newStock === 0;
  if (wasOk && (nowLow || nowOut)) {
    await maybeCreateStockAlert(part.id, part.name, newStock, minStock, null);
  } else if (data.stock !== undefined) {
    // Always check if stock was explicitly set to a threshold value
    await maybeCreateStockAlert(part.id, part.name, newStock, minStock, prevStock);
  }

  return successResponse(c, { part: serializePart(part) });
});

// DELETE /api/parts/:id — admin only
parts.delete("/:id", requireAuth, requireAdmin, async (c) => {
  const id = c.req.param("id");
  const existing = await prisma.part.findUnique({ where: { id } });
  if (!existing) return errorResponse(c, new ApiError(404, "Part not found", "NOT_FOUND"));

  await prisma.part.delete({ where: { id } });
  return successResponse(c, { message: "Part deleted successfully" });
});

// ── Stock alert helper ─────────────────────────────────────────────────────────
async function maybeCreateStockAlert(
  partId: string,
  partName: string,
  stock: number,
  minStock: number,
  prevStock: number | null
) {
  const isOutOfStock = stock === 0;
  const isLowStock   = stock > 0 && stock <= minStock;

  if (!isOutOfStock && !isLowStock) return;

  // Avoid duplicate notifications: skip if same type already unread for this part
  const type = isOutOfStock ? "out_of_stock" : "low_stock";
  const exists = await prisma.notification.findFirst({
    where: { partId, type, isRead: false },
  });
  if (exists && prevStock !== null) return; // already notified

  const title   = isOutOfStock ? `Out of Stock: ${partName}` : `Low Stock Alert: ${partName}`;
  const message = isOutOfStock
    ? `${partName} is now out of stock. Restock immediately to avoid lost sales.`
    : `${partName} has only ${stock} unit${stock === 1 ? "" : "s"} left (threshold: ${minStock}). Consider restocking soon.`;

  await prisma.notification.create({ data: { type, title, message, partId } });
  console.info(`[STOCK ALERT] ${type} — ${partName} (stock: ${stock})`);
}

function serializePart(p: {
  id: string; sku: string; name: string; description: string;
  category: string; brand: string; price: unknown; mrp: unknown;
  stock: number; minStock: number; images: string[]; compatibleBikes: string[];
  rating: unknown; reviewCount: number; isFeatured: boolean; isSale: boolean;
  createdAt: Date; updatedAt: Date;
}) {
  return {
    ...p,
    price:     Number(p.price),
    mrp:       Number(p.mrp),
    rating:    Number(p.rating),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

app.route("/parts", parts);

// ── Notifications (admin in-app) ───────────────────────────────────────────────
const notifications = new Hono<HonoEnv>();

// GET /api/notifications — list, newest first (admin only)
notifications.get("/", requireAuth, requireAdmin, async (c) => {
  const onlyUnread = c.req.query("unread") === "true";
  const where = onlyUnread ? { isRead: false } : {};

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);

  return successResponse(c, { notifications: items, unreadCount });
});

// PATCH /api/notifications/read-all — must be before /:id/read to avoid param collision
notifications.patch("/read-all", requireAuth, requireAdmin, async (c) => {
  await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
  return successResponse(c, { message: "All notifications marked as read" });
});

// PATCH /api/notifications/:id/read — mark single as read (admin only)
notifications.patch("/:id/read", requireAuth, requireAdmin, async (c) => {
  const id = c.req.param("id");
  const n  = await prisma.notification.findUnique({ where: { id } });
  if (!n) return errorResponse(c, new ApiError(404, "Notification not found", "NOT_FOUND"));

  await prisma.notification.update({ where: { id }, data: { isRead: true } });
  return successResponse(c, { message: "Marked as read" });
});

app.route("/notifications", notifications);

// ── Brands CRUD ────────────────────────────────────────────────────────────────
const brands = new Hono<HonoEnv>();

// GET /api/brands — list active brands, sorted (public)
brands.get("/", async (c) => {
  const all = c.req.query("all") === "true"; // admin can pass ?all=true to see inactive
  const where = all ? {} : { isActive: true };
  const items = await prisma.brand.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return successResponse(c, { brands: items });
});

// POST /api/brands — admin only
brands.post("/", requireAuth, requireAdmin, zValidator("json", CreateBrandSchema), async (c) => {
  const data = c.req.valid("json");
  const existing = await prisma.brand.findUnique({ where: { name: data.name } });
  if (existing) return errorResponse(c, new ApiError(409, "Brand with this name already exists.", "BRAND_EXISTS"));
  const brand = await prisma.brand.create({ data });
  return successResponse(c, { brand }, 201);
});

// PUT /api/brands/:id — admin only
brands.put("/:id", requireAuth, requireAdmin, zValidator("json", UpdateBrandSchema), async (c) => {
  const id   = c.req.param("id");
  const data = c.req.valid("json");
  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) return errorResponse(c, new ApiError(404, "Brand not found", "NOT_FOUND"));
  if (data.name && data.name !== existing.name) {
    const nameConflict = await prisma.brand.findUnique({ where: { name: data.name } });
    if (nameConflict) return errorResponse(c, new ApiError(409, "Brand with this name already exists.", "BRAND_EXISTS"));
  }
  const brand = await prisma.brand.update({ where: { id }, data });
  return successResponse(c, { brand });
});

// DELETE /api/brands/:id — admin only
brands.delete("/:id", requireAuth, requireAdmin, async (c) => {
  const id = c.req.param("id");
  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) return errorResponse(c, new ApiError(404, "Brand not found", "NOT_FOUND"));
  await prisma.brand.delete({ where: { id } });
  return successResponse(c, { message: "Brand deleted successfully" });
});

app.route("/brands", brands);

app.onError((err, c) => errorResponse(c, err));

app.notFound((c) =>
  c.json({ ok: false, error: { code: "NOT_FOUND", message: "Route not found" } }, 404)
);

export const GET    = handle(app);
export const POST   = handle(app);
export const PUT    = handle(app);
export const DELETE = handle(app);
export const PATCH  = handle(app);
