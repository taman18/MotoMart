import { z } from "zod";

const CATEGORIES = ["Brakes", "Engine Parts", "Electrical", "Filters", "Body Parts", "Tyres & Tubes", "Oils & Lubricants"] as const;
const BRANDS = ["Honda", "Hero", "Bajaj", "TVS", "Yamaha", "Suzuki", "Royal Enfield", "Universal"] as const;

export const CreatePartSchema = z.object({
  name:           z.string().min(2).max(200),
  description:    z.string().max(2000).default(""),
  category:       z.enum(CATEGORIES),
  brand:          z.enum(BRANDS),
  price:          z.number().positive(),
  mrp:            z.number().positive(),
  stock:          z.number().int().min(0),
  minStock:       z.number().int().min(0).default(10),
  images:         z.array(z.string().url()).default([]),
  compatibleBikes: z.array(z.string()).default([]),
  isFeatured:     z.boolean().default(false),
  isSale:         z.boolean().default(false),
});

export const UpdatePartSchema = CreatePartSchema.partial();

export const ListPartsSchema = z.object({
  search:   z.string().optional(),
  category: z.enum(CATEGORIES).optional(),
  brand:    z.enum(BRANDS).optional(),
  sortBy:   z.enum(["name", "price", "stock", "createdAt"]).default("createdAt"),
  sortDir:  z.enum(["asc", "desc"]).default("desc"),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
});

export type CreatePartInput = z.infer<typeof CreatePartSchema>;
export type UpdatePartInput = z.infer<typeof UpdatePartSchema>;
export type ListPartsQuery  = z.infer<typeof ListPartsSchema>;
