"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useRequestVendorPayout } from "@/hooks/useVendorPayouts";
import { useVendorStore } from "@/stores/useVendorStore";
import { toast } from "sonner";
import { ArrowUpRight, Building, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  eligibleCount: number;
  hasPayoutMethod: boolean;
}

export const RequestPayoutModal: React.FC<RequestPayoutModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  eligibleCount,
  hasPayoutMethod,
}) => {
  const { profile } = useVendorStore();
  const [notes, setNotes] = useState("");

  const requestPayoutMutation = useRequestVendorPayout();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasPayoutMethod) {
      toast.error("Please configure a bank account or connect Stripe before requesting a payout");
      return;
    }

    if (availableBalance <= 0) {
      toast.error("No delivered orders available for payout withdrawal");
      return;
    }

    try {
      await requestPayoutMutation.mutateAsync({
        notes: notes.trim() || undefined,
      });

      toast.success("Payout request submitted successfully! Our finance team is processing your transfer.");
      setNotes("");
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to submit payout request"
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Revenue Settlement Withdrawal"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Balance Card */}
        <div className="p-4 bg-gradient-to-br from-primary to-slate-900 text-white rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondary/60 font-semibold uppercase tracking-wider">
              Settlement Amount
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {eligibleCount} Delivered Sub-Orders
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            {formatCurrency(availableBalance)}
          </h2>
          <p className="text-[11px] text-secondary/60">
            Full net earnings from your fulfilled and delivered customer orders
          </p>
        </div>

        {/* Transfer Destination Info */}
        <div className="p-3.5 bg-muted/60 rounded-xl border border-border space-y-2">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
            Transfer Destination
          </span>
          <div className="text-xs space-y-1 text-primary">
            {profile?.bankName ? (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-secondary" />
                <span>
                  <strong>{profile.bankName}</strong> ({profile.bankAccountNumber})
                </span>
              </div>
            ) : null}
            {profile?.stripeAccountId ? (
              <div className="flex items-center gap-2 text-indigo-600">
                <CreditCard className="w-4 h-4" />
                <span>
                  Stripe Express ({profile.stripeAccountId})
                </span>
              </div>
            ) : null}
            {!profile?.bankName && !profile?.stripeAccountId && (
              <p className="text-rose-600 font-semibold">
                No payout method found. Please configure your banking details first.
              </p>
            )}
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Internal Notes / Settlement Reference (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. End of month batch request"
            className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={!hasPayoutMethod || availableBalance <= 0}
            isLoading={requestPayoutMutation.isPending}
            className="gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4" />
            Submit Withdrawal Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
