export type SubOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SubOrder {
  id: string;
  parentOrderId: string;
  vendorId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  commissionFee: number;
  netPayout: number;
  status: SubOrderStatus;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}
