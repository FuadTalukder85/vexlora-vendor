"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useVendorStore } from "@/stores/useVendorStore";
import { useVendorPayoutStatistics } from "@/hooks/useVendorPayouts";
import { PayoutsSkeleton } from "./components/PayoutsSkeleton";
import { FinanceOverviewCards } from "./components/FinanceOverviewCards";
import { PayoutMethodsCard } from "./components/PayoutMethodsCard";
import { PayoutHistoryTable } from "./components/PayoutHistoryTable";
import { RequestPayoutModal } from "./components/RequestPayoutModal";

export default function PayoutsPage() {
  const { isInitialChecking } = useVendorStore();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const { data: stats, isLoading: isLoadingStats } = useVendorPayoutStatistics();

  if (isInitialChecking) {
    return <PayoutsSkeleton />;
  }

  const availableBalance = stats?.availableBalance || 0;
  const eligibleCount = stats?.eligibleSubOrdersCount || 0;
  const hasPayoutMethod = Boolean(stats?.hasPayoutMethod);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">
            Payouts & Escrow Settlement
          </h1>
          <p className="text-xs text-secondary mt-1">
            Track net earnings, commission deductions, bank transfer schedules, and request revenue withdrawals.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsRequestModalOpen(true)}
          disabled={availableBalance <= 0}
          className="gap-1.5"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Request Payout ({eligibleCount})</span>
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <FinanceOverviewCards
        stats={stats}
        isLoading={isLoadingStats}
        onRequestPayout={() => setIsRequestModalOpen(true)}
      />

      {/* Main Grid: Payout History & Payout Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout History (2 cols) */}
        <div className="lg:col-span-2">
          <PayoutHistoryTable />
        </div>

        {/* Payout Methods & Banking (1 col) */}
        <div className="space-y-6">
          <PayoutMethodsCard />
        </div>
      </div>

      {/* Request Payout Modal */}
      <RequestPayoutModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        availableBalance={availableBalance}
        eligibleCount={eligibleCount}
        hasPayoutMethod={hasPayoutMethod}
      />
    </div>
  );
}
