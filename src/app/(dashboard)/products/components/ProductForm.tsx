"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/ui/ProductImage";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Tag,
  Layers,
  Sparkles,
  DollarSign,
  Package,
  Percent,
  Loader2,
} from "lucide-react";
import { productSchema, ProductFormValues } from "@/schemas/productSchema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Product } from "@/types/product";
import { toast } from "sonner";
import {
  useCategories,
  useUploadProductImages,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/useProducts";
import { useVendorStore } from "@/stores/useVendorStore";
import { ProductFormSkeleton } from "./ProductFormSkeleton";

interface ProductFormProps {
  initialData?: Partial<Product>;
  isEdit?: boolean;
  productId?: string;
  isLoading?: boolean;
}

interface GalleryItem {
  id: string;
  previewUrl: string;
  file?: File;
}

const SUGGESTED_TAGS = [
  "New Arrival",
  "Best Seller",
  "Wireless",
  "RGB",
  "Premium",
  "Eco-Friendly",
  "Limited Edition",
  "Sale",
];

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  isEdit = false,
  productId,
  isLoading = false,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isInitialChecking } = useVendorStore();

  // TanStack Query & Mutations - Pure dynamic data from backend API
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const uploadMutation = useUploadProductImages();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct(productId);

  // Local temporary gallery items (held in memory until form submission)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    if (initialData?.images && initialData.images.length > 0) {
      return initialData.images.map((url, i) => ({
        id: `init-${i}-${url}`,
        previewUrl: url,
      }));
    }
    return [];
  });

  const [newTag, setNewTag] = useState("");
  const [showVariants, setShowVariants] = useState(
    Boolean(initialData?.variants && initialData.variants.length > 0)
  );
  const [attributeDimensions, setAttributeDimensions] = useState<{ name: string; values: string[] }[]>(() => {
    if (initialData?.variants && initialData.variants.length > 0) {
      const dimMap = new Map<string, Set<string>>();
      initialData.variants.forEach((v: any) => {
        if (v.attributes && typeof v.attributes === "object") {
          Object.entries(v.attributes).forEach(([k, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              if (!dimMap.has(k)) dimMap.set(k, new Set<string>());
              dimMap.get(k)!.add(String(val));
            }
          });
        }
      });
      return Array.from(dimMap.entries()).map(([name, set]) => ({
        name,
        values: Array.from(set),
      }));
    }
    return [];
  });
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrValueInput, setNewAttrValueInput] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);
  const [dragOverImageIdx, setDragOverImageIdx] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const defaultValues: ProductFormValues = {
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    categoryId:
      initialData?.categoryId ||
      (typeof initialData?.category === "object"
        ? (initialData.category as any)?.id
        : ""),
    brand: initialData?.brand || "",
    basePrice: initialData?.basePrice ?? 0,
    discountPrice:
      initialData?.discountPrice !== undefined
        ? initialData.discountPrice
        : initialData?.compareAtPrice && initialData.compareAtPrice < (initialData?.basePrice ?? 0)
          ? initialData.compareAtPrice
          : null,
    totalStock: initialData?.totalStock ?? (initialData?.stock ?? 0),
    status: initialData?.status || "ACTIVE",
    images: initialData?.images && initialData.images.length > 0 ? initialData.images : [],
    tags: initialData?.tags && initialData.tags.length > 0 ? initialData.tags : [],
    variants: (initialData?.variants as any) || [],
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const watchedImages = watch("images") || [];
  const watchedTags = watch("tags") || [];
  const watchedBasePrice = watch("basePrice");
  const watchedDiscountPrice = watch("discountPrice");
  const watchedTitle = watch("title");
  const watchedStatus = watch("status");
  const watchedCategoryId = watch("categoryId");


  // Handle local file selection without uploading to Cloudinary immediately
  const handleFilesSelected = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setSubmitError(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        const err = `File "${file.name}" is not a valid image format.`;
        setSubmitError(err);
        toast.error(err);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        const err = `File "${file.name}" exceeds the maximum 10MB size limit.`;
        setSubmitError(err);
        toast.error(err);
        return;
      }
      validFiles.push(file);
    }

    // Create temporary local blob preview URLs (kept in memory until product save)
    const newItems: GalleryItem[] = validFiles.map((file) => ({
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    const updatedGallery = [...galleryItems, ...newItems];
    setGalleryItems(updatedGallery);
    setValue(
      "images",
      updatedGallery.map((g) => g.previewUrl),
      { shouldValidate: true }
    );

    toast.success(
      `${validFiles.length} image file${validFiles.length > 1 ? "s" : ""} added to preview`
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle removing image from local preview
  const handleRemoveImage = (index: number) => {
    const itemToRemove = galleryItems[index];
    if (itemToRemove?.previewUrl && itemToRemove.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
    }
    const updated = galleryItems.filter((_, i) => i !== index);
    setGalleryItems(updated);
    setValue(
      "images",
      updated.map((g) => g.previewUrl),
      { shouldValidate: true }
    );
    toast.info("Image removed from gallery");
  };

  // Handle image drag-and-drop reordering
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverImageIdx !== index) {
      setDragOverImageIdx(index);
    }
  };

  const handleImageDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedImageIdx === null || draggedImageIdx === targetIndex) {
      setDraggedImageIdx(null);
      setDragOverImageIdx(null);
      return;
    }

    const updated = [...galleryItems];
    const [moved] = updated.splice(draggedImageIdx, 1);
    updated.splice(targetIndex, 0, moved);

    setGalleryItems(updated);
    setValue(
      "images",
      updated.map((g) => g.previewUrl),
      { shouldValidate: true }
    );
    setDraggedImageIdx(null);
    setDragOverImageIdx(null);
  };

  const handleImageDragEnd = () => {
    setDraggedImageIdx(null);
    setDragOverImageIdx(null);
  };

  // Handle adding tag
  const handleAddTag = (tagToAdd?: string) => {
    const targetTag = (tagToAdd || newTag).trim();
    if (!targetTag) return;
    if (!watchedTags.includes(targetTag)) {
      setValue("tags", [...watchedTags, targetTag], { shouldValidate: true });
      if (!tagToAdd) setNewTag("");
    }
  };

  // Handle removing tag
  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((t) => t !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const basePriceNum = Number(watchedBasePrice) || 0;
  const discountPriceNum =
    watchedDiscountPrice !== null &&
      watchedDiscountPrice !== undefined &&
      !isNaN(Number(watchedDiscountPrice))
      ? Number(watchedDiscountPrice)
      : null;

  // Calculate discount percent and savings
  const calculateDiscountInfo = () => {
    if (
      basePriceNum > 0 &&
      discountPriceNum !== null &&
      discountPriceNum > 0 &&
      discountPriceNum < basePriceNum
    ) {
      const savings = basePriceNum - discountPriceNum;
      const percent = Math.round((savings / basePriceNum) * 100);
      return { savings, percent, basePrice: basePriceNum, discountPrice: discountPriceNum };
    }
    return null;
  };

  const discountInfo = calculateDiscountInfo();
  const isSubmitting =
    isSaving ||
    uploadMutation.isPending ||
    createProductMutation.isPending ||
    updateProductMutation.isPending;

  // Form Submission via TanStack Query Mutations
  const onSubmit = async (data: ProductFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (galleryItems.length === 0) {
      const err = "At least 1 product image is required.";
      setSubmitError(err);
      toast.error(err);
      return;
    }

    try {
      setIsSaving(true);

      // 1. Gather all local Files that have not yet been uploaded to Cloudinary
      const localFilesToUpload: File[] = [];
      galleryItems.forEach((item) => {
        if (item.file) {
          localFilesToUpload.push(item.file);
        }
      });

      let uploadedUrls: string[] = [];
      if (localFilesToUpload.length > 0) {
        toast.loading(`Uploading ${localFilesToUpload.length} image(s) to Cloudinary...`, {
          id: "cloudinary-upload-toast",
        });
        uploadedUrls = await uploadMutation.mutateAsync(localFilesToUpload);
        toast.dismiss("cloudinary-upload-toast");
      }

      // 2. Map uploaded Cloudinary URLs back into the exact user-ordered positions
      let uploadCursor = 0;
      const finalImageUrls: string[] = galleryItems.map((item) => {
        if (item.file) {
          return uploadedUrls[uploadCursor++];
        }
        return item.previewUrl; // already a persistent Cloudinary / remote URL
      });

      // Map temporary previewUrl (e.g. blob: URLs) to final persistent Cloudinary URLs
      const previewToFinalUrlMap = new Map<string, string>();
      galleryItems.forEach((item, index) => {
        if (item.previewUrl && finalImageUrls[index]) {
          previewToFinalUrlMap.set(item.previewUrl, finalImageUrls[index]);
        }
      });

      // 3. Build product payload matching backend expectations
      const payload = {
        title: data.title.trim(),
        slug: data.slug?.trim() || undefined,
        description: data.description?.trim() || null,
        categoryId: data.categoryId || null,
        brand: data.brand?.trim() || null,
        basePrice: Number(data.basePrice),
        discountPrice:
          data.discountPrice !== null && data.discountPrice !== undefined && !isNaN(data.discountPrice)
            ? Number(data.discountPrice)
            : null,
        totalStock: Number(data.totalStock),
        status: data.status,
        images: finalImageUrls,
        tags: data.tags,
        variants:
          data.variants && data.variants.length > 0
            ? data.variants.map((v) => {
              let variantImg = v.image?.trim() || null;
              if (variantImg) {
                // If it's a blob: or matches one of our gallery items, resolve to the Cloudinary URL
                if (previewToFinalUrlMap.has(variantImg)) {
                  variantImg = previewToFinalUrlMap.get(variantImg)!;
                } else if (variantImg.startsWith("blob:")) {
                  // Fallback: if it's an unmapped blob URL, use the first uploaded image or null
                  variantImg = finalImageUrls[0] || null;
                }
              }

              return {
                sku: v.sku.trim(),
                price: Number(v.price),
                stock: Number(v.stock || 0),
                image: variantImg,
                attributes: v.attributes || {},
              };
            })
            : [],
      };

      if (isEdit && productId) {
        await updateProductMutation.mutateAsync(payload);
        const successMsg = "Product updated successfully!";
        setSubmitSuccess(successMsg);
        toast.success(successMsg);
      } else {
        await createProductMutation.mutateAsync(payload);
        const successMsg = "Product created and published to catalog!";
        setSubmitSuccess(successMsg);
        toast.success(successMsg);
      }

      // Revoke any created local blob object URLs
      galleryItems.forEach((item) => {
        if (item.previewUrl && item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      setTimeout(() => {
        router.push("/products");
        router.refresh();
      }, 900);
    } catch (err: any) {
      toast.dismiss("cloudinary-upload-toast");
      console.error("Product submission failed:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.errorSources?.[0]?.message ||
        (isEdit ? "Failed to update product. Please try again." : "Failed to create product. Please try again.");
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormLoading = isLoading || isInitialChecking || isLoadingCategories;

  if (isFormLoading) {
    return <ProductFormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      {/* Top Sticky/Floating Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalog
          </button>

          <div className="hidden sm:block h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-secondary">Status:</span>
            <Badge
              variant={
                watchedStatus === "ACTIVE"
                  ? "success"
                  : watchedStatus === "DRAFT"
                    ? "warning"
                    : watchedStatus === "OUT_OF_STOCK"
                      ? "danger"
                      : "neutral"
              }
            >
              {watchedStatus}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/products")}
          >
            Discard
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            className="shadow-md shadow-primary/20 font-bold"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isEdit ? "Update Product" : "Save & Publish Product"}
          </Button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {submitError && (
        <div className="bg-highlight/5 border border-highlight/20 rounded-2xl p-4 flex items-start gap-3 text-highlight animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 text-highlight mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-highlight">
              Action Failed
            </h4>
            <p className="text-xs font-medium mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {submitSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <p className="text-xs font-bold">{submitSuccess}</p>
        </div>
      )}

      {/* Full-width Grid: 8 cols (Main) + 4 cols (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* LEFT COLUMN: Main Product Info (8 cols) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">
          {/* Card 1: Core Details */}
          <Card
            title="Product Information"
            subtitle="Core name, branding, specifications, and search identifiers"
          >
            <div className="space-y-4">
              <Input
                label="Product Title *"
                placeholder="e.g. Wireless Ergonomic Mechanical Keyboard"
                {...register("title")}
                error={errors.title?.message}
                helperText="A clear, search-friendly title helps buyers find your item quickly."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Brand / Manufacturer"
                  placeholder="e.g. Vexlora, Keychron, Sony"
                  {...register("brand")}
                  error={errors.brand?.message}
                />

                <Input
                  label="Custom URL Slug (Optional)"
                  placeholder="e.g. wireless-ergonomic-mechanical-keyboard"
                  {...register("slug")}
                  error={errors.slug?.message}
                  helperText="Auto-generated from title if left blank"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-primary tracking-wide">
                    Product Description
                  </label>
                  <span className="text-[11px] text-secondary font-mono">
                    Markdown / Text supported
                  </span>
                </div>
                <textarea
                  rows={6}
                  placeholder="Detail key specifications, build materials, dimensions, warranty, and box contents..."
                  className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm text-primary placeholder:text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-y leading-relaxed"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs text-highlight font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Tags Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-primary tracking-wide flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-secondary" />
                  Product Tags & Search Keywords
                </label>

                {/* Tag Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type keyword and press Enter or Add..."
                    className="flex-1 h-9 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-primary placeholder:text-secondary focus:bg-white focus:outline-none focus:border-primary transition-all"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTag()}
                    className="h-9"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Tag
                  </Button>
                </div>

                {/* Active Tags Chips */}
                {watchedTags.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {watchedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-primary group hover:bg-slate-200 transition-colors"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-secondary hover:text-highlight transition-colors font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-secondary italic">No tags added yet.</p>
                )}

                {/* Quick Tag Suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                    Suggested:
                  </span>
                  {SUGGESTED_TAGS.filter((t) => !watchedTags.includes(t)).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddTag(sug)}
                      className="text-[10px] font-semibold text-primary bg-slate-100 hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded-md transition-all cursor-pointer"
                    >
                      +{sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Pricing & Inventory */}
          <Card
            title="Pricing, Discounts & Inventory"
            subtitle="Configure standard selling price, promotional discount price, and inventory stock"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Input
                  label="Base Regular Price ($) *"
                  type="number"
                  step="0.01"
                  placeholder="99.99"
                  leftIcon={<DollarSign className="w-4 h-4" />}
                  {...register("basePrice", { valueAsNumber: true })}
                  error={errors.basePrice?.message}
                  helperText="Primary listing price"
                />
              </div>

              <div className="space-y-1.5">
                <Input
                  label="Discount / Promo Price ($)"
                  type="number"
                  step="0.01"
                  placeholder="79.99"
                  leftIcon={<Percent className="w-4 h-4" />}
                  {...register("discountPrice", {
                    setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? null : Number(v)),
                  })}
                  error={errors.discountPrice?.message}
                  helperText="Must be lower than base price"
                />
              </div>

              <div className="space-y-1.5">
                <Input
                  label="Total Stock Quantity *"
                  type="number"
                  placeholder="25"
                  leftIcon={<Package className="w-4 h-4" />}
                  {...register("totalStock", { valueAsNumber: true })}
                  error={errors.totalStock?.message}
                  helperText="Available inventory units"
                />
              </div>
            </div>

            {/* Live Pricing Discount Calculation Callout */}
            {discountInfo && (
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between gap-3 text-emerald-800 animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold">
                    Promotional Price Active: Customers save ${discountInfo.savings.toFixed(2)} (
                    {discountInfo.percent}% OFF)
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="line-through text-emerald-600/70">
                    ${basePriceNum.toFixed(2)}
                  </span>
                  <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                    ${(discountPriceNum ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Card 3: Variants Management (Dynamic Multi-Attribute Matrix) */}
          <Card
            title="Product Variants & Options"
            subtitle="Define custom attributes (e.g. Color, Size, RAM, SSD, Material) and manage variant combinations"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowVariants(!showVariants);
                }}
              >
                <Layers className="w-3.5 h-3.5 mr-1" />
                {showVariants ? "Hide Variants" : "Manage Variants"}
              </Button>
            }
          >
            {showVariants ? (
              <div className="space-y-6">
                {/* 1. Attribute Dimensions Builder */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-black text-primary uppercase tracking-wider">
                        1. Define Product Attributes
                      </h4>
                      <p className="text-[11px] text-secondary">
                        Add any custom attribute (e.g. Color, Size, RAM, Storage, Material) and its possible values.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {attributeDimensions.length > 0 && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            const validDims = attributeDimensions.filter(
                              (d) => d.name.trim() && d.values.length > 0
                            );
                            if (validDims.length === 0) {
                              toast.error("Please add at least one attribute with values first.");
                              return;
                            }

                            // Cartesian product of all dimensions
                            const cartesian = (arrays: string[][]): string[][] => {
                              return arrays.reduce(
                                (acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])),
                                [[]] as string[][]
                              );
                            };

                            const combos = cartesian(validDims.map((d) => d.values));
                            const basePrefix = (watchedTitle || "PROD")
                              .slice(0, 4)
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "") || "PROD";

                            const newVariants = combos.map((combo, idx) => {
                              const attributes: Record<string, string> = {};
                              validDims.forEach((dim, i) => {
                                attributes[dim.name] = combo[i];
                              });

                              const comboCode = combo
                                .map((c) => c.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, ""))
                                .join("-");
                              const sku = `${basePrefix}-${comboCode}-${idx + 1}`;

                              return {
                                sku,
                                price: basePriceNum || 99.99,
                                stock: 10,
                                image: watchedImages[0] || "",
                                attributes,
                              };
                            });

                            setValue("variants", newVariants);
                            toast.success(`Generated ${newVariants.length} variant combinations!`);
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          Generate Combinations Matrix
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Attribute Dimension Cards */}
                  <div className="space-y-3">
                    {attributeDimensions.length === 0 ? (
                      <div className="p-3.5 bg-white border border-dashed border-slate-200 rounded-xl text-center">
                        <p className="text-xs text-secondary">
                          No attributes added yet. Type an attribute name below (e.g. Color, Size, RAM, Storage, Material) and click &quot;Add Attribute Dimension&quot;.
                        </p>
                      </div>
                    ) : (
                      attributeDimensions.map((dim, dimIdx) => (
                      <div
                        key={dimIdx}
                        className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-secondary uppercase">
                              Attribute Name:
                            </span>
                            <span className="text-xs font-black text-primary px-2 py-0.5 bg-slate-100 rounded-md">
                              {dim.name}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setAttributeDimensions((prev) => prev.filter((_, i) => i !== dimIdx));
                            }}
                            className="text-secondary hover:text-highlight p-1 rounded-md transition-colors"
                            title="Remove Attribute"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Values chips and input */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {dim.values.map((val, valIdx) => (
                            <span
                              key={valIdx}
                              className="inline-flex items-center gap-1 bg-primary/5 text-primary border border-primary/20 text-xs font-bold px-2.5 py-1 rounded-lg"
                            >
                              <span>{val}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setAttributeDimensions((prev) =>
                                    prev.map((d, i) =>
                                      i === dimIdx
                                        ? { ...d, values: d.values.filter((_, vi) => vi !== valIdx) }
                                        : d
                                    )
                                  );
                                }}
                                className="text-primary/60 hover:text-primary ml-0.5"
                              >
                                &times;
                              </button>
                            </span>
                          ))}

                          <div className="flex items-center gap-1">
                            <input
                              className="h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-primary focus:outline-none focus:border-primary w-28"
                              placeholder="+ Add value..."
                              value={newAttrValueInput[dim.name] || ""}
                              onChange={(e) =>
                                setNewAttrValueInput((prev) => ({ ...prev, [dim.name]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  const val = (newAttrValueInput[dim.name] || "").trim().replace(",", "");
                                  if (val && !dim.values.includes(val)) {
                                    setAttributeDimensions((prev) =>
                                      prev.map((d, i) =>
                                        i === dimIdx ? { ...d, values: [...d.values, val] } : d
                                      )
                                    );
                                    setNewAttrValueInput((prev) => ({ ...prev, [dim.name]: "" }));
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => {
                                const val = (newAttrValueInput[dim.name] || "").trim().replace(",", "");
                                if (val && !dim.values.includes(val)) {
                                  setAttributeDimensions((prev) =>
                                    prev.map((d, i) =>
                                      i === dimIdx ? { ...d, values: [...d.values, val] } : d
                                    )
                                  );
                                  setNewAttrValueInput((prev) => ({ ...prev, [dim.name]: "" }));
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    )))}

                    {/* Add new attribute input row */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        className="h-8 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-primary focus:outline-none focus:border-primary flex-1 max-w-xs"
                        placeholder="e.g. Color, Size, RAM, Storage, Finish"
                        value={newAttrName}
                        onChange={(e) => setNewAttrName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const trimmed = newAttrName.trim();
                            if (trimmed && !attributeDimensions.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
                              setAttributeDimensions((prev) => [...prev, { name: trimmed, values: [] }]);
                              setNewAttrName("");
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const trimmed = newAttrName.trim();
                          if (trimmed && !attributeDimensions.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
                            setAttributeDimensions((prev) => [...prev, { name: trimmed, values: [] }]);
                            setNewAttrName("");
                          }
                        }}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Attribute Dimension
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 2. Variant Combinations Matrix List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-primary uppercase tracking-wider">
                        2. Variant Combinations ({variantFields.length})
                      </h4>
                      <p className="text-[11px] text-secondary">
                        Each variant combination has its own SKU, price, stock, and optional image.
                      </p>
                    </div>

                    {variantFields.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setValue("variants", []);
                          toast.info("Cleared all variants.");
                        }}
                        className="text-xs text-highlight hover:opacity-80 font-semibold cursor-pointer"
                      >
                        Clear All Variants
                      </button>
                    )}
                  </div>

                  {variantFields.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <p className="text-xs text-secondary font-medium">
                        No variant combinations configured. Add attributes above and click &quot;Generate Combinations Matrix&quot; or add a custom variant.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const initialAttrs: Record<string, string> = {};
                          if (attributeDimensions.length > 0) {
                            attributeDimensions.forEach((dim) => {
                              initialAttrs[dim.name] = dim.values.length > 0 ? dim.values[0] : "";
                            });
                          } else {
                            initialAttrs["Option"] = "Default";
                          }
                          const basePrefix = (watchedTitle || "PROD")
                            .slice(0, 4)
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "") || "PROD";
                          const comboCode = Object.values(initialAttrs)
                            .filter(Boolean)
                            .map((c) => c.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, ""))
                            .join("-");
                          appendVariant({
                            sku: `${basePrefix}${comboCode ? `-${comboCode}` : ""}-1`,
                            price: basePriceNum || 99.99,
                            stock: 10,
                            image: watchedImages[0] || "",
                            attributes: initialAttrs,
                          });
                        }}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Custom Variant Row
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {variantFields.map((field, index) => {
                        const variantItem = watch(`variants.${index}`);
                        const attributesMap = variantItem?.attributes || {};

                        return (
                          <div
                            key={field.id}
                            className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-2xs hover:border-slate-300 transition-colors"
                          >
                            {/* Combination attributes header & interactive attribute pickers */}
                            <div className="flex items-center justify-between flex-wrap gap-2.5 pb-2.5 border-b border-slate-100">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-secondary">Variant #{index + 1}:</span>
                                
                                {attributeDimensions.length > 0 ? (
                                  <>
                                    {attributeDimensions.map((dim) => {
                                      const currentValue = attributesMap[dim.name] ?? "";
                                      return (
                                        <div
                                          key={dim.name}
                                          className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-lg px-2 py-1 text-xs transition-colors"
                                        >
                                          <span className="text-[10px] font-bold text-secondary uppercase">{dim.name}:</span>
                                          {dim.values.length > 0 ? (
                                            <select
                                              value={currentValue}
                                              onChange={(e) => {
                                                const newAttrs = { ...attributesMap, [dim.name]: e.target.value };
                                                if ("Option" in newAttrs && dim.name !== "Option") {
                                                  delete newAttrs.Option;
                                                }
                                                setValue(`variants.${index}.attributes`, newAttrs, { shouldDirty: true });
                                              }}
                                              className="bg-transparent font-bold text-primary text-xs focus:outline-none cursor-pointer pr-1"
                                            >
                                              <option value="" disabled>Select {dim.name}...</option>
                                              {dim.values.map((val) => (
                                                <option key={val} value={val}>{val}</option>
                                              ))}
                                              {currentValue && !dim.values.includes(currentValue) && (
                                                <option value={currentValue}>{currentValue}</option>
                                              )}
                                            </select>
                                          ) : (
                                            <input
                                              type="text"
                                              placeholder={`Value...`}
                                              value={currentValue}
                                              onChange={(e) => {
                                                const newAttrs = { ...attributesMap, [dim.name]: e.target.value };
                                                if ("Option" in newAttrs && dim.name !== "Option") {
                                                  delete newAttrs.Option;
                                                }
                                                setValue(`variants.${index}.attributes`, newAttrs, { shouldDirty: true });
                                              }}
                                              className="bg-transparent font-bold text-primary text-xs focus:outline-none w-20 border-b border-slate-300 focus:border-primary"
                                            />
                                          )}
                                        </div>
                                      );
                                    })}

                                    {/* Extra attributes that were set outside predefined dimensions */}
                                    {Object.entries(attributesMap)
                                      .filter(([k]) => !attributeDimensions.some((d) => d.name === k))
                                      .map(([k, v]) => (
                                        <span
                                          key={k}
                                          className="inline-flex items-center gap-1 bg-slate-100 text-primary text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-200"
                                        >
                                          <span className="text-secondary">{k}:</span>
                                          <span className="font-bold">{String(v)}</span>
                                        </span>
                                      ))}
                                  </>
                                ) : (
                                  Object.keys(attributesMap).length > 0 ? (
                                    Object.entries(attributesMap).map(([k, v]) => (
                                      <span
                                        key={k}
                                        className="inline-flex items-center gap-1 bg-slate-100 text-primary text-[11px] font-bold px-2 py-0.5 rounded-md"
                                      >
                                        <span className="text-secondary">{k}:</span>
                                        <span>{String(v)}</span>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-secondary italic">Standard Option</span>
                                  )
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => removeVariant(index)}
                                className="p-1 text-secondary hover:text-highlight hover:bg-highlight/10 rounded-lg transition-colors cursor-pointer"
                                title="Remove Variant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Inputs: SKU, Price, Stock, Image */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                              <div className="sm:col-span-3">
                                <label className="text-[10px] font-bold text-secondary uppercase block mb-1">
                                  SKU <span className="text-highlight font-bold ml-0.5">*</span>
                                </label>
                                <input
                                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-primary focus:bg-white focus:outline-none focus:border-primary"
                                  placeholder="e.g. KB-BLK-01"
                                  {...register(`variants.${index}.sku` as const)}
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label className="text-[10px] font-bold text-secondary uppercase block mb-1">
                                  Price ($) <span className="text-highlight font-bold ml-0.5">*</span>
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-primary focus:bg-white focus:outline-none focus:border-primary"
                                  placeholder="99.99"
                                  {...register(`variants.${index}.price` as const, {
                                    valueAsNumber: true,
                                  })}
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-bold text-secondary uppercase block mb-1">
                                  Stock <span className="text-highlight font-bold ml-0.5">*</span>
                                </label>
                                <input
                                  type="number"
                                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-primary focus:bg-white focus:outline-none focus:border-primary"
                                  placeholder="10"
                                  {...register(`variants.${index}.stock` as const, {
                                    valueAsNumber: true,
                                  })}
                                />
                              </div>

                              <div className="sm:col-span-4">
                                <label className="text-[10px] font-bold text-secondary uppercase block mb-1">
                                  Variant Image (Optional)
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-primary focus:bg-white focus:outline-none focus:border-primary truncate"
                                    placeholder="Image URL or pick from media"
                                    {...register(`variants.${index}.image` as const)}
                                  />
                                  {galleryItems.length > 0 && (
                                    <select
                                      className="h-8 px-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 max-w-[90px]"
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          setValue(`variants.${index}.image`, e.target.value);
                                        }
                                      }}
                                      value=""
                                    >
                                      <option value="" disabled>Pick...</option>
                                      {galleryItems.map((item, i) => (
                                        <option key={i} value={item.previewUrl}>Photo {i + 1}</option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const initialAttrs: Record<string, string> = {};
                          if (attributeDimensions.length > 0) {
                            attributeDimensions.forEach((dim) => {
                              initialAttrs[dim.name] = dim.values.length > 0 ? dim.values[0] : "";
                            });
                          } else {
                            initialAttrs["Option"] = `Variant ${variantFields.length + 1}`;
                          }

                          const basePrefix = (watchedTitle || "PROD")
                            .slice(0, 4)
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "") || "PROD";

                          const comboCode = Object.values(initialAttrs)
                            .filter(Boolean)
                            .map((c) => c.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, ""))
                            .join("-");

                          const sku = `${basePrefix}${comboCode ? `-${comboCode}` : ""}-${variantFields.length + 1}`;

                          appendVariant({
                            sku,
                            price: basePriceNum || 99.99,
                            stock: 10,
                            image: watchedImages[0] || "",
                            attributes: initialAttrs,
                          });
                        }}
                        className="w-full py-2 border-dashed"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Another Variant Row
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-secondary">
                Single item product without variations. Click{" "}
                <span className="font-semibold text-primary">Manage Variants</span> if this product
                has multiple colors, sizes, specs, or models.
              </p>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: Media & Publishing Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          {/* Card 4: Publishing Status & Category */}
          <Card
            title="Classification & Visibility"
            subtitle="Store placement and marketplace publishing status"
          >
            <div className="space-y-4">
              {/* Status Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-primary tracking-wide">
                  Publishing Status
                </label>
                <select
                  className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-primary focus:outline-none focus:border-primary transition-all"
                  {...register("status")}
                >
                  <option value="ACTIVE">Active (Live in Marketplace)</option>
                  <option value="DRAFT">Draft (Saved, Not Public)</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
                <p className="text-[11px] text-secondary">
                  {watchedStatus === "ACTIVE"
                    ? "Visible and purchasable by all Vexlora buyers."
                    : watchedStatus === "DRAFT"
                      ? "Hidden from catalog. You can edit and publish anytime."
                      : "Product page remains visible but purchase is blocked."}
                </p>
              </div>

              {/* Category Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-primary tracking-wide">
                  Store Category <span className="text-highlight font-bold ml-0.5">*</span>
                </label>
                <select
                  className={`w-full h-10 px-3.5 bg-white border rounded-xl text-xs text-primary focus:outline-none transition-all disabled:bg-slate-50 ${
                    errors.categoryId
                      ? "border-highlight focus:border-highlight focus:ring-2 focus:ring-highlight/10"
                      : "border-slate-200 focus:border-primary"
                  }`}
                  disabled={isLoadingCategories}
                  {...register("categoryId")}
                >
                  <option value="">
                    {isLoadingCategories
                      ? "Loading store categories..."
                      : categories.length === 0
                        ? "No categories found in database"
                        : "Select a Category"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-highlight font-medium">{errors.categoryId.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Card 5: Product Media & File Upload Manager */}
          <Card
            title="Product Images & Media"
            subtitle="Select image files from your computer (uploaded to Cloudinary on save)"
          >
            <div className="space-y-4">
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFilesSelected(e.target.files);
                  }
                }}
              />

              {/* Drag and Drop File Selection Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFilesSelected(e.dataTransfer.files);
                  }
                }}
                onClick={() => {
                  if (!isSaving) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`w-full p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300"
                  } ${isSaving ? "opacity-75 pointer-events-none" : ""}`}
              >
                {isSaving ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-xs font-bold text-primary">Saving product & uploading media...</p>
                    <p className="text-[11px] text-secondary">Streaming to Cloudinary & saving database records...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center mb-2.5 text-primary">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-primary">
                      Click to choose files or drag & drop
                    </p>
                    <p className="text-[11px] text-secondary mt-1">
                      PNG, JPG, WebP, AVIF (Max 10MB each)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3.5 h-8 text-xs font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Select Image Files
                    </Button>
                  </>
                )}
              </div>

              {errors.images && (
                <p className="text-xs text-rose-500 font-medium">{errors.images.message}</p>
              )}

              {/* Local Preview Gallery Grid */}
              {galleryItems.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                      Selected Media ({galleryItems.length})
                    </span>
                    <span className="text-[10px] text-secondary font-medium">
                      Drag to reorder • 1st is Cover
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {galleryItems.map((item, idx) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleImageDragStart(e, idx)}
                        onDragOver={(e) => handleImageDragOver(e, idx)}
                        onDrop={(e) => handleImageDrop(e, idx)}
                        onDragEnd={handleImageDragEnd}
                        className={`relative aspect-4/3 rounded-xl border overflow-hidden group bg-slate-100 transition-all cursor-grab active:cursor-grabbing select-none ${draggedImageIdx === idx
                          ? "opacity-40 scale-95 border-dashed border-primary"
                          : dragOverImageIdx === idx
                            ? "ring-2 ring-primary border-primary scale-[1.02]"
                            : idx === 0
                              ? "border-primary/80 ring-2 ring-primary/20"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                      >
                        <ProductImage
                          src={item.previewUrl}
                          alt={`Product Image ${idx + 1}`}
                          fill
                          className="object-cover pointer-events-none"
                        />
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="p-2 bg-white text-primary hover:text-rose-600 hover:bg-rose-50 rounded-xl shadow-md transition-all hover:scale-110 pointer-events-auto cursor-pointer"
                            title="Delete Image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {idx === 0 && (
                          <div className="absolute bottom-1.5 left-1.5 bg-primary/95 text-white px-2 py-0.5 rounded-md text-[9px] font-bold shadow-xs flex items-center gap-1 pointer-events-none">
                            Cover Photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Card 6: Live Catalog Preview Card */}
          <Card title="Live Catalog Card Preview" subtitle="How this item appears to customers">
            <div className="border border-slate-200/90 rounded-xl p-3 bg-slate-50/50 space-y-3">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-200">
                {galleryItems[0]?.previewUrl ? (
                  <ProductImage
                    src={galleryItems[0].previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-secondary gap-1 bg-slate-100">
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                    <span className="text-[10px] text-secondary font-medium">No media uploaded</span>
                  </div>
                )}
                {discountInfo && (
                  <div className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow-sm">
                    {discountInfo.percent}% OFF
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                  {watchedTags[0] || "General"}
                </p>
                <h5 className="text-xs font-bold text-primary truncate mt-0.5">
                  {watchedTitle || "Product Title Preview"}
                </h5>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm font-extrabold text-primary">
                    ${(discountPriceNum && discountPriceNum > 0
                      ? discountPriceNum
                      : basePriceNum
                    ).toFixed(2)}
                  </span>
                  {discountPriceNum && discountPriceNum > 0 && basePriceNum > 0 && (
                    <span className="text-xs text-secondary line-through">
                      ${basePriceNum.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
};
