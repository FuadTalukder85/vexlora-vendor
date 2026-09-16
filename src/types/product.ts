export type ProductStatus = "ACTIVE" | "DRAFT" | "OUT_OF_STOCK" | "REJECTED";

export interface ProductVariant {
  id?: string;
  sku: string;
  attributes: Record<string, any>;
  price: number;
  stock: number;
  image?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  image?: string | null;
  children?: Category[];
}

export interface Product {
  id: string;
  vendorId?: string;
  title: string;
  slug: string;
  description?: string | null;
  categoryId?: string | null;
  category?: Category | { id: string; name: string } | string;
  brand?: string | null;
  basePrice: number;
  discountPrice?: number | null;
  compareAtPrice?: number | null;
  totalStock: number;
  stock?: number;
  status: ProductStatus;
  images: string[];
  tags: string[];
  variants?: ProductVariant[];
  salesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductInput {
  title: string;
  slug?: string;
  description?: string | null;
  categoryId?: string | null;
  brand?: string | null;
  basePrice: number;
  discountPrice?: number | null;
  totalStock?: number;
  status?: ProductStatus;
  images: string[];
  tags?: string[];
  variants?: ProductVariant[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}
