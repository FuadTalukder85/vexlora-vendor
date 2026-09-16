import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Product } from "@/types/product";

export interface CategoryOption {
  id: string;
  name: string;
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

export const useVendorProducts = (params: { searchTerm?: string; status?: string }) => {
  return useQuery<Product[]>({
    queryKey: ["vendor-products", params],
    queryFn: async () => {
      const qParams = new URLSearchParams();
      qParams.append("limit", "100");
      if (params.searchTerm && params.searchTerm.trim()) {
        qParams.append("searchTerm", params.searchTerm.trim());
      }
      if (params.status && params.status !== "ALL") {
        qParams.append("status", params.status);
      }

      const res = await apiClient.get(`/products/vendor/me?${qParams.toString()}`);
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data.map((p: any) => ({
          ...p,
          category: p.category?.name || p.category || "General",
          totalStock: p.totalStock ?? p.stock ?? 0,
        }));
      }
      return [];
    },
  });
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

