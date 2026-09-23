"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, ExternalLink, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { VendorProfile } from "@/types/vendor";
import { PayoutStats, StripeStatus } from "@/hooks/useVendorSettings";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface PayoutsPaymentSettingsProps {
  profile: VendorProfile;
  payoutStats?: PayoutStats;
  stripeStatus?: StripeStatus;
  onUpdateProfile: (data: Partial<VendorProfile>) => Promise<any>;
  isUpdating: boolean;
}

export const PayoutsPaymentSettings: React.FC<PayoutsPaymentSettingsProps> = ({
  profile,
  payoutStats,
  stripeStatus,
  onUpdateProfile,
  isUpdating,
}) => {
  const [bankName, setBankName] = useState(profile.bankName || "");
  const [bankAccountName, setBankAccountName] = useState(profile.bankAccountName || "");
  const [bankAccountNumber, setBankAccountNumber] = useState(profile.bankAccountNumber || "");
  const [isGeneratingStripeLink, setIsGeneratingStripeLink] = useState(false);

  useEffect(() => {
    setBankName(profile.bankName || "");
    setBankAccountName(profile.bankAccountName || "");
    setBankAccountNumber(profile.bankAccountNumber || "");
  }, [profile]);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateProfile({
        bankName: bankName.trim() || null,
        bankAccountName: bankAccountName.trim() || null,
        bankAccountNumber: bankAccountNumber.trim() || null,
      });
      toast.success("Bank payout details updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update bank details");
    }
  };

  const handleConnectStripe = async () => {
    try {
      setIsGeneratingStripeLink(true);
      const res = await apiClient.post("/payouts/vendor/stripe/onboarding-link");
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Could not generate Stripe onboarding link");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to connect with Stripe");
    } finally {
      setIsGeneratingStripeLink(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    try {
      setIsGeneratingStripeLink(true);
      const res = await apiClient.post("/payouts/vendor/stripe/dashboard-link");
      const url = res.data?.data?.url;
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Could not generate Stripe dashboard link");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to open Stripe dashboard");
    } finally {
      setIsGeneratingStripeLink(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs">
          <span className="text-xs font-semibold text-secondary block">Available for Payout</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            ${Number(payoutStats?.availableBalance || 0).toFixed(2)}
          </span>
          <p className="text-[11px] text-secondary mt-1">Ready for automated withdrawal</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs">
          <span className="text-xs font-semibold text-secondary block">Pending Escrow Balance</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            ${Number(payoutStats?.pendingBalance || 0).toFixed(2)}
          </span>
          <p className="text-[11px] text-secondary mt-1">Orders in delivery & escrow hold</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-xs">
          <span className="text-xs font-semibold text-secondary block">Total Paid Out to Date</span>
          <span className="text-2xl font-black text-primary mt-1 block">
            ${Number(payoutStats?.totalPaidOut || 0).toFixed(2)}
          </span>
          <p className="text-[11px] text-secondary mt-1">Disbursed successfully</p>
        </div>
      </div>

      {/* Stripe Connect Section */}
      <Card title="Stripe Connect Express Payouts" subtitle="Direct bank deposits via automated Stripe Connect">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white shadow-xs border border-border text-[#635BFF]">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-primary">Stripe Express Account</h4>
                <Badge variant={stripeStatus?.connected ? "success" : "neutral"}>
                  {stripeStatus?.connected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                {stripeStatus?.connected
                  ? "Your account is linked. Automated earnings disbursements are sent directly to your connected bank."
                  : "Connect your bank account or debit card via Stripe Express to receive seamless marketplace payouts."}
              </p>
            </div>
          </div>

          <div>
            {stripeStatus?.connected ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                isLoading={isGeneratingStripeLink}
                onClick={handleOpenStripeDashboard}
              >
                <ExternalLink className="w-4 h-4" />
                Open Stripe Dashboard
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={isGeneratingStripeLink}
                onClick={handleConnectStripe}
              >
                <CreditCard className="w-4 h-4" />
                Connect with Stripe
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Manual Bank Details */}
      <form onSubmit={handleSaveBank} className="space-y-6">
        <Card title="Manual Bank Account (Fallback)" subtitle="For direct wire and marketplace compliance">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. JPMorgan Chase"
            />
            <Input
              label="Account Holder Name"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              placeholder="e.g. Apex Tech LLC"
            />
            <Input
              label="Account / IBAN Number"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="e.g. •••• •••• 4910"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isUpdating}>
            <Save className="w-4 h-4" />
            Save Bank Information
          </Button>
        </div>
      </form>
    </div>
  );
};
