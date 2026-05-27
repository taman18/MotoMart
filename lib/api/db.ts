import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma";

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Singleton — prevents multiple connections during Next.js hot reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const MAX_OTP_ATTEMPTS = 3;
export const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Re-export types that route.ts uses
export type { User as UserRecord, Admin as AdminRecord, Otp as OtpRecord } from "@/lib/generated/prisma";
