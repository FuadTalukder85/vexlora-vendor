export interface CouponUsageLog {
  id: string;
  couponCode: string;
  userId: string;
  orderId?: string | null;
  discountAmount?: number | null;
  deviceId?: string | null;
  ipAddress?: string | null;
  phone?: string | null;
  paymentFingerprint?: string | null;
  deliveryAddress?: string | null;
  usedAt: string;
  createdAt: string;
  updatedAt: string;
  coupon?: {
    id: string;
    code: string;
    scope: string;
    discountType: string;
    discountValue: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    paymentStatus: string;
  };
}
