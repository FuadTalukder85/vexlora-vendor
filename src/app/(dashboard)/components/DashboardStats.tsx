"use client";

import React from "react";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/utils";
import { useVendorPayoutStatistics } from "@/hooks/useVendorPayouts";

export const DashboardStats: React.FC = () => {
  const { data: payoutStats } = useVendorPayoutStatistics();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(payoutStats?.totalEarnings ?? 24850.5)}
        change="14.2%"
        isPositive={true}
        icon={DollarSign}
        iconColorClass="bg-emerald-50 text-emerald-600"
      />
      <StatCard
        title="Total Sub-Orders"
        value="384"
        change="8.1%"
        isPositive={true}
        icon={ShoppingBag}
        iconColorClass="bg-primary/10 text-primary"
      />
      <StatCard
        title="Active Products"
        value="42"
        change="3 new"
        isPositive={true}
        icon={Package}
        iconColorClass="bg-sky-50 text-sky-600"
      />
      <StatCard
        title="Avg. Order Value"
        value={formatCurrency(64.71)}
        change="2.4%"
        isPositive={true}
        icon={TrendingUp}
        iconColorClass="bg-purple-50 text-purple-600"
      />
    </div>
  );
};
