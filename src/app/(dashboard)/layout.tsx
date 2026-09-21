"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useVendorStore } from "@/stores/useVendorStore";
import { cn } from "@/lib/utils";
import { Clock, ShieldAlert } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    isSidebarOpen,
    user,
    profile,
    isAuthenticated,
    isInitialChecking,
    fetchProfile,
  } = useVendorStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!isInitialChecking) {
      const isAuthorized =
        isAuthenticated &&
        user &&
        user.role === "VENDOR" &&
        user.status !== "BLOCKED";

      if (!isAuthorized) {
        router.replace("/login");
      }
    }
  }, [isInitialChecking, isAuthenticated, user, router]);

  // Prevent any protected route UI from rendering before auth is verified
  if (
    isInitialChecking ||
    !isAuthenticated ||
    !user ||
    user.role !== "VENDOR" ||
    user.status === "BLOCKED"
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Container */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 min-h-screen",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        <Header />

        {/* Pending Approval Notice Banner */}
        {profile?.status === "PENDING" && (
          <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between text-xs font-medium shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                <strong>Store Application Status: Pending Admin Review.</strong> Your profile (
                {profile.storeName}) is being processed. Full catalog permissions unlock upon approval.
              </span>
            </div>
            <span className="hidden sm:inline bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
              Under Review
            </span>
          </div>
        )}

        {user?.status === "BLOCKED" && (
          <div className="bg-highlight text-white px-4 py-2.5 flex items-center gap-2 text-xs font-medium shadow-sm">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              <strong>Account Suspended:</strong> Your merchant account access has been restricted. Please contact Vexlora merchant support.
            </span>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1800px] w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
