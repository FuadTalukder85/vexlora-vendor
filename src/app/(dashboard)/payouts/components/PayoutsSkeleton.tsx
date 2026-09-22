"use client";

import React from "react";

export const PayoutsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 bg-muted rounded w-28" />
              <div className="w-8 h-8 rounded-xl bg-muted" />
            </div>
            <div className="h-7 bg-muted rounded w-32" />
            <div className="h-2.5 bg-muted rounded w-44" />
          </div>
        ))}
      </div>

      {/* Grid: Methods & History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5 space-y-4">
          <div className="h-6 bg-muted rounded w-40" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-muted/60 rounded-xl flex items-center justify-between px-4"
              >
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
          <div className="h-5 bg-muted rounded w-48" />
          <div className="h-24 bg-muted/70 rounded-xl" />
          <div className="h-24 bg-muted/70 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
