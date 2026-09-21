import React from "react";

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Title & Subtitle */}
      <div className="space-y-1">
        <div className="h-7 w-48 bg-muted rounded-lg" />
        <div className="h-3.5 w-80 bg-muted/70 rounded" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-border space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-muted rounded" />
              <div className="w-9 h-9 rounded-xl bg-muted" />
            </div>
            <div className="h-7 w-28 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* 2-Column Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl border border-border space-y-4 shadow-xs">
          <div className="h-5 w-44 bg-muted rounded" />
          <div className="h-3 w-48 bg-muted rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-48 bg-muted rounded" />
                  <div className="h-2.5 w-20 bg-muted/60 rounded" />
                </div>
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Category Revenue Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-border space-y-4 shadow-xs">
          <div className="h-5 w-52 bg-muted rounded" />
          <div className="h-3 w-44 bg-muted rounded" />
          <div className="space-y-5 pt-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
