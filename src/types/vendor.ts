export type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
export type UserRole = "CUSTOMER" | "VENDOR" | "ADMIN" | "SUPER_ADMIN";

export interface VendorDocument {
  id?: string;
  type: string;
  url: string;
}

export interface VendorProfile {
  id: string;
  userId: string;
  storeName: string;
  storeSlug?: string;
  slug?: string;
  storeLogo?: string | null;
  logoUrl?: string | null;
  storeBanner?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  stripeAccountId?: string | null;
  contactEmail?: string;
  contactPhone?: string | null;
  status: VendorStatus;
  rating?: number;
  totalSales?: number;
  commissionRate?: number;
  documents?: VendorDocument[];
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  image?: string | null;
  status?: string;
  vendorProfile?: VendorProfile;
}
