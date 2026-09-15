import React from "react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { SalesOverviewChart } from "@/components/dashboard/SalesOverviewChart";
import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <span className="text-[11px] font-bold tracking-widest text-secondary uppercase">
            Store Performance Overview
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">Apex Electronics Store</h1>
          <p className="text-xs text-slate-300">
            Welcome back! Here is what is happening with your store today.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-right">
            <span className="text-[10px] text-slate-300 uppercase block font-semibold">
              Commission Rate
            </span>
            <span className="text-base font-bold text-white">8.5%</span>
          </div>
        </div>
        {/* Subtle Decorative Gradient */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-highlight/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Stats Section */}
      <DashboardStats />

      {/* Main Grid: Chart & Quick Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesOverviewChart />
        </div>
        <div>
          <Card title="Quick Store Actions" subtitle="Frequently used merchant tools">
            <div className="space-y-2.5 text-xs font-semibold">
              <a
                href="/products/new"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-primary/5 hover:text-primary border border-slate-200/60 transition-colors"
              >
                <span>Add New Catalog Item</span>
                <span className="text-slate-400">→</span>
              </a>
              <a
                href="/orders"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-primary/5 hover:text-primary border border-slate-200/60 transition-colors"
              >
                <span>Process Pending Fulfillment</span>
                <span className="text-slate-400">→</span>
              </a>
              <a
                href="/payouts"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-primary/5 hover:text-primary border border-slate-200/60 transition-colors"
              >
                <span>Request Net Revenue Payout</span>
                <span className="text-slate-400">→</span>
              </a>
              <a
                href="/settings"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-primary/5 hover:text-primary border border-slate-200/60 transition-colors"
              >
                <span>Edit Store Banner & Logo</span>
                <span className="text-slate-400">→</span>
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Orders Table */}
      <RecentOrdersTable />
    </div>
  );
}
