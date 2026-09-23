"use client";

import React from "react";

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full animate-pulse pb-12">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded-xl w-48" />
        <div className="h-4 bg-muted rounded-lg w-80" />
      </div>

      <div className="p-6 rounded-2xl bg-white border border-border space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <div className="h-5 bg-muted rounded w-36" />
          <div className="flex gap-2">
            <div className="h-8 bg-muted rounded-lg w-28" />
            <div className="h-8 bg-muted rounded-lg w-24" />
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="py-3 flex items-start gap-3 border-b border-border last:border-0">
              <div className="w-2.5 h-2.5 rounded-full bg-muted mt-1.5 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-muted rounded w-48" />
                <div className="h-3 bg-muted rounded w-full max-w-md" />
                <div className="h-2.5 bg-muted rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
