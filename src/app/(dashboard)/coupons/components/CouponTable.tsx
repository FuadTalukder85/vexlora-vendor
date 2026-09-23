"use client";

import React from "react";
import { Edit, Trash2, Tag, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency } from "@/lib/utils";
import { VendorCoupon } from "@/types/coupon";
import { CouponsSkeleton } from "./CouponsSkeleton";

interface CouponTableProps {
  coupons: VendorCoupon[];
  isLoading: boolean;
  onEdit: (coupon: VendorCoupon) => void;
  onToggleStatus: (coupon: VendorCoupon) => void;
  onDelete: (coupon: VendorCoupon) => void;
  headerContent?: React.ReactNode;
}

export const CouponTable: React.FC<CouponTableProps> = ({
  coupons,
  isLoading,
  onEdit,
  onToggleStatus,
  onDelete,
  headerContent,
}) => {
  const columns: ColumnDef<VendorCoupon>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Voucher Code",
      cell: (c) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs px-2.5 py-1 bg-primary text-white rounded-lg tracking-wider shadow-2xs flex items-center gap-1.5">
            <Tag className="w-3 h-3" />
            {c.code}
          </span>
        </div>
      ),
    },
    {
      header: "Discount Value",
      cell: (c) => (
        <div>
          <span className="font-bold text-primary text-xs">
            {c.discountType === "percentage"
              ? `${c.discountValue}% OFF`
              : `${formatCurrency(c.discountValue)} OFF`}
          </span>
          <p className="text-[10px] text-secondary capitalize">{c.discountType} discount</p>
        </div>
      ),
    },
    {
      header: "Min Spend",
      cell: (c) => (
        <span className="text-primary font-medium text-xs">
          {c.minPurchase && Number(c.minPurchase) > 0
            ? formatCurrency(Number(c.minPurchase))
            : "No Minimum"}
        </span>
      ),
    },
    {
      header: "Redemptions",
      cell: (c) => (
        <div className="space-y-0.5">
          <span className="font-bold text-primary text-xs">
            {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : "used"}
          </span>
          {c.usageLimit && (
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100))}%`,
                }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Expiry Date",
      cell: (c) => {
        if (!c.expiresAt) {
          return <span className="text-secondary text-xs font-medium">Never Expires</span>;
        }
        const expDate = new Date(c.expiresAt);
        const isExpired = expDate <= new Date();
        return (
          <div className="flex items-center gap-1.5">
            <Clock className={`w-3.5 h-3.5 ${isExpired ? "text-highlight" : "text-secondary"}`} />
            <span className={`text-xs font-medium ${isExpired ? "text-highlight" : "text-primary"}`}>
              {expDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (c) => {
        const isExpired = c.expiresAt ? new Date(c.expiresAt) <= new Date() : false;
        if (isExpired) {
          return <Badge variant="danger">Expired</Badge>;
        }
        return c.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="warning">Inactive</Badge>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (c) => (
        <TableActions>
          <TableActionButton
            onClick={() => onToggleStatus(c)}
            title={c.isActive ? "Deactivate Coupon" : "Activate Coupon"}
          >
            {c.isActive ? (
              <XCircle className="w-4 h-4 text-secondary hover:text-amber-600 transition-colors" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 hover:text-emerald-700 transition-colors" />
            )}
          </TableActionButton>
          <TableActionButton onClick={() => onEdit(c)} title="Edit Coupon">
            <Edit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            hoverVariant="danger"
            onClick={() => onDelete(c)}
            title="Delete Coupon"
          >
            <Trash2 className="w-4 h-4" />
          </TableActionButton>
        </TableActions>
      ),
    },
  ];

  if (isLoading) {
    return <CouponsSkeleton />;
  }

  return (
    <PaginateTable
      data={coupons}
      columns={columns}
      keyExtractor={(c) => c.id}
      defaultPageSize={20}
      className="flex-1 min-h-0"
      headerContent={headerContent}
      emptyMessage="No store coupons found. Create your first promotion above!"
    />
  );
};
