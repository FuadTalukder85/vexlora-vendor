export type CouponScope = "platform" | "vendor";
export type DiscountType = "percentage" | "flat";

export interface VendorCoupon {
  id: string;
  code: string;
  scope: CouponScope;
  vendorId?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minPurchase?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    usageLogs: number;
  };
}

export interface CreateVendorCouponPayload {
  code: string;
  scope: "vendor";
  discountType: DiscountType;
  discountValue: number;
  minPurchase?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  isActive?: boolean;
}

export interface UpdateVendorCouponPayload {
  code?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minPurchase?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  isActive?: boolean;
}
