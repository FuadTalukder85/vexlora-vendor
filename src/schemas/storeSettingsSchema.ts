import { z } from "zod";

export const storeSettingsSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().min(10, "Store description must be at least 10 characters"),
  contactEmail: z.string().email("Valid contact email is required"),
  contactPhone: z.string().min(5, "Valid phone number is required"),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  bannerUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;
