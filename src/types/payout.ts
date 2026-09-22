export type PayoutStatus = "UNPAID" | "PROCESSING" | "PAID" | "FAILED";

export interface PayoutSubOrderInfo {
  id: string;
  orderId: string;
  subtotal: number | string;
  commissionAmount: number | string;
  vendorEarning: number | string;
  status: string;
  payoutStatus: PayoutStatus;
  deliveredAt?: string | null;
  order?: {
    id: string;
    orderNumber: string;
    paymentStatus: string;
    createdAt: string;
  };
}

export interface PayoutSubOrderJoin {
  payoutId: string;
  subOrderId: string;
  createdAt?: string;
  subOrder: PayoutSubOrderInfo;
}

export interface PayoutVendor {
  id: string;
  storeName: string;
  storeSlug?: string;
  storeLogo?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  stripeAccountId?: string | null;
}

export interface PayoutRecord {
  id: string;
  vendorId: string;
  amount: number | string;
  status: PayoutStatus;
  stripeTransferId?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  vendor?: PayoutVendor;
  subOrders: PayoutSubOrderJoin[];
}

export interface VendorPayoutItem {
  id: string;
  vendorId: string;
  amount: number;
  status: PayoutStatus;
  stripeTransferId?: string | null;
  processedAt?: string | null;
  createdAt: string;
  subOrdersCount: number;
  subOrders: PayoutSubOrderJoin[];
}

export interface VendorPayoutStatistics {
  totalEarnings: number;
  totalPaidOut: number;
  pendingPayoutAmount: number;
  availableBalance: number;
  eligibleSubOrdersCount: number;
  hasPayoutMethod: boolean;
}

export interface StripeConnectStatus {
  hasAccount: boolean;
  detailsSubmitted: boolean;
  payoutsEnabled: boolean;
  accountId?: string | null;
  defaultCurrency?: string;
}

export interface RequestPayoutPayload {
  subOrderIds?: string[];
  notes?: string;
}

export interface VendorPayoutQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UpdateVendorBankingPayload {
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
}
