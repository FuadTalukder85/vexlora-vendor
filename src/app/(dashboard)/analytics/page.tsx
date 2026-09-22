"use client";

import React from "react";
import { TrendingUp, ShoppingCart, Users, Award } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/utils";
import { useVendorStore } from "@/stores/useVendorStore";
import { AnalyticsSkeleton } from "./components/AnalyticsSkeleton";

export default function AnalyticsPage() {
  const { isInitialChecking } = useVendorStore();

  if (isInitialChecking) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Sales & Analytics</h1>
        <p className="text-xs text-secondary mt-1">
          Detailed metrics on sales volume, conversion rates, and top performing products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Conversion Rate"
          value="3.42%"
          change="0.5%"
          isPositive={true}
          icon={TrendingUp}
          iconColorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total Store Visits"
          value="48,210"
          change="12%"
          isPositive={true}
          icon={Users}
          iconColorClass="bg-sky-50 text-sky-600"
        />
        <StatCard
          title="Cart Abandonment"
          value="21.5%"
          change="1.2%"
          isPositive={false}
          icon={ShoppingCart}
          iconColorClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Store Rating"
          value="4.9 / 5.0"
          change="0.1"
          isPositive={true}
          icon={Award}
          iconColorClass="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Selling Products" subtitle="Highest grossing items in catalog">
          <div className="space-y-3 text-xs">
            {[
              { title: "Ultra HD Curved Monitor 34-Inch", sales: 89, revenue: 53311.0 },
              { title: "Pro Wireless Mechanical Gaming Keyboard", sales: 312, revenue: 46796.88 },
              { title: "Noise-Cancelling Studio Headphones", sales: 520, revenue: 67340.0 },
              { title: "Ergonomic Aluminium Laptop Stand", sales: 418, revenue: 20895.82 },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border"
              >
                <div>
                  <p className="font-bold text-primary">{item.title}</p>
                  <p className="text-[10px] text-secondary">{item.sales} units sold</p>
                </div>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Category Revenue Distribution" subtitle="Breakdown by product category">
          <div className="space-y-4 pt-2">
            {[
              { category: "Electronics", percent: 45, amount: 11182.72 },
              { category: "Audio", percent: 30, amount: 7455.15 },
              { category: "Accessories", percent: 15, amount: 3727.57 },
              { category: "Gaming", percent: 10, amount: 2485.05 },
            ].map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-primary">{cat.category}</span>
                  <span className="text-primary">{formatCurrency(cat.amount)} ({cat.percent}%)</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
