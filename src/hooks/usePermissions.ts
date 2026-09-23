"use client";

import { useVendorStore } from "@/stores/useVendorStore";

export function usePermissions() {
  const {
    user,
    permissions,
    permissionCategories,
    isOwner,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  } = useVendorStore();

  const can = (actionKey: string): boolean => {
    return hasPermission(actionKey);
  };

  const canAny = (actionKeys: string[]): boolean => {
    return hasAnyPermission(actionKeys);
  };

  const canAll = (actionKeys: string[]): boolean => {
    return hasAllPermissions(actionKeys);
  };

  return {
    user,
    permissions,
    permissionCategories,
    isOwner: Boolean(isOwner),
    can,
    canAny,
    canAll,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
