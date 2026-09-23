"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface ProductOption {
  id: string;
  title: string;
  basePrice: number;
  discountPrice?: number | null;
  images: string[];
  totalStock: number;
}

interface DealRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductOption[];
  onSuccess: () => void;
}

export const DealRequestModal: React.FC<DealRequestModalProps> = ({
  isOpen,
  onClose,
  products,
  onSuccess,
}) => {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [proposedDealPrice, setProposedDealPrice] = useState("");
  const [requestedStartAt, setRequestedStartAt] = useState("");
  const [requestedEndAt, setRequestedEndAt] = useState("");
  const [quantityLimit, setQuantityLimit] = useState("");
  const [maxPerCustomer, setMaxPerCustomer] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }

    const dealPriceNum = Number(proposedDealPrice);
    if (!dealPriceNum || dealPriceNum <= 0) {
      toast.error("Please provide a valid deal price");
      return;
    }

    if (selectedProduct && dealPriceNum >= selectedProduct.basePrice) {
      toast.error("Deal price must be lower than current product price");
      return;
    }

    if (!requestedStartAt || !requestedEndAt) {
      toast.error("Please specify promotion start and end dates");
      return;
    }

    if (new Date(requestedStartAt) >= new Date(requestedEndAt)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/deals/requests", {
        productId: selectedProductId,
        proposedDealPrice: dealPriceNum,
        requestedStartAt: new Date(requestedStartAt).toISOString(),
        requestedEndAt: new Date(requestedEndAt).toISOString(),
        quantityLimit: quantityLimit ? Number(quantityLimit) : null,
        maxPerCustomer: maxPerCustomer ? Number(maxPerCustomer) : null,
        note: note.trim() || undefined,
      });

      toast.success("Deal request submitted! Admin will review your proposal.");
      onClose();

      // Reset form
      setSelectedProductId("");
      setProposedDealPrice("");
      setRequestedStartAt("");
      setRequestedEndAt("");
      setQuantityLimit("");
      setMaxPerCustomer("");
      setNote("");

      onSuccess();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to submit deal request";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Flash Deal Proposal"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Product Select */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">
            Select Product <span className="text-danger">*</span>
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="">-- Choose a product to promote --</option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.title} (Regular: {formatCurrency(prod.basePrice)} | Stock: {prod.totalStock})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Product Snapshot */}
        {selectedProduct && (
          <div className="p-3 bg-muted/60 rounded-xl border border-border flex items-center gap-3">
            <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-white border border-border shrink-0">
              <Image
                src={selectedProduct.images?.[0] || "/placeholder-product.png"}
                alt={selectedProduct.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-primary truncate">{selectedProduct.title}</p>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-secondary">
                <span>Regular: <b className="text-primary">{formatCurrency(selectedProduct.basePrice)}</b></span>
                <span>•</span>
                <span>Stock: <b className="text-primary">{selectedProduct.totalStock} units</b></span>
              </div>
            </div>
          </div>
        )}

        {/* Proposed Deal Price */}
        <div>
          <Input
            label="Proposed Flash Deal Price ($)"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={proposedDealPrice}
            onChange={(e) => setProposedDealPrice(e.target.value)}
            placeholder="e.g. 49.99"
            helperText={
              selectedProduct && proposedDealPrice
                ? `Discount: ${Math.round(
                    ((selectedProduct.basePrice - Number(proposedDealPrice)) /
                      selectedProduct.basePrice) *
                      100
                  )}% off regular price`
                : undefined
            }
          />
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Promotion Start Time"
            type="datetime-local"
            required
            value={requestedStartAt}
            onChange={(e) => setRequestedStartAt(e.target.value)}
          />
          <Input
            label="Promotion End Time"
            type="datetime-local"
            required
            value={requestedEndAt}
            onChange={(e) => setRequestedEndAt(e.target.value)}
          />
        </div>

        {/* Quota & Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Quantity Limit for Deal (Optional)"
            type="number"
            min="1"
            value={quantityLimit}
            onChange={(e) => setQuantityLimit(e.target.value)}
            placeholder="Unlimited if empty"
          />
          <Input
            label="Max Per Customer (Optional)"
            type="number"
            min="1"
            value={maxPerCustomer}
            onChange={(e) => setMaxPerCustomer(e.target.value)}
            placeholder="No limit if empty"
          />
        </div>

        {/* Note to Admin */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1.5">
            Proposal Note to Admin (Optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mention marketing plans, seasonal discount, or inventory goals..."
            className="w-full px-3.5 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            Submit Proposal
          </Button>
        </div>
      </form>
    </Modal>
  );
};
