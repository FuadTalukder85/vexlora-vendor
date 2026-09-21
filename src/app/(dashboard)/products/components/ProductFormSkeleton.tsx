import React from "react";

export const ProductFormSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 bg-muted rounded-lg animate-pulse" />
        <div className="h-9 w-32 bg-muted rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-64 bg-muted/70 rounded-2xl animate-pulse" />
          <div className="h-48 bg-muted/70 rounded-2xl animate-pulse" />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-40 bg-muted/70 rounded-2xl animate-pulse" />
          <div className="h-72 bg-muted/70 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
};
