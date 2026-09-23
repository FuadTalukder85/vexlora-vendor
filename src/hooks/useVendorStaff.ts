"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { StaffMember, Permission, CreateVendorStaffPayload, AssignStaffPermissionsPayload } from "@/types/vendor";

export function useVendorStaff() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffList = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiClient.get("/rbac/vendor/staff");
      const data = res.data?.data || [];
      setStaffList(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load store staff";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAvailablePermissions = useCallback(async () => {
    try {
      const res = await apiClient.get("/rbac/vendor/permissions");
      const data = res.data?.data || [];
      setAvailablePermissions(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load permissions";
      setError(message);
    }
  }, []);

  const createStaff = useCallback(async (payload: CreateVendorStaffPayload) => {
    try {
      setIsSaving(true);
      setError(null);
      const res = await apiClient.post("/rbac/vendor/staff", payload);
      await fetchStaffList();
      return res.data?.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create staff user";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, [fetchStaffList]);

  const assignPermissions = useCallback(async (payload: AssignStaffPermissionsPayload) => {
    try {
      setIsSaving(true);
      setError(null);
      const res = await apiClient.post("/rbac/vendor/staff/permissions", payload);
      await fetchStaffList();
      return res.data?.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delegate staff permissions";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, [fetchStaffList]);

  const revokePermission = useCallback(async (userPermissionId: string) => {
    try {
      setIsSaving(true);
      setError(null);
      await apiClient.delete(`/rbac/vendor/staff/permissions/${userPermissionId}`);
      await fetchStaffList();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to revoke permission";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, [fetchStaffList]);

  const getStaffPermissions = useCallback(async (staffUserId: string) => {
    try {
      const res = await apiClient.get(`/rbac/vendor/staff/${staffUserId}/permissions`);
      return res.data?.data || [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load staff permissions";
      setError(message);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchStaffList();
    fetchAvailablePermissions();
  }, [fetchStaffList, fetchAvailablePermissions]);

  return {
    staffList,
    availablePermissions,
    isLoading,
    isSaving,
    error,
    fetchStaffList,
    fetchAvailablePermissions,
    getStaffPermissions,
    createStaff,
    assignPermissions,
    revokePermission,
  };
}
