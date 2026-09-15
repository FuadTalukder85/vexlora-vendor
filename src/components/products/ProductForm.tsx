"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, ArrowLeft, Upload } from "lucide-react";
import { productSchema, ProductFormValues } from "@/schemas/productSchema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export const ProductForm: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Electronics",
      basePrice: 99.99,
      compareAtPrice: 119.99,
      stock: 25,
      status: "ACTIVE",
      images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"],
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    // Simulated API payload submission
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Submitting new product:", data);
    router.push("/products");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            <Save className="w-4 h-4" />
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Product Details" subtitle="Basic title and description information">
            <Input
              label="Product Title *"
              placeholder="e.g. Pro Wireless Mechanical Keyboard"
              {...register("title")}
              error={errors.title?.message}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide">
                Product Description *
              </label>
              <textarea
                rows={5}
                placeholder="Describe key features, materials, specifications, and warranty details..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary transition-all resize-none"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-highlight font-medium">{errors.description.message}</p>
              )}
            </div>
          </Card>

          <Card title="Pricing & Inventory" subtitle="Manage price points and stock units">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Base Price ($) *"
                type="number"
                step="0.01"
                placeholder="99.99"
                {...register("basePrice", { valueAsNumber: true })}
                error={errors.basePrice?.message}
              />
              <Input
                label="Compare at Price ($)"
                type="number"
                step="0.01"
                placeholder="119.99"
                {...register("compareAtPrice", { valueAsNumber: true })}
                error={errors.compareAtPrice?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <Input
                label="Stock Quantity *"
                type="number"
                placeholder="25"
                {...register("stock", { valueAsNumber: true })}
                error={errors.stock?.message}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 tracking-wide">
                  Category *
                </label>
                <select
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary"
                  {...register("category")}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Audio">Audio</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Computers">Computers</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card title="Publishing Status" subtitle="Set visibility on Vexlora marketplace">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide">Status</label>
              <select
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-primary focus:outline-none focus:border-primary"
                {...register("status")}
              >
                <option value="ACTIVE">Active (Live in Store)</option>
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </Card>

          <Card title="Product Media" subtitle="Image URL links for display">
            <Input
              label="Primary Image URL *"
              placeholder="https://images.unsplash.com/..."
              {...register("images.0")}
              error={errors.images?.message}
            />
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center bg-slate-50/50">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <p className="text-xs font-semibold text-slate-700">Paste high quality image links</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, WebP</p>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
};
