"use client";

import React from "react";

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full animate-pulse pb-12">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded-xl w-48" />
        <div className="h-4 bg-muted rounded-lg w-96" />
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        <div className="h-9 bg-muted rounded-xl w-32" />
        <div className="h-9 bg-muted rounded-xl w-36" />
        <div className="h-9 bg-muted rounded-xl w-40" />
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-white border border-border space-y-4">
          <div className="h-5 bg-muted rounded w-40" />
          <div className="w-32 h-32 bg-muted rounded-2xl" />
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border space-y-4">
          <div className="h-5 bg-muted rounded w-36" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-muted rounded-xl" />
            <div className="h-10 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
