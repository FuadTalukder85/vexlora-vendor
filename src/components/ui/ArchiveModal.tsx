"use client";

import React, { useEffect } from "react";
import { X, Archive, FileEdit, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/ui/ProductImage";

export type ArchiveModalMode = "draft" | "archive" | "delete" | "publish";

export interface ArchiveModalItem {
  title: string;
  subtitle?: string;
  image?: string;
  badge?: React.ReactNode;
}

export interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  mode?: ArchiveModalMode;
  title?: string;
  description?: React.ReactNode;
  item?: ArchiveModalItem;
  confirmText?: string;
  cancelText?: string;
  variant?: "warning" | "danger" | "primary" | "secondary";
  isLoading?: boolean;
  icon?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  mode = "draft",
  title,
  description,
  item,
  confirmText,
  cancelText = "Cancel",
  variant,
  isLoading = false,
  icon,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Mode defaults
  const modePresets = {
    draft: {
      defaultTitle: "Draft Product",
      defaultDescription:
        "Moving this product to Draft will hide it from the storefront and customer searches. You can edit and republish it at any time.",
      defaultConfirmText: "Move to Draft",
      defaultVariant: "warning" as const,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
      defaultIcon: <FileEdit className="w-6 h-6" />,
    },
    archive: {
      defaultTitle: "Archive Product",
      defaultDescription:
        "Archiving will deactivate this product and move it to your archives. Customers won't be able to purchase it until unarchived.",
      defaultConfirmText: "Archive Product",
      defaultVariant: "warning" as const,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
      defaultIcon: <Archive className="w-6 h-6" />,
    },
    delete: {
      defaultTitle: "Delete Product",
      defaultDescription:
        "Are you sure you want to permanently delete this product? This action cannot be undone and will remove all product data.",
      defaultConfirmText: "Delete Permanently",
      defaultVariant: "danger" as const,
      iconBg: "bg-rose-50 text-rose-600 border-rose-200",
      defaultIcon: <Trash2 className="w-6 h-6" />,
    },
    publish: {
      defaultTitle: "Publish Product",
      defaultDescription:
        "Publishing will make this product active and visible to all customers on the marketplace.",
      defaultConfirmText: "Publish Now",
      defaultVariant: "primary" as const,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      defaultIcon: <CheckCircle2 className="w-6 h-6" />,
    },
  };

  const currentPreset = modePresets[mode] || modePresets.draft;
  const modalTitle = title || currentPreset.defaultTitle;
  const modalDescription = description || currentPreset.defaultDescription;
  const resolvedConfirmText = confirmText || currentPreset.defaultConfirmText;
  const resolvedVariant = variant || currentPreset.defaultVariant;
  const modalIcon = icon || currentPreset.defaultIcon;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  const confirmButtonStyles = {
    warning: "bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
    primary: "bg-primary hover:bg-primary/90 text-white focus:ring-primary",
    secondary: "bg-secondary hover:bg-secondary/90 text-primary focus:ring-secondary",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          "w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] transition-all transform animate-in zoom-in-95 duration-200",
          widthClasses[maxWidth]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0",
                currentPreset.iconBg
              )}
            >
              {modalIcon}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{modalTitle}</h2>
            </div>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-4 flex flex-col gap-4 overflow-y-auto">
          <p className="text-xs text-slate-600 leading-relaxed">{modalDescription}</p>

          {/* Optional Item Preview Card */}
          {item && (
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              {item.image !== undefined && (
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 relative">
                  <ProductImage
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                {item.subtitle && (
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                )}
              </div>
              {item.badge && <div className="shrink-0">{item.badge}</div>}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50/80 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onConfirm()}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
              confirmButtonStyles[resolvedVariant]
            )}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
