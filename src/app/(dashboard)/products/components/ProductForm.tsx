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
import {
  useCategories,
  useUploadProductImages,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/useProducts";

interface ProductFormProps {
  initialData?: Partial<Product>;
  isEdit?: boolean;
  productId?: string;
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
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TanStack Query & Mutations - Pure dynamic data from backend API
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const uploadMutation = useUploadProductImages();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct(productId);

  const [newTag, setNewTag] = useState("");
  const [showVariants, setShowVariants] = useState(
    Boolean(initialData?.variants && initialData.variants.length > 0)
  );
  const [isDragging, setIsDragging] = useState(false);
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

  // Sync categoryId once categories query succeeds if not set
  useEffect(() => {
    if (categories && categories.length > 0) {
      if (!watchedCategoryId && !initialData?.categoryId) {
        setValue("categoryId", categories[0].id);
      }
    }
  }, [categories, watchedCategoryId, initialData, setValue]);

  // Handle genuine file uploads via TanStack mutation
  const handleFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setSubmitError(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        setSubmitError(`File "${file.name}" is not a valid image format.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError(`File "${file.name}" exceeds the maximum 10MB size limit.`);
        return;
      }
      validFiles.push(file);
    }

    try {
      const uploadedUrls = await uploadMutation.mutateAsync(validFiles);
      if (uploadedUrls.length > 0) {
        setValue("images", [...watchedImages, ...uploadedUrls], { shouldValidate: true });
      }
    } catch (err: any) {
      console.error("Image upload failed:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errorSources?.[0]?.message ||
        "Failed to upload image file(s). Please try again.";
      setSubmitError(msg);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle removing image
  const handleRemoveImage = (index: number) => {
    const updated = watchedImages.filter((_, i) => i !== index);
    setValue("images", updated, { shouldValidate: true });
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

    const updated = [...watchedImages];
    const [moved] = updated.splice(draggedImageIdx, 1);
    updated.splice(targetIndex, 0, moved);

    setValue("images", updated, { shouldValidate: true });
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
  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;
  const isUploadingImages = uploadMutation.isPending;

  // Form Submission via TanStack Query Mutations
  const onSubmit = async (data: ProductFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    // Clean up payload matching backend expectations
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
      images: data.images,
      tags: data.tags,
      variants:
        data.variants && data.variants.length > 0
          ? data.variants.map((v) => ({
              sku: v.sku.trim(),
              price: Number(v.price),
              stock: Number(v.stock || 0),
              image: v.image?.trim() || null,
              attributes: v.attributes || {},
            }))
          : undefined,
    };

    try {
      if (isEdit && productId) {
        await updateProductMutation.mutateAsync(payload);
        setSubmitSuccess("Product updated successfully!");
      } else {
        await createProductMutation.mutateAsync(payload);
        setSubmitSuccess("Product created and published to catalog!");
      }

      setTimeout(() => {
        router.push("/products");
        router.refresh();
      }, 900);
    } catch (err: any) {
      console.error("Product submission failed:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.errorSources?.[0]?.message ||
        (isEdit ? "Failed to update product. Please try again." : "Failed to create product. Please try again.");
      setSubmitError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
      {/* Top Sticky/Floating Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalog
          </button>

          <div className="hidden sm:block h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Status:</span>
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
            isLoading={isSubmitting || isUploadingImages}
            className="shadow-md shadow-primary/20 font-bold"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isEdit ? "Update Product" : "Save & Publish Product"}
          </Button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {submitError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-700 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
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
                  <span className="text-[11px] text-slate-400 font-mono">
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
                  <p className="text-xs text-rose-500 font-medium">
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
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 group hover:bg-slate-200 transition-colors"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-slate-400 hover:text-rose-500 transition-colors font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No tags added yet.</p>
                )}

                {/* Quick Tag Suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Suggested:
                  </span>
                  {SUGGESTED_TAGS.filter((t) => !watchedTags.includes(t)).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddTag(sug)}
                      className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded-md transition-all cursor-pointer"
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

          {/* Card 3: Variants Management (Optional/Advanced) */}
          <Card
            title="Product Variants (Optional)"
            subtitle="Add custom options like different colors, sizes, or technical configurations"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowVariants(!showVariants);
                  if (!showVariants && variantFields.length === 0) {
                    appendVariant({
                      sku: `${watchedTitle ? watchedTitle.slice(0, 4).toUpperCase() : "PROD"}-VAR-1`,
                      price: basePriceNum || 99.99,
                      stock: 10,
                      image: watchedImages[0] || "",
                      attributes: { Color: "Midnight Black" },
                    });
                  }
                }}
              >
                <Layers className="w-3.5 h-3.5 mr-1" />
                {showVariants ? "Hide Variants" : "Manage Variants"}
              </Button>
            }
          >
            {showVariants ? (
              <div className="space-y-4">
                {variantFields.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">No variants created yet.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendVariant({
                          sku: `SKU-${Date.now().toString().slice(-4)}`,
                          price: basePriceNum || 99.99,
                          stock: 10,
                          image: "",
                          attributes: { Option: "Default" },
                        })
                      }
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add First Variant
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {variantFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                      >
                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">
                            SKU *
                          </label>
                          <input
                            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-primary focus:outline-none focus:border-primary"
                            placeholder="e.g. KB-BLK-01"
                            {...register(`variants.${index}.sku` as const)}
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">
                            Option / Spec
                          </label>
                          <input
                            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-primary focus:outline-none focus:border-primary"
                            placeholder="e.g. Red Switches"
                            onChange={(e) => {
                              setValue(`variants.${index}.attributes`, {
                                Spec: e.target.value,
                              });
                            }}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">
                            Price ($) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-primary focus:outline-none focus:border-primary"
                            placeholder="99.99"
                            {...register(`variants.${index}.price` as const, {
                              valueAsNumber: true,
                            })}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">
                            Stock *
                          </label>
                          <input
                            type="number"
                            className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-primary focus:outline-none focus:border-primary"
                            placeholder="10"
                            {...register(`variants.${index}.stock` as const, {
                              valueAsNumber: true,
                            })}
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-end pt-3 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendVariant({
                          sku: `SKU-${Date.now().toString().slice(-4)}`,
                          price: basePriceNum || 99.99,
                          stock: 10,
                          image: "",
                          attributes: { Option: "New Variant" },
                        })
                      }
                      className="w-full py-2 border-dashed"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Another Variant
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Single item product without variations. Click{" "}
                <span className="font-semibold text-primary">Manage Variants</span> if this product
                has multiple colors, sizes, or models.
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
                <p className="text-[11px] text-slate-400">
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
                  Store Category *
                </label>
                <select
                  className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all disabled:bg-slate-50"
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
                  <p className="text-xs text-rose-500 font-medium">{errors.categoryId.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Card 5: Product Media & File Upload Manager */}
          <Card
            title="Product Images & Media"
            subtitle="Upload image files directly to your product gallery"
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
                    handleFilesUpload(e.target.files);
                  }
                }}
              />

              {/* Drag and Drop File Upload Area */}
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
                    handleFilesUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => {
                  if (!isUploadingImages) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`w-full p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300"
                } ${isUploadingImages ? "opacity-75 pointer-events-none" : ""}`}
              >
                {isUploadingImages ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-xs font-bold text-primary">Uploading image file(s)...</p>
                    <p className="text-[11px] text-slate-400">Streaming to Cloudinary...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center mb-2.5 text-primary">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
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

              {/* Uploaded Gallery Grid */}
              {watchedImages.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Uploaded Media ({watchedImages.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Drag to reorder • 1st is Cover
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {watchedImages.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}-${idx}`}
                        draggable
                        onDragStart={(e) => handleImageDragStart(e, idx)}
                        onDragOver={(e) => handleImageDragOver(e, idx)}
                        onDrop={(e) => handleImageDrop(e, idx)}
                        onDragEnd={handleImageDragEnd}
                        className={`relative aspect-4/3 rounded-xl border overflow-hidden group bg-slate-100 transition-all cursor-grab active:cursor-grabbing select-none ${
                          draggedImageIdx === idx
                            ? "opacity-40 scale-95 border-dashed border-primary"
                            : dragOverImageIdx === idx
                            ? "ring-2 ring-primary border-primary scale-[1.02]"
                            : idx === 0
                            ? "border-primary/80 ring-2 ring-primary/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <ProductImage
                          src={imgUrl}
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
                            className="p-2 bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl shadow-md transition-all hover:scale-110 pointer-events-auto cursor-pointer"
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
                {watchedImages[0] ? (
                  <ProductImage
                    src={watchedImages[0]}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 bg-slate-100">
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                    <span className="text-[10px] text-slate-400 font-medium">No media uploaded</span>
                  </div>
                )}
                {discountInfo && (
                  <div className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow-sm">
                    {discountInfo.percent}% OFF
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
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
                    <span className="text-xs text-slate-400 line-through">
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
