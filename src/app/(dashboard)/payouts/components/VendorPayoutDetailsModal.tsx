"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VendorPayoutItem } from "@/types/payout";
import { useCancelVendorPayout, useVendorPayoutDetails } from "@/hooks/useVendorPayouts";
import { Package, XCircle, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

interface VendorPayoutDetailsModalProps {
  payout: VendorPayoutItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VendorPayoutDetailsModal: React.FC<VendorPayoutDetailsModalProps> = ({
  payout,
  isOpen,
  onClose,
}) => {
  const { data: details, isLoading } = useVendorPayoutDetails(payout?.id || null);
  const cancelMutation = useCancelVendorPayout();

  if (!payout) return null;

  const current = details || payout;
  const subOrders = details?.subOrders || payout.subOrders || [];

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this payout request? All associated sub-orders will be returned to your available withdrawal balance.")) {
      return;
    }

    try {
      await cancelMutation.mutateAsync(payout.id);
      toast.success("Payout request cancelled successfully. Sub-orders are now available for withdrawal.");
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to cancel payout request"
      );
    }
  };

  const totalGrossSubtotal = subOrders.reduce(
    (sum, item) => sum + Number(item.subOrder.subtotal || 0),
    0
  );
  const totalCommission = subOrders.reduce(
    (sum, item) => sum + Number(item.subOrder.commissionAmount || 0),
    0
  );
  const totalVendorNet = subOrders.reduce(
    (sum, item) => sum + Number(item.subOrder.vendorEarning || 0),
    0
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payout & Sub-Order Breakdown"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Header Summary Box */}
        <div className="p-4 bg-muted/60 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-secondary">
                #{payout.id}
              </span>
              {current.status === "PAID" && (
                <Badge variant="success">PAID & SETTLED</Badge>
              )}
              {current.status === "PROCESSING" && (
                <Badge variant="primary">PROCESSING</Badge>
              )}
              {current.status === "UNPAID" && (
                <Badge variant="warning">PENDING CLEARANCE</Badge>
              )}
              {current.status === "FAILED" && (
                <Badge variant="danger">CANCELLED / REVERTED</Badge>
              )}
            </div>
            <p className="text-xs text-secondary mt-1">
              Requested: {formatDate(payout.createdAt)}
              {payout.processedAt && (
                <span> &bull; Settled: {formatDate(payout.processedAt)}</span>
              )}
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-border sm:pl-4">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
              Payout Amount
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {formatCurrency(Number(payout.amount))}
            </span>
          </div>
        </div>

        {/* Transfer Reference Pill */}
        {payout.stripeTransferId && (
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold">
              <CreditCard className="w-4 h-4" />
              <span>Transfer Reference / Transaction ID:</span>
            </div>
            <span className="font-mono font-bold text-indigo-950">
              {payout.stripeTransferId}
            </span>
          </div>
        )}

        {/* Linked Delivered Suborders */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4 text-secondary" />
            <span>Delivered Sub-Orders Breakdown ({subOrders.length})</span>
          </h4>

          <div className="border border-border rounded-xl overflow-hidden max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-secondary font-semibold border-b border-border sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">SubOrder ID</th>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3 text-right">Order Total</th>
                  <th className="py-2.5 px-3 text-right">Platform Fee</th>
                  <th className="py-2.5 px-3 text-right">Your Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-secondary text-xs"
                    >
                      {isLoading ? "Loading order breakdown..." : "No linked sub-orders found"}
                    </td>
                  </tr>
                ) : (
                  subOrders.map((item) => (
                    <tr key={item.subOrderId} className="hover:bg-muted/40">
                      <td className="py-2.5 px-3 font-mono font-medium text-primary">
                        #{item.subOrderId.slice(-8)}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-secondary">
                        {item.subOrder?.order?.orderNumber ||
                          item.subOrder?.orderId ||
                          "N/A"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-primary font-medium">
                        {formatCurrency(Number(item.subOrder?.subtotal || 0))}
                      </td>
                      <td className="py-2.5 px-3 text-right text-indigo-600 font-medium">
                        -
                        {formatCurrency(
                          Number(item.subOrder?.commissionAmount || 0)
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                        {formatCurrency(
                          Number(item.subOrder?.vendorEarning || 0)
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {subOrders.length > 0 && (
            <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between text-xs font-semibold">
              <span className="text-secondary">Summary:</span>
              <div className="flex items-center gap-4">
                <span className="text-primary">
                  Gross: {formatCurrency(totalGrossSubtotal)}
                </span>
                <span className="text-indigo-600">
                  Platform Commission: -{formatCurrency(totalCommission)}
                </span>
                <span className="text-emerald-600 font-bold">
                  Net: {formatCurrency(totalVendorNet)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div>
            {payout.status === "UNPAID" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                isLoading={cancelMutation.isPending}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Cancel Payout Request
              </Button>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
