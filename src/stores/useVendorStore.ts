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
}

export const useVendorStore = create<VendorState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialChecking: true,
  isSidebarOpen: true,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      if (typeof window !== "undefined") {
        const token =
          localStorage.getItem("vexlora_vendor_token") ||
          localStorage.getItem("vexlora_token");
        if (token) {
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      }

      const userRes = await apiClient.get("/users/me");
      const userData = userRes.data?.data as VendorUser;

      if (!userData) {
        throw new Error("No user found");
      }

      // Check role: Customers are strictly prohibited from vendor portal
      const isVendorOrAdmin =
        userData.role === "VENDOR" ||
        userData.role === "ADMIN" ||
        userData.role === "SUPER_ADMIN";

      if (!isVendorOrAdmin) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("vexlora_vendor_token");
          localStorage.removeItem("vexlora_token");
          delete apiClient.defaults.headers.common["Authorization"];
        }
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isInitialChecking: false,
          isLoading: false,
          error: "Access restricted to vendor accounts only.",
        });
        return;
      }

      let profileData: VendorProfile | null = null;
      try {
        const profileRes = await apiClient.get("/vendor-profiles/me");
        profileData = profileRes.data?.data as VendorProfile;
      } catch {
        // User might not have created a profile yet
      }

      set({
        user: userData,
        profile: profileData,
        isAuthenticated: true,
        isInitialChecking: false,
        isLoading: false,
        error: null,
      });
    } catch {
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isInitialChecking: false,
        isLoading: false,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(
        `${AUTH_BASE_URL}/sign-in/email`,
        { email, password },
        { withCredentials: true }
      );

      const token = res.data?.token || res.data?.session?.token || res.data?.sessionToken;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("vexlora_vendor_token", token);
        localStorage.setItem("vexlora_token", token);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      await get().fetchProfile();

      const user = get().user;
      const profile = get().profile;

      if (!user) {
        throw new Error(
          get().error || "Failed to fetch user profile after login."
        );
      }

      // Role check enforcement
      const isVendorOrAdmin =
        user.role === "VENDOR" ||
        user.role === "ADMIN" ||
        user.role === "SUPER_ADMIN";

      if (!isVendorOrAdmin) {
        await get().logout();
        throw new Error(
          "Access denied. Only registered vendor accounts can access the Merchant Portal. Customer accounts are not permitted."
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
      // 1. Register User with VENDOR role
      const signUpRes = await axios.post(
        `${AUTH_BASE_URL}/sign-up/email`,
        {
          name: payload.storeName,
          email: payload.email,
          password: payload.password,
          phone: payload.phone,
          role: "VENDOR",
        },
        { withCredentials: true }
      );

      const token = signUpRes.data?.token || signUpRes.data?.session?.token || signUpRes.data?.sessionToken;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("vexlora_vendor_token", token);
        localStorage.setItem("vexlora_token", token);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      // 2. Submit Vendor Profile Application
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
      await axios.post(`${AUTH_BASE_URL}/sign-out`, {}, { withCredentials: true });
    } catch {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("vexlora_vendor_token");
        localStorage.removeItem("vexlora_token");
        delete apiClient.defaults.headers.common["Authorization"];
      }
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
}));
