export type PayoutStatus = "UNPAID" | "PROCESSING" | "PAID" | "FAILED";

export interface PayoutRecord {
  id: string;
  vendorId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  periodStart: string;
  periodEnd: string;
  payoutDate?: string;
  bankAccountLast4?: string;
  createdAt: string;
}

export interface VendorFinancials {
  totalRevenue: number;
  commissionPaid: number;
  availableBalance: number;
  pendingBalance: number;
  lastPayoutDate?: string;
  payoutHistory: PayoutRecord[];
}
