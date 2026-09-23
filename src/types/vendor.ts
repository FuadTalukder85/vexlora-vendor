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
  isOwner?: boolean;
  tenantId?: string | null;
  permissions?: string[];
  vendorProfile?: VendorProfile;
}

export type ModuleScope = "ADMIN" | "VENDOR" | "BOTH";

export interface Permission {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  category: string;
  scope: ModuleScope;
  isActive: boolean;
}

export interface UserPermissionRecord {
  id: string;
  userId: string;
  permissionId: string;
  tenantId?: string | null;
  permission: Permission;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  createdAt: string;
  lastLoginAt?: string | null;
  userPermissions?: UserPermissionRecord[];
  userRoles?: Array<{
    id: string;
    role: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export interface CreateVendorStaffPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface AssignStaffPermissionsPayload {
  staffUserId: string;
  permissions: string[];
}

export interface UserEffectivePermissions {
  userId: string;
  role: string;
  isOwner: boolean;
  tenantId?: string | null;
  permissions: string[];
  categories: string[];
}

