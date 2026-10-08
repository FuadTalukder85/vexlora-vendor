"use client";

import React from "react";
import { Archive, FileEdit, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/utils";

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
  maxWidth?: "sm" | "md" | "lg" | "xl";
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
  // Mode defaults
  const modePresets = {
    draft: {
      defaultTitle: "Draft Product",
      defaultDescription:
        "Moving this product to Draft will hide it from the storefront and customer searches. You can edit and republish it at any time.",
      defaultConfirmText: "Move to Draft",
      defaultVariant: "warning" as const,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
      defaultIcon: <FileEdit className="w-5 h-5" />,
    },
    archive: {
      defaultTitle: "Archive Product",
      defaultDescription:
        "Archiving will deactivate this product and move it to your archives. Customers won't be able to purchase it until unarchived.",
      defaultConfirmText: "Archive Product",
      defaultVariant: "warning" as const,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
      defaultIcon: <Archive className="w-5 h-5" />,
    },
    delete: {
      defaultTitle: "Delete Product",
      defaultDescription:
        "Are you sure you want to permanently delete this product? This action cannot be undone and will remove all product data.",
      defaultConfirmText: "Delete Permanently",
      defaultVariant: "danger" as const,
      iconBg: "bg-highlight/10 text-highlight border-highlight/30",
      defaultIcon: <Trash2 className="w-5 h-5" />,
    },
    publish: {
      defaultTitle: "Publish Product",
      defaultDescription:
        "Publishing will make this product active and visible to all customers on the marketplace.",
      defaultConfirmText: "Publish Now",
      defaultVariant: "primary" as const,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      defaultIcon: <CheckCircle2 className="w-5 h-5" />,
    },
  };

  const currentPreset = modePresets[mode] || modePresets.draft;
  const modalTitle = title || currentPreset.defaultTitle;
  const modalDescription = description || currentPreset.defaultDescription;
  const resolvedConfirmText = confirmText || currentPreset.defaultConfirmText;
  const resolvedVariant = variant || currentPreset.defaultVariant;
  const modalIcon = icon || currentPreset.defaultIcon;

  const confirmButtonStyles = {
    warning: "bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400",
    danger: "bg-highlight hover:opacity-90 text-white focus:ring-highlight",
    primary: "bg-primary hover:bg-primary/90 text-white focus:ring-primary",
    secondary: "bg-secondary hover:bg-secondary/90 text-primary focus:ring-secondary",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={modalTitle}
      maxWidth={maxWidth}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5",
              currentPreset.iconBg
            )}
          >
            {modalIcon}
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-xs text-secondary leading-relaxed">{modalDescription}</p>

            {/* Optional Item Preview Card */}
            {item && (
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-muted border border-border">
                {item.image !== undefined && (
                  <div className="w-12 h-12 rounded-lg bg-white border border-border overflow-hidden shrink-0 relative">
                    <ProductImage
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-primary truncate">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-[11px] text-secondary truncate mt-0.5">{item.subtitle}</p>
                  )}
                </div>
                {item.badge && <div className="shrink-0">{item.badge}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-primary bg-white border border-border hover:bg-muted rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
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
    </Modal>
  );
};
