import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-slate-500">Loading Vendor Portal...</p>
    </div>
  );
}
