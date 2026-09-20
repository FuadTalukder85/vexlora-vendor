import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { SubOrder, SubOrderStatus } from "@/types/order";

export interface VendorOrderQueryParams {
  searchTerm?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface VendorOrdersResponse {
  orders: SubOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const fetchVendorOrders = async (
  params?: VendorOrderQueryParams
): Promise<VendorOrdersResponse> => {
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

  const res = await apiClient.get(`/sub-orders/vendor/me?${qParams.toString()}`);
  const rawData = res.data?.data || res.data;
  const rawMeta = res.data?.meta;

  let orders: SubOrder[] = [];
  if (Array.isArray(rawData)) {
    orders = rawData.map((so: any) => {
      const shippingAddressStr = so.order?.shippingAddress
        ? [
            so.order.shippingAddress.street,
            so.order.shippingAddress.city,
            so.order.shippingAddress.zip,
            so.order.shippingAddress.country,
          ]
            .filter(Boolean)
            .join(", ")
        : "Standard Customer Delivery";

      const items = Array.isArray(so.items)
        ? so.items.map((it: any) => ({
            id: it.id,
            productId: it.productId,
            productName: it.name || it.product?.title || "Product Item",
            productImage:
              it.product?.images?.[0] ||
              it.variant?.image ||
              "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200",
            quantity: it.quantity || 1,
            unitPrice: Number(it.price) || 0,
            totalPrice: (Number(it.price) || 0) * (it.quantity || 1),
          }))
        : [];

      return {
        id: so.id,
        parentOrderId: so.order?.orderNumber || so.orderId || "N/A",
        vendorId: so.vendorId,
        customerName: so.order?.customer?.name || "Customer",
        customerEmail: so.order?.customer?.email || "N/A",
        shippingAddress: shippingAddressStr,
        items,
        subtotal: Number(so.subtotal) || 0,
        commissionFee: Number(so.commissionAmount) || 0,
        netPayout: Number(so.vendorEarning) || 0,
        status: so.status as SubOrderStatus,
        trackingNumber: so.trackingNumber || "",
        createdAt: so.createdAt,
        updatedAt: so.updatedAt,
      };
    });
  }

  const limitVal = params?.limit || 20;
  const meta = {
    page: rawMeta?.page ?? (params?.page || 1),
    limit: rawMeta?.limit ?? limitVal,
    total: rawMeta?.total ?? orders.length,
    totalPages:
      rawMeta?.totalPages ??
      (orders.length > 0 ? Math.ceil(orders.length / limitVal) : 1),
  };

  return { orders, meta };
};

export const useVendorOrders = (params?: VendorOrderQueryParams) => {
  const queryClient = useQueryClient();

  const query = useQuery<VendorOrdersResponse>({
    queryKey: ["vendor-orders", params],
    queryFn: () => fetchVendorOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const currentPage = params?.page || 1;
  const totalPages = query.data?.meta?.totalPages;

  useEffect(() => {
    if (!totalPages || query.isLoading) return;

    const PREFETCH_PAGES_AHEAD = 2;
    for (let offset = 1; offset <= PREFETCH_PAGES_AHEAD; offset++) {
      const targetPage = currentPage + offset;
      if (targetPage <= totalPages) {
        const nextParams: VendorOrderQueryParams = {
          ...params,
          page: targetPage,
        };

        queryClient.prefetchQuery({
          queryKey: ["vendor-orders", nextParams],
          queryFn: () => fetchVendorOrders(nextParams),
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [query.data, currentPage, totalPages, params, queryClient, query.isLoading]);

  return query;
};

export const useUpdateSubOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      trackingNumber,
    }: {
      id: string;
      status: SubOrderStatus;
      trackingNumber?: string;
    }) => {
      const res = await apiClient.patch(`/sub-orders/vendor/${id}/status`, {
        status,
        ...(trackingNumber !== undefined && { trackingNumber }),
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
    },
  });
};
