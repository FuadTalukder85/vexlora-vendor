import { create } from "zustand";
import { VendorProfile, VendorUser } from "@/types/vendor";

interface VendorState {
  user: VendorUser | null;
  profile: VendorProfile | null;
  isSidebarOpen: boolean;
  isLoading: boolean;
  setUser: (user: VendorUser | null) => void;
  setProfile: (profile: VendorProfile | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useVendorStore = create<VendorState>((set) => ({
  user: {
    id: "v-user-1",
    name: "Apex Electronics",
    email: "vendor@apexelectronics.com",
    role: "VENDOR",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  },
  profile: {
    id: "v-prof-1",
    userId: "v-user-1",
    storeName: "Apex Electronics Store",
    slug: "apex-electronics",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
    bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200",
    description: "Official flag-ship store for high-end gaming laptops, accessories and premium audio gear.",
    contactEmail: "support@apexelectronics.com",
    contactPhone: "+1 (555) 234-5678",
    status: "APPROVED",
    rating: 4.9,
    totalSales: 1420,
    commissionRate: 8.5,
    createdAt: "2025-01-15T00:00:00Z",
  },
  isSidebarOpen: true,
  isLoading: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));
