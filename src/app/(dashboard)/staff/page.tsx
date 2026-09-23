"use client";

import React from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { useVendorStaff } from "@/hooks/useVendorStaff";
import { useVendorStore } from "@/stores/useVendorStore";
import { Button } from "@/components/ui/Button";
import { StaffStats } from "./components/StaffStats";
import { StaffTable } from "./components/StaffTable";

export default function VendorStaffPage() {
  const {
    staffList,
    availablePermissions,
    isLoading,
    error,
  } = useVendorStaff();

  const { isOwner } = useVendorStore();
  const categories = Array.from(new Set(availablePermissions.map((p) => p.category)));

  return (
    <PermissionGuard requiredPermission="staff:read">
      <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
        {/* Header Section */}
        <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">
              Store Staff & Team
            </h1>
            <p className="text-sm text-secondary">
              Invite store employees and delegate granular access permissions for products, orders, coupons, and payouts.
            </p>
          </div>

          {isOwner && (
            <Link href="/staff/create">
              <Button className="gap-2 cursor-pointer">
                <UserPlus className="w-4 h-4" />
                Add Staff Member
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <div className="shrink-0 p-4 rounded-xl bg-highlight/10 border border-highlight/20 text-highlight text-sm">
            {error}
          </div>
        )}

        {/* Stats Section */}
        <div className="shrink-0">
          <StaffStats
            totalStaff={staffList.length}
            totalCapabilities={availablePermissions.length}
            totalCategories={categories.length}
          />
        </div>

        {/* Staff Table Section */}
        <StaffTable staffList={staffList} isLoading={isLoading} />
      </div>
    </PermissionGuard>
  );
}
