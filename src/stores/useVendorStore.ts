import { create } from "zustand";
import axios from "axios";
import { VendorProfile, VendorUser } from "@/types/vendor";
import { apiClient, AUTH_BASE_URL } from "@/lib/api-client";

interface VendorState {
  user: VendorUser | null;
  profile: VendorProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialChecking: boolean;
  isSidebarOpen: boolean;
  error: string | null;
  permissions: string[];
  permissionCategories: string[];
  isOwner: boolean;

  // Actions
  setUser: (user: VendorUser | null) => void;
  setProfile: (profile: VendorProfile | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  fetchProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ user: VendorUser; profile: VendorProfile | null }>;
  registerVendor: (payload: {
    storeName: string;
    email: string;
    password: string;
    phone?: string;
    description?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (key: string) => boolean;
  hasAnyPermission: (keys: string[]) => boolean;
  hasAllPermissions: (keys: string[]) => boolean;
}

export const useVendorStore = create<VendorState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialChecking: true,
  isSidebarOpen: true,
  error: null,
  permissions: [],
  permissionCategories: [],
  isOwner: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  hasPermission: (requiredPermission: string): boolean => {
    const { permissions, isOwner, user } = get();
    if (!user) return false;
    // Store owner has full access across vendor modules
    if (isOwner || user.isOwner) {
      return true;
    }
    const normalizedReq = requiredPermission.toLowerCase().trim();
    if (permissions.includes(normalizedReq)) return true;
    const [resource] = normalizedReq.split(":");
    if (permissions.includes(`${resource}:*`)) return true;
    return false;
  },

  hasAnyPermission: (keys: string[]): boolean => {
    const { hasPermission } = get();
    return keys.some((key) => hasPermission(key));
  },

  hasAllPermissions: (keys: string[]): boolean => {
    const { hasPermission } = get();
    return keys.every((key) => hasPermission(key));
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      let token: string | null = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("vexlora_vendor_token");
        if (token) {
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      }

      // Fast check: if no vendor token exists in localStorage or document.cookie, fail fast
      const hasVendorCookie =
        typeof document !== "undefined" &&
        document.cookie.includes("vexlora_vendor_token");

      if (!token && !hasVendorCookie) {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isInitialChecking: false,
          isLoading: false,
          permissions: [],
          permissionCategories: [],
          isOwner: true,
        });
        return;
      }

      const userRes = await apiClient.get("/users/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const userData = userRes.data?.data as VendorUser;

      if (!userData) {
        throw new Error("No user found");
      }

      // Strict Vendor Role Enforcement: VENDOR ONLY. Admins and Customers are not allowed.
      if (userData.role !== "VENDOR") {
        if (typeof window !== "undefined") {
          localStorage.removeItem("vexlora_vendor_token");
          localStorage.removeItem("vexlora_vendor_user");
          localStorage.removeItem("vexlora_vendor_profile");
          delete apiClient.defaults.headers.common["Authorization"];
        }
        if (typeof document !== "undefined") {
          document.cookie = "vexlora_vendor_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        }
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isInitialChecking: false,
          isLoading: false,
          error: "Access restricted to vendor accounts only.",
          permissions: [],
          permissionCategories: [],
          isOwner: true,
        });
        return;
      }

      let profileData: VendorProfile | null = null;
      try {
        const profileRes = await apiClient.get("/vendor-profiles/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        profileData = profileRes.data?.data as VendorProfile;
      } catch {
        // Profile may not exist yet
      }

      // Fetch RBAC effective permissions
      let resolvedPermissions: string[] = [];
      let resolvedCategories: string[] = [];
      const userIsOwner = userData.isOwner !== false;

      try {
        const permRes = await apiClient.get("/rbac/me/permissions", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const permData = permRes.data?.data;
        if (permData?.permissions) {
          resolvedPermissions = permData.permissions;
          resolvedCategories = permData.categories || [];
        }
      } catch {
        // Fallback
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("vexlora_vendor_user", JSON.stringify(userData));
        if (profileData) {
          localStorage.setItem("vexlora_vendor_profile", JSON.stringify(profileData));
        }
      }

      set({
        user: { ...userData, isOwner: userIsOwner, permissions: resolvedPermissions },
        profile: profileData,
        isAuthenticated: true,
        isInitialChecking: false,
        isLoading: false,
        error: null,
        permissions: resolvedPermissions,
        permissionCategories: resolvedCategories,
        isOwner: userIsOwner,
      });
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("vexlora_vendor_token");
        localStorage.removeItem("vexlora_vendor_user");
        localStorage.removeItem("vexlora_vendor_profile");
      }
      if (typeof document !== "undefined") {
        document.cookie = "vexlora_vendor_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
      delete apiClient.defaults.headers.common["Authorization"];

      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isInitialChecking: false,
        isLoading: false,
        permissions: [],
        permissionCategories: [],
        isOwner: true,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(
        `${AUTH_BASE_URL}/sign-in/email`,
        { email, password }
      );

      const token = res.data?.token || res.data?.session?.token || res.data?.sessionToken;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("vexlora_vendor_token", token);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      if (typeof document !== "undefined") {
        const cookieVal = token || "authenticated";
        document.cookie = `vexlora_vendor_token=${cookieVal}; path=/; max-age=86400; SameSite=Lax`;
      }

      await get().fetchProfile();

      const user = get().user;
      const profile = get().profile;

      if (!user) {
        throw new Error(
          get().error || "Failed to fetch user profile after login."
        );
      }

      // Strict role check: ONLY VENDOR
      if (user.role !== "VENDOR") {
        await get().logout();
        throw new Error(
          "Access denied. Only registered vendor accounts can access the Merchant Portal."
        );
      }

      set({ isLoading: false });
      return { user, profile };
    } catch (err: unknown) {
      set({ isLoading: false });
      let message = "Invalid email or password.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message });
      throw new Error(message);
    }
  },

  registerVendor: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const signUpRes = await axios.post(
        `${AUTH_BASE_URL}/sign-up/email`,
        {
          name: payload.storeName,
          email: payload.email,
          password: payload.password,
          phone: payload.phone,
          role: "VENDOR",
        }
      );

      const token = signUpRes.data?.token || signUpRes.data?.session?.token || signUpRes.data?.sessionToken;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("vexlora_vendor_token", token);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      if (typeof document !== "undefined") {
        const cookieVal = token || "authenticated";
        document.cookie = `vexlora_vendor_token=${cookieVal}; path=/; max-age=86400; SameSite=Lax`;
      }

      const slug = payload.storeName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");

      await apiClient.post("/vendor-profiles/apply", {
        storeName: payload.storeName,
        storeSlug: slug,
        description: payload.description || undefined,
        bankAccountName: payload.bankAccountName || undefined,
        bankAccountNumber: payload.bankAccountNumber || undefined,
        bankName: payload.bankName || undefined,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      await get().fetchProfile();
      set({ isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false });
      let message = "Failed to register merchant account.";
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      set({ error: message });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("vexlora_vendor_token");
        localStorage.removeItem("vexlora_vendor_user");
        localStorage.removeItem("vexlora_vendor_profile");
      }
      if (typeof document !== "undefined") {
        document.cookie = "vexlora_vendor_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
      delete apiClient.defaults.headers.common["Authorization"];
    } finally {
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isInitialChecking: false,
        isLoading: false,
        error: null,
        permissions: [],
        permissionCategories: [],
        isOwner: true,
      });
    }
  },
}));
