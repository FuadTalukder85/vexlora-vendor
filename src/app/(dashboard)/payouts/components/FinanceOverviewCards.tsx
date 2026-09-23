"use client";

import React from "react";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { VendorPayoutStatistics } from "@/types/payout";
import { Button } from "@/components/ui/Button";

interface FinanceOverviewCardsProps {
  stats?: VendorPayoutStatistics;
  isLoading?: boolean;
  onRequestPayout: () => void;
}

export const FinanceOverviewCards: React.FC<FinanceOverviewCardsProps> = ({
  stats,
  isLoading = false,
  onRequestPayout,
}) => {
  const availableBalance = stats?.availableBalance || 0;
  const pendingAmount = stats?.pendingPayoutAmount || 0;
  const totalPaidOut = stats?.totalPaidOut || 0;
  const totalEarnings = stats?.totalEarnings || 0;
  const eligibleCount = stats?.eligibleSubOrdersCount || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Available Balance (Featured Card) */}
      <div className="bg-gradient-to-br from-primary via-slate-900 to-slate-950 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden group">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-secondary/60 uppercase tracking-wider">
              Available Balance
            </span>
            {eligibleCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {eligibleCount} eligible
              </span>
            )}
          </div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
            {isLoading ? "---" : formatCurrency(availableBalance)}
          </h2>
          <p className="text-[11px] text-secondary/60">
            Delivered orders ready for withdrawal
          </p>
        </div>

        <div className="relative z-10 pt-1">
          <Button
            variant="highlight"
            size="sm"
            onClick={onRequestPayout}
            disabled={availableBalance <= 0}
            className="w-full justify-between font-bold"
          >
            <span>Request Payout</span>
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Ambient glow */}
        <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-highlight/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Pending Escrow Balance */}
      <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-2 hover:border-amber-400/40 transition-all flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              Pending Escrow
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-600 tracking-tight">
            {isLoading ? "---" : formatCurrency(pendingAmount)}
          </h3>
        </div>
        <p className="text-[11px] text-secondary">
          Held in active payout requests / transit
        </p>
      </div>

      {/* Cleared & Paid Out */}
      <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-2 hover:border-emerald-400/40 transition-all flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Cleared Settlements
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600 tracking-tight">
            {isLoading ? "---" : formatCurrency(totalPaidOut)}
          </h3>
        </div>
        <p className="text-[11px] text-secondary">
          Successfully transferred to your accounts
        </p>
      </div>

      {/* Lifetime Net Earnings */}
      <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-2 hover:border-indigo-400/40 transition-all flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              Lifetime Net Earnings
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-indigo-700 tracking-tight">
            {isLoading ? "---" : formatCurrency(totalEarnings)}
          </h3>
        </div>
        <p className="text-[11px] text-secondary">
          Total earnings from delivered orders
        </p>
      </div>
    </div>
  );
};
