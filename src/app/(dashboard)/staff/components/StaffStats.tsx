"use client";

import React from "react";
import { Users, KeyRound, Shield } from "lucide-react";

interface StaffStatsProps {
  totalStaff: number;
  totalCapabilities: number;
  totalCategories: number;
}

export const StaffStats: React.FC<StaffStatsProps> = ({
  totalStaff,
  totalCapabilities,
  totalCategories,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-border flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Total Staff Members
          </p>
          <p className="text-2xl font-black text-primary">{totalStaff}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-border flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-highlight/10 text-highlight flex items-center justify-center shrink-0">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Available Capabilities
          </p>
          <p className="text-2xl font-black text-primary">{totalCapabilities}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-border flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Permission Categories
          </p>
          <p className="text-2xl font-black text-primary">{totalCategories}</p>
        </div>
      </div>
    </div>
  );
};
