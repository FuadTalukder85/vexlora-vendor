"use client";

import React, { useState } from "react";
import {
  Eye,
  Search,
  RefreshCw,
  XCircle,
  Layers,
  CreditCard,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VendorPayoutItem } from "@/types/payout";
import {
  useCancelVendorPayout,
  useVendorPayouts,
} from "@/hooks/useVendorPayouts";
import { VendorPayoutDetailsModal } from "./VendorPayoutDetailsModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

export const PayoutHistoryTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedPayout, setSelectedPayout] = useState<VendorPayoutItem | null>(
    null
  );
  const [cancellingPayout, setCancellingPayout] = useState<VendorPayoutItem | null>(null);

  const { data, isLoading, refetch, isRefetching } = useVendorPayouts({
    searchTerm,
    status: activeTab,
    page,
    limit: pageSize,
  });

  const cancelMutation = useCancelVendorPayout();

  const handleCancel = (payout: VendorPayoutItem) => {
    setCancellingPayout(payout);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingPayout) return;

    try {
      await cancelMutation.mutateAsync(cancellingPayout.id);
      toast.success("Payout request cancelled successfully.");
      setCancellingPayout(null);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to cancel payout request"
      );
    }
  };

  const payouts = data?.payouts || [];
  const meta = data?.meta;

  const columns: ColumnDef<VendorPayoutItem>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">
          {(page - 1) * pageSize + idx + 1}
        </span>
      ),
    },
    {
      header: "Payout ID",
      cell: (p) => (
        <div className="space-y-0.5">
          <span className="font-bold text-primary text-xs font-mono">
            #{p.id}
          </span>
          {p.stripeTransferId ? (
            <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-medium">
              <CreditCard className="w-3 h-3" />
              <span>Stripe Connect</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-secondary font-medium">
              <Building className="w-3 h-3" />
              <span>Bank Wire</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Sub-Orders",
      cell: (p) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
          <Layers className="w-3.5 h-3.5 text-secondary" />
          {p.subOrdersCount} {p.subOrdersCount === 1 ? "order" : "orders"}
        </span>
      ),
    },
    {
      header: "Amount",
      cell: (p) => (
        <span className="font-bold text-emerald-600 text-sm">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (p) => {
        if (p.status === "PAID")
          return <Badge variant="success">PAID & SETTLED</Badge>;
        if (p.status === "PROCESSING")
          return <Badge variant="primary">PROCESSING</Badge>;
        if (p.status === "UNPAID")
          return <Badge variant="warning">PENDING APPROVAL</Badge>;
        if (p.status === "FAILED")
          return <Badge variant="danger">CANCELLED</Badge>;
        return <Badge variant="neutral">{p.status}</Badge>;
      },
    },
    {
      header: "Requested Date",
      cell: (p) => (
        <div>
          <span className="text-primary font-medium text-xs">
            {formatDate(p.createdAt)}
          </span>
          {p.processedAt && (
            <p className="text-[10px] text-secondary">
              Settled: {formatDate(p.processedAt)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (p) => (
        <TableActions>
          {p.status === "UNPAID" && (
            <TableActionButton
              hoverVariant="danger"
              onClick={() => handleCancel(p)}
              title="Cancel Payout Request"
            >
              <XCircle className="w-4 h-4 text-highlight" />
            </TableActionButton>
          )}
          <TableActionButton
            onClick={() => setSelectedPayout(p)}
            title="Inspect Settlement Breakdown"
          >
            <Eye className="w-4 h-4" />
          </TableActionButton>
        </TableActions>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PaginateTable
        data={payouts}
        columns={columns}
        keyExtractor={(p) => p.id}
        defaultPageSize={pageSize}
        page={page}
        totalItems={meta?.total}
        totalPages={meta?.totalPages}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="border-b border-border pb-2 flex items-center gap-5 overflow-x-auto">
              {[
                { key: "ALL", label: "All Payouts" },
                { key: "UNPAID", label: "Pending Approval" },
                { key: "PROCESSING", label: "In Transit" },
                { key: "PAID", label: "Settled" },
                { key: "FAILED", label: "Cancelled" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                  }}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Tools: Search & Refresh */}
            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search payout ID..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                title="Refresh Payouts"
                className="px-2.5"
              >
                <RefreshCw
                  className={`w-4 h-4 text-secondary ${
                    isRefetching ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        }
      />

      {/* Payout Details Modal */}
      <VendorPayoutDetailsModal
        payout={selectedPayout}
        isOpen={Boolean(selectedPayout)}
        onClose={() => setSelectedPayout(null)}
      />

      {/* Cancel Payout Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!cancellingPayout}
        onClose={() => {
          if (!cancelMutation.isPending) {
            setCancellingPayout(null);
          }
        }}
        onConfirm={handleConfirmCancel}
        title="Cancel Payout Request"
        confirmText="Cancel Request"
        variant="warning"
        isLoading={cancelMutation.isPending}
        description={
          cancellingPayout ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to cancel the payout request for{" "}
                <span className="font-bold text-primary">
                  {formatCurrency(cancellingPayout.amount)}
                </span>
                ?
              </p>
              <p className="text-[11px] text-secondary">
                All associated sub-orders will be released and returned to your available withdrawal balance immediately.
              </p>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};
