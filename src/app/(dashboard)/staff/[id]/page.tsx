"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, CheckCircle2, RefreshCw } from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { useVendorStaff } from "@/hooks/useVendorStaff";
import { useVendorStore } from "@/stores/useVendorStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DualPanePermissionMatrix } from "../components/DualPanePermissionMatrix";
import { StaffFormSkeleton } from "../components/StaffFormSkeleton";
import { StaffMember } from "@/types/vendor";

export default function ManageStaffPermissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const staffUserId = resolvedParams.id;
  const router = useRouter();

  const {
    staffList,
    availablePermissions,
    getStaffPermissions,
    assignPermissions,
    isSaving,
  } = useVendorStaff();

  const { isOwner } = useVendorStore();

  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoadingDetails(true);
      try {
        const targetStaff = staffList.find((s) => s.id === staffUserId);
        if (targetStaff && isMounted) {
          setStaff(targetStaff);
        }

        const userPerms = await getStaffPermissions(staffUserId);
        if (Array.isArray(userPerms) && isMounted) {
          const keys = userPerms
            .map((up: { permission?: { key: string }; key?: string }) =>
              up.permission ? up.permission.key : up.key || ""
            )
            .filter(Boolean);
          setSelectedPermissions(keys);
        }
      } finally {
        if (isMounted) {
          setIsLoadingDetails(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [staffUserId, staffList, getStaffPermissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignPermissions({
        staffUserId,
        permissions: selectedPermissions,
      });

      router.push("/staff");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update permissions";
      setFormError(msg);
    }
  };

  if (isLoadingDetails && !staff) {
    return (
      <PermissionGuard requiredPermission="staff:read">
        <StaffFormSkeleton />
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredPermission="staff:read">
      <div className="space-y-6 w-full">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link href="/staff">
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Back to Staff
            </Button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-primary">
                  {staff?.name || "Staff Member"}
                </h1>
                <Badge variant={staff?.status === "ACTIVE" ? "success" : "danger"}>
                  {staff?.status || "ACTIVE"}
                </Badge>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                {staff?.email} {staff?.phone && `• ${staff.phone}`}
              </p>
            </div>
          </div>

          <Badge variant="neutral" className="text-xs font-semibold">
            {selectedPermissions.length} Active Capabilities
          </Badge>
        </div>

        {formError && (
          <div className="p-4 bg-highlight/10 border border-highlight/20 text-highlight text-xs rounded-xl">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {/* Two-Side Permission Assignment Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-border space-y-3 shadow-xs w-full">
            <div>
              <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
                Configure Delegated Permissions
              </h2>
              <p className="text-[11px] text-secondary">
                Toggle permissions on the left to assign them, or toggle on the right to remove.
              </p>
            </div>

            <DualPanePermissionMatrix
              permissions={availablePermissions}
              selectedPermissions={selectedPermissions}
              onChange={setSelectedPermissions}
              readOnly={!isOwner}
            />
          </div>

            {isOwner && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/staff">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSaving} className="gap-2 cursor-pointer">
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Save Staff Permissions
              </Button>
            </div>
          )}
        </form>
      </div>
    </PermissionGuard>
  );
}
