export type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";

export interface VendorProfile {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  status: VendorStatus;
  rating: number;
  totalSales: number;
  commissionRate: number; // percentage e.g. 10.0
  createdAt: string;
}

export interface VendorUser {
  id: string;
  name: string;
  email: string;
  role: "VENDOR" | "ADMIN";
  image?: string;
  vendorProfile?: VendorProfile;
}
