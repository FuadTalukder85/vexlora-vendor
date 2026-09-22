"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "../../components/ProductForm";
import { ProductFormSkeleton } from "../../components/ProductFormSkeleton";
import { useProduct } from "@/hooks/useProducts";
import { useVendorStore } from "@/stores/useVendorStore";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const { isInitialChecking } = useVendorStore();

  const { data: product, isLoading: isProductLoading, error } = useProduct(productId);
  const isLoading = isInitialChecking || isProductLoading;

  if (isLoading) {
    return <ProductFormSkeleton />;
  }

  if (error && !product) {
    return (
      <div className="w-full space-y-6">
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="bg-highlight/10 border border-highlight/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-highlight" />
          <h3 className="text-base font-bold text-highlight">Product Not Found</h3>
          <p className="text-xs text-highlight max-w-md">
            {error ? (error as any)?.message || "Unable to load product details from server." : "Product could not be found."}
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push("/products")}>
            Return to Products Catalog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Edit Product</h1>
        <p className="text-xs text-secondary mt-1">
          Modify pricing, stock inventory, media assets, or status for this listing.
        </p>
      </div>

      <ProductForm initialData={product || undefined} isEdit={true} productId={productId} />
    </div>
  );
}
