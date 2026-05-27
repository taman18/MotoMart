import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_BRANDS = [
  { name: "Honda",         initials: "H",   color: "border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20",           sortOrder: 0 },
  { name: "Hero",          initials: "He",  color: "border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20",         sortOrder: 1 },
  { name: "Bajaj",         initials: "Bj",  color: "border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20", sortOrder: 2 },
  { name: "TVS",           initials: "TVS", color: "border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20",     sortOrder: 3 },
  { name: "Yamaha",        initials: "Y",   color: "border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20", sortOrder: 4 },
  { name: "Suzuki",        initials: "Sz",  color: "border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20", sortOrder: 5 },
  { name: "Royal Enfield", initials: "RE",  color: "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/40",         sortOrder: 6 },
  { name: "Universal",     initials: "U",   color: "border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20",         sortOrder: 7 },
];

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "MotoMart@2024";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { identifier: username },
    update: { passwordHash },
    create: {
      name: "Admin",
      identifier: username,
      passwordHash,
      role: "admin",
    },
  });

  console.log(`Admin seeded: ${username}`);

  for (const brand of DEFAULT_BRANDS) {
    await prisma.brand.upsert({
      where: { name: brand.name },
      update: { initials: brand.initials, color: brand.color, sortOrder: brand.sortOrder },
      create: { ...brand, isActive: true },
    });
  }

  console.log(`${DEFAULT_BRANDS.length} default brands seeded.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
