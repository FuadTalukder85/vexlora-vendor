"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "../../components/ProductForm";
import { useProduct } from "@/hooks/useProducts";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: product, isLoading, error } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-9 w-32 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-64 bg-slate-200/70 rounded-2xl animate-pulse" />
            <div className="h-48 bg-slate-200/70 rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-40 bg-slate-200/70 rounded-2xl animate-pulse" />
            <div className="h-72 bg-slate-200/70 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="w-full space-y-6">
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <h3 className="text-base font-bold text-rose-800">Product Not Found</h3>
          <p className="text-xs text-rose-600 max-w-md">
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
        <p className="text-xs text-slate-500 mt-1">
          Modify pricing, stock inventory, media assets, or status for this listing.
        </p>
      </div>

      <ProductForm initialData={product || undefined} isEdit={true} productId={productId} />
    </div>
  );
}
