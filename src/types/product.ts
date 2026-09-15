export type ProductStatus = "ACTIVE" | "DRAFT" | "OUT_OF_STOCK" | "REJECTED";

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes?: Record<string, string>;
}

export interface Product {
  id: string;
  vendorId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number;
  compareAtPrice?: number;
  stock: number;
  status: ProductStatus;
  images: string[];
  variants?: ProductVariant[];
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  title: string;
  description: string;
  category: string;
  basePrice: number;
  compareAtPrice?: number;
  stock: number;
  status: ProductStatus;
  images: string[];
}
