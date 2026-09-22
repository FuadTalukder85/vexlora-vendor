import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import {
  PayoutRecord,
  RequestPayoutPayload,
  StripeConnectStatus,
  UpdateVendorBankingPayload,
  VendorPayoutItem,
  VendorPayoutQueryParams,
  VendorPayoutStatistics,
} from "@/types/payout";

export interface VendorPayoutsResponse {
  payouts: VendorPayoutItem[];
  rawPayouts: PayoutRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const fetchVendorPayouts = async (
  params?: VendorPayoutQueryParams
): Promise<VendorPayoutsResponse> => {
  const qParams = new URLSearchParams();
  if (params?.page) {
    qParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    qParams.append("limit", params.limit.toString());
  }
  if (params?.searchTerm && params.searchTerm.trim()) {
    qParams.append("searchTerm", params.searchTerm.trim());
  }
  if (params?.status && params.status !== "ALL") {
    qParams.append("status", params.status);
  }
  if (params?.sortBy) {
    qParams.append("sortBy", params.sortBy);
  }
  if (params?.sortOrder) {
    qParams.append("sortOrder", params.sortOrder);
  }

  const res = await apiClient.get(`/payouts/vendor/me?${qParams.toString()}`);
  const rawData = res.data?.data || res.data || [];
  const rawMeta = res.data?.meta;

  let rawPayouts: PayoutRecord[] = [];
  if (Array.isArray(rawData)) {
    rawPayouts = rawData;
  }

  const payouts: VendorPayoutItem[] = rawPayouts.map((p) => ({
    id: p.id,
    vendorId: p.vendorId,
    amount: Number(p.amount) || 0,
    status: p.status,
    stripeTransferId: p.stripeTransferId || null,
    processedAt: p.processedAt || null,
    createdAt: p.createdAt,
    subOrdersCount: p.subOrders?.length || 0,
    subOrders: p.subOrders || [],
  }));

  const limitVal = params?.limit || 20;
  const meta = {
    page: rawMeta?.page ?? (params?.page || 1),
    limit: rawMeta?.limit ?? limitVal,
    total: rawMeta?.total ?? payouts.length,
    totalPages:
      rawMeta?.totalPages ??
      (payouts.length > 0 ? Math.ceil(payouts.length / limitVal) : 1),
  };

  return { payouts, rawPayouts, meta };
};

export const fetchVendorPayoutStatistics = async (): Promise<VendorPayoutStatistics> => {
  const res = await apiClient.get("/payouts/vendor/statistics");
  const data = res.data?.data || res.data || {};

  return {
    totalEarnings: Number(data.totalEarnings) || 0,
    totalPaidOut: Number(data.totalPaidOut) || 0,
    pendingPayoutAmount: Number(data.pendingPayoutAmount) || 0,
    availableBalance: Number(data.availableBalance) || 0,
    eligibleSubOrdersCount: Number(data.eligibleSubOrdersCount) || 0,
    hasPayoutMethod: Boolean(data.hasPayoutMethod),
  };
};

export const useVendorPayouts = (params?: VendorPayoutQueryParams) => {
  const queryClient = useQueryClient();

  const query = useQuery<VendorPayoutsResponse>({
    queryKey: ["vendor-payouts", params],
    queryFn: () => fetchVendorPayouts(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  const currentPage = params?.page || 1;
  const totalPages = query.data?.meta?.totalPages;

  useEffect(() => {
    if (!totalPages || query.isLoading) return;

    const PREFETCH_PAGES_AHEAD = 1;
    for (let offset = 1; offset <= PREFETCH_PAGES_AHEAD; offset++) {
      const targetPage = currentPage + offset;
      if (targetPage <= totalPages) {
        const nextParams: VendorPayoutQueryParams = {
          ...params,
          page: targetPage,
        };

        queryClient.prefetchQuery({
          queryKey: ["vendor-payouts", nextParams],
          queryFn: () => fetchVendorPayouts(nextParams),
          staleTime: 30 * 1000,
        });
      }
    }
  }, [query.data, currentPage, totalPages, params, queryClient, query.isLoading]);

  return query;
};

export const useVendorPayoutStatistics = () => {
  return useQuery<VendorPayoutStatistics>({
    queryKey: ["vendor-payout-statistics"],
    queryFn: fetchVendorPayoutStatistics,
    staleTime: 30 * 1000,
  });
};

export const useVendorPayoutDetails = (payoutId: string | null) => {
  return useQuery<PayoutRecord>({
    queryKey: ["vendor-payout-details", payoutId],
    queryFn: async () => {
      if (!payoutId) throw new Error("Payout ID is required");
      const res = await apiClient.get(`/payouts/vendor/${payoutId}`);
      return res.data?.data || res.data;
    },
    enabled: !!payoutId,
    staleTime: 30 * 1000,
  });
};

export const useStripeConnectStatus = () => {
  return useQuery<StripeConnectStatus>({
    queryKey: ["vendor-stripe-status"],
    queryFn: async () => {
      const res = await apiClient.get("/payouts/vendor/stripe/status");
      const d = res.data?.data || res.data || {};
      return {
        hasAccount: Boolean(d.hasAccount),
        detailsSubmitted: Boolean(d.detailsSubmitted),
        payoutsEnabled: Boolean(d.payoutsEnabled),
        accountId: d.accountId || null,
        defaultCurrency: d.defaultCurrency || "usd",
      };
    },
    staleTime: 60 * 1000,
  });
};

export const useRequestVendorPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RequestPayoutPayload) => {
      const res = await apiClient.post("/payouts/vendor/request", payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-payout-statistics"] });
    },
  });
};

export const useCancelVendorPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payoutId: string) => {
      const res = await apiClient.patch(`/payouts/vendor/${payoutId}/cancel`);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-payout-statistics"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-payout-details"] });
    },
  });
};

export const useCreateStripeOnboardingLink = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/payouts/vendor/stripe/onboarding-link");
      return res.data?.data || res.data;
    },
  });
};

export const useGetStripeDashboardLink = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/payouts/vendor/stripe/dashboard-link");
      return res.data?.data || res.data;
    },
  });
};

export const useUpdateVendorBanking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateVendorBankingPayload) => {
      const res = await apiClient.patch("/vendor-profiles/me", payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payout-statistics"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-stripe-status"] });
    },
  });
};
