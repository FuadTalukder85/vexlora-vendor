import { z } from "zod";

export const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  attributes: z.record(z.string(), z.any()).optional(),
  price: z.number().positive("Variant price must be greater than 0"),
  stock: z.number().int().nonnegative("Variant stock cannot be negative"),
  image: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});

export const productSchema = z
  .object({
    title: z.string().min(2, "Product title must be at least 2 characters long"),
    slug: z.string().optional(),
    description: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    brand: z.string().optional().nullable(),
    basePrice: z.number().positive("Base price must be greater than 0"),
    discountPrice: z.number().positive("Discount price must be positive").nullable().optional(),
    totalStock: z.number().int().nonnegative("Stock cannot be negative"),
    status: z.enum(["ACTIVE", "DRAFT", "OUT_OF_STOCK", "REJECTED"]),
    images: z
      .array(z.string().url("Must be a valid image URL"))
      .min(1, "At least 1 product image URL is required"),
    tags: z.array(z.string()),
    variants: z.array(variantSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.discountPrice !== undefined && data.discountPrice !== null) {
        return data.discountPrice < data.basePrice;
      }
      return true;
    },
    {
      message: "Discount price must be less than base price",
      path: ["discountPrice"],
    }
  );

export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantFormValues = z.infer<typeof variantSchema>;
