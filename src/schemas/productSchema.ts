import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  category: z.string().min(1, "Category is required"),
  basePrice: z.number().positive("Price must be a positive number"),
  compareAtPrice: z.number().positive("Compare price must be positive").optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  status: z.enum(["ACTIVE", "DRAFT", "OUT_OF_STOCK", "REJECTED"]),
  images: z.array(z.string().url("Must be a valid image URL")).min(1, "At least 1 product image URL is required"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
