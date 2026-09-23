import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { VendorProfile, VendorUser, VendorDocument } from "@/types/vendor";

export interface SessionInfo {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface PayoutStats {
  availableBalance: number;
  pendingBalance: number;
  totalPaidOut: number;
  unpaidSubOrdersCount: number;
  recentPayoutsCount: number;
}

export interface StripeStatus {
  connected: boolean;
  stripeAccountId?: string | null;
  detailsSubmitted?: boolean;
  payoutsEnabled?: boolean;
  chargesEnabled?: boolean;
  requiresAction?: boolean;
}

export interface VendorNotification {
  id: string;
  type: string;
  title?: string | null;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export const useVendorSettingsData = () => {
  const queryClient = useQueryClient();

  // 1. Current user & profile queries
  const userQuery = useQuery<VendorUser>({
    queryKey: ["vendor-user-me"],
    queryFn: async () => {
      const res = await apiClient.get("/users/me");
      return res.data?.data || res.data;
    },
  });

  const profileQuery = useQuery<VendorProfile>({
    queryKey: ["vendor-profile-me"],
    queryFn: async () => {
      const res = await apiClient.get("/vendor-profiles/me");
      return res.data?.data || res.data;
    },
  });

  // 2. Payout statistics
  const payoutStatsQuery = useQuery<PayoutStats>({
    queryKey: ["vendor-payout-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/payouts/vendor/statistics");
      return res.data?.data || res.data;
    },
  });

  // 3. Stripe Connect status
  const stripeStatusQuery = useQuery<StripeStatus>({
    queryKey: ["vendor-stripe-status"],
    queryFn: async () => {
      const res = await apiClient.get("/payouts/vendor/stripe/status");
      return res.data?.data || res.data;
    },
  });

  // 4. Active Sessions
  const sessionsQuery = useQuery<SessionInfo[]>({
    queryKey: ["vendor-sessions"],
    queryFn: async () => {
      const res = await apiClient.get("/users/me/sessions");
      return res.data?.data || [];
    },
  });

  // 5. Notifications
  const notificationsQuery = useQuery<VendorNotification[]>({
    queryKey: ["vendor-notifications"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications/my-notifications?limit=20");
      return res.data?.data || [];
    },
  });

  const unreadCountQuery = useQuery<number>({
    queryKey: ["vendor-unread-count"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications/unread-count");
      return res.data?.data?.count ?? 0;
    },
  });

  // 6. Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: Partial<VendorProfile>) => {
      const res = await apiClient.patch("/vendor-profiles/me", payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile-me"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (payload: { name?: string; phone?: string | null }) => {
      const res = await apiClient.patch("/users/me", payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-user-me"] });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiClient.post("/vendor-profiles/me/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile-me"] });
    },
  });

  const removeLogoMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete("/vendor-profiles/me/logo");
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile-me"] });
    },
  });

  const uploadBannerMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiClient.post("/vendor-profiles/me/banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile-me"] });
    },
  });

  const removeBannerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete("/vendor-profiles/me/banner");
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile-me"] });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiClient.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-user-me"] });
    },
  });

  const removeAvatarMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete("/users/me/avatar");
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-user-me"] });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await apiClient.post("/vendor-profiles/me/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile-me"] });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (docId: string) => {
      const res = await apiClient.delete(`/vendor-profiles/documents/${docId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile-me"] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) => {
      const res = await apiClient.post("/users/change-password", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-sessions"] });
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiClient.delete(`/users/me/sessions/${sessionId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-sessions"] });
    },
  });

  const revokeOtherSessionsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete("/users/me/sessions/other");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-sessions"] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch("/notifications/mark-all-as-read");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-unread-count"] });
    },
  });

  const clearAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete("/notifications/clear-all");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-unread-count"] });
    },
  });

  return {
    user: userQuery.data,
    profile: profileQuery.data,
    payoutStats: payoutStatsQuery.data,
    stripeStatus: stripeStatusQuery.data,
    sessions: sessionsQuery.data || [],
    notifications: notificationsQuery.data || [],
    unreadCount: unreadCountQuery.data || 0,
    isLoading: userQuery.isLoading || profileQuery.isLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateUser: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,
    uploadLogo: uploadLogoMutation.mutateAsync,
    removeLogo: removeLogoMutation.mutateAsync,
    uploadBanner: uploadBannerMutation.mutateAsync,
    removeBanner: removeBannerMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    removeAvatar: removeAvatarMutation.mutateAsync,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    revokeSession: revokeSessionMutation.mutateAsync,
    revokeOtherSessions: revokeOtherSessionsMutation.mutateAsync,
    markAllNotificationsRead: markAllNotificationsReadMutation.mutateAsync,
    clearAllNotifications: clearAllNotificationsMutation.mutateAsync,
  };
};
