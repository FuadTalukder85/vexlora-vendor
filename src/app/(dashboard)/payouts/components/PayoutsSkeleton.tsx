import React from "react";

export const PayoutsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="h-7 w-48 bg-slate-200 rounded-lg" />
          <div className="h-3.5 w-80 bg-slate-200/70 rounded" />
        </div>
        <div className="h-9 w-40 bg-slate-200 rounded-xl" />
      </div>

      {/* 3 Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
          >
            <div className="h-3 w-32 bg-slate-200 rounded" />
            <div className="h-8 w-28 bg-slate-200 rounded" />
            <div className="h-3 w-40 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Payout History & Bank Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout History Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="grid grid-cols-5 gap-3 items-center p-3 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="h-3.5 w-16 bg-slate-200 rounded" />
                <div className="h-3.5 w-24 bg-slate-200 rounded" />
                <div className="h-3.5 w-28 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
                <div className="h-4 w-12 bg-slate-200 rounded ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Bank Account Details Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-36 bg-slate-200 rounded" />
                <div className="h-2.5 w-28 bg-slate-200/60 rounded" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
              <div className="h-3 w-28 bg-slate-200 rounded" />
              <div className="h-3 w-36 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
