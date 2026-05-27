import { z } from "zod";

export const CreateBrandSchema = z.object({
  name:      z.string().min(1).max(100),
  initials:  z.string().min(1).max(10),
  color:     z.string().min(1).max(100),
  isActive:  z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateBrandSchema = CreateBrandSchema.partial();

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>;
