import React from "react";

export const SettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <div className="h-7 w-56 bg-slate-200 rounded-lg" />
        <div className="h-3.5 w-96 bg-slate-200/70 rounded" />
      </div>

      {/* Card 1: Branding & Media Assets */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="h-3 w-64 bg-slate-100 rounded" />
        <div className="h-36 w-full bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="h-10 w-full bg-slate-100 rounded-xl" />
          <div className="h-10 w-full bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* Card 2: General Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="h-3 w-52 bg-slate-100 rounded" />
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
        <div className="h-28 w-full bg-slate-100 rounded-xl" />
      </div>

      {/* Card 3: Contact & Support */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="h-5 w-36 bg-slate-200 rounded" />
        <div className="h-3 w-60 bg-slate-100 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 w-full bg-slate-100 rounded-xl" />
          <div className="h-10 w-full bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <div className="h-10 w-44 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
};
