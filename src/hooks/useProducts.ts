import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Product } from "@/types/product";

export interface CategoryOption {
  id: string;
  name: string;
}

export interface VendorProductQueryParams {
  searchTerm?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface VendorProductsResponse {
  products: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useCategories = () => {
  return useQuery<CategoryOption[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get("/categories?limit=100");
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data.map((c: any) => ({
          id: c.id,
          name: c.name,
        }));
      }
      return [];
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const fetchVendorProducts = async (
  params?: VendorProductQueryParams
): Promise<VendorProductsResponse> => {
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

  const res = await apiClient.get(`/products/vendor/me?${qParams.toString()}`);
  const rawData = res.data?.data || res.data;
  const rawMeta = res.data?.meta;

  let products: Product[] = [];
  if (Array.isArray(rawData)) {
    products = rawData.map((p: any) => ({
      ...p,
      category: p.category?.name || p.category || "General",
      totalStock: p.totalStock ?? p.stock ?? 0,
      basePrice: Number(p.basePrice) || 0,
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    }));
  }

  const limitVal = params?.limit || 20;
  const meta = {
    page: rawMeta?.page ?? (params?.page || 1),
    limit: rawMeta?.limit ?? limitVal,
    total: rawMeta?.total ?? products.length,
    totalPages:
      rawMeta?.totalPages ??
      (products.length > 0 ? Math.ceil(products.length / limitVal) : 1),
  };

  return { products, meta };
};

export const useVendorProducts = (params?: VendorProductQueryParams) => {
  const queryClient = useQueryClient();

  const query = useQuery<VendorProductsResponse>({
    queryKey: ["vendor-products", params],
    queryFn: () => fetchVendorProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const currentPage = params?.page || 1;
  const totalPages = query.data?.meta?.totalPages;

  // Background TanStack Query prefetch of next 3 pages
  useEffect(() => {
    if (!totalPages || query.isLoading) return;

    const PREFETCH_PAGES_AHEAD = 3;
    for (let offset = 1; offset <= PREFETCH_PAGES_AHEAD; offset++) {
      const targetPage = currentPage + offset;
      if (targetPage <= totalPages) {
        const nextParams: VendorProductQueryParams = {
          ...params,
          page: targetPage,
        };

        queryClient.prefetchQuery({
          queryKey: ["vendor-products", nextParams],
          queryFn: () => fetchVendorProducts(nextParams),
          staleTime: 5 * 60 * 1000,
        });
      }
    }
  }, [query.data, currentPage, totalPages, params, queryClient, query.isLoading]);

  return query;
};

export const useProduct = (id?: string) => {
  return useQuery<Product | null>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.get(`/products/${id}`);
      const raw = res.data?.data || res.data || null;
      if (!raw) return null;
      return {
        ...raw,
        categoryId: typeof raw.category === "object" ? raw.category?.id : raw.categoryId,
        category: typeof raw.category === "object" ? raw.category?.name : raw.category,
      };
    },
    enabled: Boolean(id),
  });
};

export const useUploadProductImages = () => {
  return useMutation<string[], Error, File[]>({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const res = await apiClient.post("/products/upload-images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data?.urls || [];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post("/products", payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    },
  });
};

export const useUpdateProduct = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.patch(`/products/${id}`, payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["product", id] });
      }
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
    },
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Product["status"] }) => {
      const res = await apiClient.patch(`/products/${id}/status`, { status });
      return res.data?.data || res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
};
