"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Edit, Plus, Search, RefreshCw, PackageOpen, CheckCircle2, Archive } from "lucide-react";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProductImage } from "@/components/ui/ProductImage";
import { useVendorProducts, useUpdateProductStatus } from "@/hooks/useProducts";
import { useVendorStore } from "@/stores/useVendorStore";
import { ArchiveModal, ArchiveModalMode } from "@/components/ui/ArchiveModal";
import { ProductsSkeleton } from "./ProductsSkeleton";
import { toast } from "sonner";

const getStatusBadge = (status: Product["status"]) => {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="success">Active</Badge>;
    case "OUT_OF_STOCK":
      return (
        <Badge variant="danger" className="font-bold">
          Out of Stock
        </Badge>
      );
    case "DRAFT":
      return <Badge variant="warning">Draft</Badge>;
    case "REJECTED":
      return <Badge variant="danger">Rejected</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const ProductTable: React.FC = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("searchTerm") || searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Archive / Draft / Delete Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<ArchiveModalMode>("draft");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const urlQuery = searchParams.get("searchTerm") || searchParams.get("search") || "";
    if (urlQuery) {
      setSearchTerm(urlQuery);
      setDebouncedSearch(urlQuery);
      setPage(1);
    }
  }, [searchParams]);

  // Debounce search term for efficient query caching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { isInitialChecking } = useVendorStore();

  // TanStack Query & Mutation with server pagination & prefetching
  const {
    data,
    isLoading: isProductsLoading,
    isFetching,
    refetch,
  } = useVendorProducts({
    searchTerm: debouncedSearch,
    status: statusFilter,
    page,
    limit: pageSize,
  });

  const products = data?.products || [];
  const meta = data?.meta;

  const isLoading = isInitialChecking || isProductsLoading;

  const updateProductStatusMutation = useUpdateProductStatus();

  const handleStatusTabChange = (tab: string) => {
    setStatusFilter(tab);
    setPage(1);
  };

  const handleOpenDraftModal = (product: Product) => {
    setSelectedProduct(product);
    setModalMode("draft");
    setIsModalOpen(true);
  };

  const handleOpenPublishModal = (product: Product) => {
    setSelectedProduct(product);
    setModalMode("publish");
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedProduct) return;

    try {
      if (modalMode === "draft") {
        await updateProductStatusMutation.mutateAsync({
          id: selectedProduct.id,
          status: "DRAFT",
        });
        toast.success(`"${selectedProduct.title}" moved to draft.`);
      } else if (modalMode === "publish") {
        await updateProductStatusMutation.mutateAsync({
          id: selectedProduct.id,
          status: "ACTIVE",
        });
        toast.success(`"${selectedProduct.title}" has been published.`);
      }
      setIsModalOpen(false);
      setSelectedProduct(null);
    } catch (err: any) {
      console.error("Product action failed:", err);
      toast.error(err.response?.data?.message || err.message || "Action failed");
    }
  };

  const isActionLoading = updateProductStatusMutation.isPending;

  const columns: ColumnDef<Product>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <div className="font-semibold text-primary text-xs bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center">
          {(page - 1) * pageSize + idx + 1}
        </div>
      ),
    },
    {
      header: "Product",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
            <ProductImage
              src={p.images?.[0]}
              alt={p.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <Link
              href={`/products/${p.id}/edit`}
              className="font-bold text-primary hover:underline truncate max-w-xs block"
            >
              {p.title}
            </Link>
            <p className="text-[10px] text-secondary font-mono mt-0.5">
              ID: {p.id.slice(0, 12)} {p.brand && `• ${p.brand}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      cell: (p) => (
        <span className="font-medium text-primary">
          {typeof p.category === "object" ? (p.category as any)?.name : p.category || "General"}
        </span>
      ),
    },
    {
      header: "Price",
      cell: (p) => {
        const hasDiscount = p.discountPrice && p.discountPrice > 0;
        return (
          <div className="font-bold text-primary">
            {hasDiscount ? formatCurrency(p.discountPrice!) : formatCurrency(p.basePrice)}
            {hasDiscount && (
              <span className="text-[10px] text-secondary line-through block font-normal">
                {formatCurrency(p.basePrice)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Stock",
      cell: (p) => {
        const stock = p.totalStock ?? p.stock ?? 0;
        return (
          <span
            className={`font-semibold ${stock === 0
              ? "text-rose-600 font-bold"
              : stock < 15
                ? "text-amber-600"
                : "text-primary"
              }`}
          >
            {stock} in stock
          </span>
        );
      },
    },
    {
      header: "Status",
      cell: (p) => getStatusBadge(p.status),
    },
    {
      header: "Sales",
      cell: (p) => <span className="font-medium text-primary">{p.salesCount || 0} sold</span>,
    },
    {
      header: "Created",
      cell: (p) => <span className="text-primary">{formatDate(p.createdAt || new Date().toISOString())}</span>,
    },
    {
      header: "Actions",
      align: "right",
      cell: (p) => (
        <TableActions>
          <TableActionButton
            as={Link}
            href={`/products/${p.id}/edit`}
            title="Edit Product"
          >
            <Edit className="w-4 h-4" />
          </TableActionButton>
          {p.status === "DRAFT" ? (
            <TableActionButton
              onClick={() => handleOpenPublishModal(p)}
              hoverVariant="emerald"
              title="Publish Product"
            >
              <CheckCircle2 className="w-4 h-4" />
            </TableActionButton>
          ) : (
            <TableActionButton
              onClick={() => handleOpenDraftModal(p)}
              hoverVariant="amber"
              title="Move to Draft / Archive"
            >
              <Archive className="w-4 h-4" />
            </TableActionButton>
          )}
        </TableActions>
      ),
    },
  ];

  if (isLoading && products.length === 0) {
    return <ProductsSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <PaginateTable
        data={products}
        columns={columns}
        keyExtractor={(item) => item.id}
        page={page}
        pageSize={pageSize}
        totalItems={meta?.total ?? products.length}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        defaultPageSize={20}
        emptyMessage={
          isLoading
            ? "Searching products..."
            : searchTerm || statusFilter !== "ALL"
              ? `No products found matching "${searchTerm || statusFilter}".`
              : "No products in your catalog yet. Click Add Product to create your first item."
        }
        emptyIcon={<PackageOpen className="w-10 h-10 text-slate-300 mb-2" />}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="border-b border-slate-200/80 pb-2 flex items-center gap-4 sm:gap-6 overflow-x-auto w-full sm:w-auto">
              {["ALL", "ACTIVE", "DRAFT", "OUT_OF_STOCK", "REJECTED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleStatusTabChange(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${statusFilter === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-secondary hover:text-primary"
                    }`}
                >
                  {tab === "ALL"
                    ? "All Products"
                    : tab === "OUT_OF_STOCK"
                      ? "Out of Stock"
                      : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Right Controls: Search + Refresh + Add Product */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products, brand, SKU..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                className="p-2 bg-white border border-slate-200 rounded-xl text-primary hover:text-primary hover:bg-slate-50 transition-colors"
                title="Refresh Product List"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`}
                />
              </button>
            </div>
          </div>
        }
      />

      <ArchiveModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isActionLoading) {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }
        }}
        onConfirm={handleConfirmAction}
        mode={modalMode}
        isLoading={isActionLoading}
        item={
          selectedProduct
            ? {
              title: selectedProduct.title,
              subtitle: `Price: ${formatCurrency(
                selectedProduct.discountPrice || selectedProduct.basePrice
              )} • Stock: ${selectedProduct.totalStock ?? selectedProduct.stock ?? 0} units`,
              image: selectedProduct.images?.[0],
              badge: getStatusBadge(selectedProduct.status),
            }
            : undefined
        }
      />
    </div>
  );
};
