"use client";

import React, { useState } from "react";
import {
  Building,
  CreditCard,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  useCreateStripeOnboardingLink,
  useGetStripeDashboardLink,
  useStripeConnectStatus,
} from "@/hooks/useVendorPayouts";
import { useVendorStore } from "@/stores/useVendorStore";
import { EditBankAccountModal } from "./EditBankAccountModal";
import { toast } from "sonner";

export const PayoutMethodsCard: React.FC = () => {
  const { profile } = useVendorStore();
  const [isEditBankOpen, setIsEditBankOpen] = useState(false);

  const { data: stripeStatus, isLoading: isLoadingStripe } =
    useStripeConnectStatus();
  const createOnboardingMutation = useCreateStripeOnboardingLink();
  const getDashboardMutation = useGetStripeDashboardLink();

  const handleStripeOnboard = async () => {
    try {
      const res = await createOnboardingMutation.mutateAsync();
      const url = res?.data?.url || res?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Failed to retrieve onboarding URL");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to initialize Stripe Onboarding"
      );
    }
  };

  const handleOpenStripeDashboard = async () => {
    try {
      const res = await getDashboardMutation.mutateAsync();
      const url = res?.data?.url || res?.url;
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Failed to retrieve Stripe Dashboard link");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to open Stripe Dashboard"
      );
    }
  };

  const hasBank = Boolean(
    profile?.bankAccountNumber && profile?.bankName
  );
  const isStripeActive = Boolean(stripeStatus?.payoutsEnabled);

  return (
    <Card
      title="Payout & Transfer Methods"
      subtitle="Configure how you receive your net sales earnings"
      className="h-full"
    >
      <div className="space-y-4">
        {/* Warning if no payout method */}
        {!hasBank && !isStripeActive && (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">No payout method configured</p>
              <p className="mt-0.5 text-amber-700">
                Please connect your Stripe account or provide your direct bank
                details below before requesting revenue withdrawals.
              </p>
            </div>
          </div>
        )}

        {/* Stripe Connect Box */}
        <div className="p-4 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 rounded-xl border border-indigo-100 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-primary">
                    Stripe Connect Express
                  </h4>
                  {isStripeActive ? (
                    <Badge variant="success" className="text-[9px] px-1.5 py-0 font-bold">
                      Active
                    </Badge>
                  ) : stripeStatus?.hasAccount ? (
                    <Badge variant="warning" className="text-[9px] px-1.5 py-0 font-bold">
                      Incomplete
                    </Badge>
                  ) : null}
                </div>
                <p className="text-[11px] text-secondary mt-0.5">
                  Automated instant bank transfers & tax compliance
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-indigo-100/80 flex items-center justify-between gap-2">
            {isStripeActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenStripeDashboard}
                isLoading={getDashboardMutation.isPending}
                className="w-full text-xs font-bold text-indigo-700 border-indigo-200 hover:bg-indigo-100/50 justify-center gap-1.5"
              >
                <span>Open Stripe Express Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStripeOnboard}
                isLoading={createOnboardingMutation.isPending}
                className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {stripeStatus?.hasAccount
                    ? "Complete Stripe Verification"
                    : "Connect with Stripe"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Direct Bank Account Box */}
        <div className="p-4 bg-muted/70 rounded-xl border border-border/80 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-primary">Direct Bank Account</h4>
                <p className="text-[11px] text-secondary mt-0.5">
                  Used for manual ACH & direct wire disbursements
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditBankOpen(true)}
              className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Edit Bank Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-border text-xs space-y-1">
            {hasBank ? (
              <>
                <div className="flex items-center justify-between text-secondary">
                  <span>Bank Name:</span>
                  <span className="font-semibold text-primary">
                    {profile?.bankName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-secondary">
                  <span>Account Holder:</span>
                  <span className="font-semibold text-primary">
                    {profile?.bankAccountName || profile?.storeName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-secondary">
                  <span>Account Number / IBAN:</span>
                  <span className="font-mono font-bold text-primary">
                    {profile?.bankAccountNumber}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-2 text-secondary">
                <p className="italic">No bank account details configured.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditBankOpen(true)}
                  className="mt-2 text-xs"
                >
                  Add Bank Details
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Bank Modal */}
      <EditBankAccountModal
        isOpen={isEditBankOpen}
        onClose={() => setIsEditBankOpen(false)}
      />
    </Card>
  );
};
