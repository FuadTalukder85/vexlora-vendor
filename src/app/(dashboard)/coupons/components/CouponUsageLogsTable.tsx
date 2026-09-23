"use client";

import React from "react";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { formatCurrency } from "@/lib/utils";
import { CouponUsageLog } from "@/types/couponUsageLog";
import { Tag, User, ShoppingBag, Clock } from "lucide-react";
import { CouponsSkeleton } from "./CouponsSkeleton";

interface CouponUsageLogsTableProps {
  logs: CouponUsageLog[];
  isLoading: boolean;
  headerContent?: React.ReactNode;
}

export const CouponUsageLogsTable: React.FC<CouponUsageLogsTableProps> = ({
  logs,
  isLoading,
  headerContent,
}) => {
  const columns: ColumnDef<CouponUsageLog>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Voucher Code",
      cell: (log) => (
        <span className="font-mono font-bold text-xs px-2.5 py-1 bg-primary text-white rounded-lg tracking-wider inline-flex items-center gap-1.5">
          <Tag className="w-3 h-3" />
          {log.couponCode}
        </span>
      ),
    },
    {
      header: "Customer",
      cell: (log) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-primary text-xs">{log.user?.name || "Customer"}</p>
            <p className="text-[10px] text-secondary">{log.user?.email || "N/A"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Order Reference",
      cell: (log) => (
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-secondary" />
          <span className="font-mono text-xs font-semibold text-primary">
            {log.order?.orderNumber || log.orderId?.slice(0, 10) || "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Discount Granted",
      cell: (log) => (
        <span className="font-bold text-emerald-600 text-xs">
          -{formatCurrency(Number(log.discountAmount) || 0)}
        </span>
      ),
    },
    {
      header: "Redeemed At",
      cell: (log) => (
        <div className="flex items-center gap-1.5 text-xs text-secondary">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {new Date(log.usedAt || log.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <CouponsSkeleton />;
  }

  return (
    <PaginateTable
      data={logs}
      columns={columns}
      keyExtractor={(log) => log.id}
      defaultPageSize={20}
      className="flex-1 min-h-0"
      headerContent={headerContent}
      emptyMessage="No redemption logs found for your store coupons yet."
    />
  );
};
