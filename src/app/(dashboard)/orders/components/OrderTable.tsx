"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Truck, CheckCircle, Package } from "lucide-react";
import { SubOrder, SubOrderStatus } from "@/types/order";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrdersSkeleton } from "./OrdersSkeleton";
import { useVendorOrders, useUpdateSubOrderStatus } from "@/hooks/useVendorOrders";
import { toast } from "sonner";

export const OrderTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedOrder, setSelectedOrder] = useState<SubOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [statusChangingOrder, setStatusChangingOrder] = useState<{
    orderId: string;
    newStatus: SubOrderStatus;
    tracking?: string;
  } | null>(null);

  const { data, isLoading } = useVendorOrders({
    searchTerm,
    status: activeTab,
    page,
    limit: pageSize,
  });

  const updateStatusMutation = useUpdateSubOrderStatus();

  const orders = data?.orders || [];
  const meta = data?.meta;

  const handleUpdateStatus = (
    orderId: string,
    newStatus: SubOrderStatus,
    tracking?: string
  ) => {
    setStatusChangingOrder({ orderId, newStatus, tracking });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangingOrder) return;
    const { orderId, newStatus, tracking } = statusChangingOrder;
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus,
        trackingNumber: tracking || undefined,
      });
      toast.success(`Sub-order status updated to ${newStatus}`);
      setStatusChangingOrder(null);
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update sub-order status"
      );
    }
  };

  const columns: ColumnDef<SubOrder>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">
          {(page - 1) * pageSize + idx + 1}
        </span>
      ),
    },
    {
      header: "Sub-Order ID",
      cell: (o) => (
        <div>
          <span className="font-bold text-primary block">{o.id}</span>
          <span className="text-[10px] text-secondary">Order: {o.parentOrderId}</span>
        </div>
      ),
    },
    {
      header: "Customer Details",
      cell: (o) => (
        <div>
          <p className="font-semibold text-primary">{o.customerName}</p>
          <p className="text-[10px] text-secondary">{o.shippingAddress}</p>
        </div>
      ),
    },
    {
      header: "Order Items",
      cell: (o) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted border border-border overflow-hidden relative shrink-0">
            {o.items[0]?.productImage ? (
              <Image
                src={o.items[0].productImage}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-secondary">
                <Package className="w-4 h-4" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-primary">
              {o.items[0]?.productName || "Product Item"}
              {o.items.length > 1 && ` +${o.items.length - 1} more`}
            </p>
            <p className="text-[10px] text-secondary">Qty: {o.items[0]?.quantity || 1}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Subtotal",
      cell: (o) => <span className="font-semibold text-primary">{formatCurrency(o.subtotal)}</span>,
    },
    {
      header: "Net Earnings",
      cell: (o) => <span className="font-bold text-emerald-600">{formatCurrency(o.netPayout)}</span>,
    },
    {
      header: "Status",
      cell: (o) => <OrderStatusBadge status={o.status} />,
    },
    {
      header: "Date",
      cell: (o) => <span className="text-secondary">{formatDate(o.createdAt)}</span>,
    },
    {
      header: "Actions",
      align: "right",
      sticky: "right",
      cell: (o) => (
        <TableActions>
          <TableActionButton
            className="px-3 py-1.5 font-medium text-xs text-primary"
            onClick={() => {
              setSelectedOrder(o);
              setTrackingInput(o.trackingNumber || "");
            }}
          >
            Manage
          </TableActionButton>
        </TableActions>
      ),
    },
  ];

  if (isLoading && !data) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PaginateTable
        data={orders}
        columns={columns}
        keyExtractor={(o) => o.id}
        page={page}
        pageSize={pageSize}
        totalItems={meta?.total ?? orders.length}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex items-center justify-between">
            {/* Status Tabs */}
            <div className="border-b border-border pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-primary"
                  }`}
                >
                  {tab === "ALL" ? "All Orders" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search order ID or customer name..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />

      {/* Order Fulfillment Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Manage Sub-Order ${selectedOrder.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-muted rounded-xl space-y-1">
              <p className="font-semibold text-primary">Customer: {selectedOrder.customerName}</p>
              <p className="text-secondary">Address: {selectedOrder.shippingAddress}</p>
              <p className="text-secondary">Email: {selectedOrder.customerEmail}</p>
            </div>

            <div>
              <p className="font-semibold text-secondary mb-1">Item Details:</p>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-border py-1.5">
                  <span>
                    {item.productName} (x{item.quantity})
                  </span>
                  <span className="font-semibold">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="font-semibold text-secondary block mb-1">Update Tracking Number</label>
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="e.g. TRK-98741029"
                className="w-full px-3 py-2 border border-border rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <p className="font-semibold text-secondary">Fulfillment Status:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                  onClick={() => handleUpdateStatus(selectedOrder.id, "CONFIRMED")}
                >
                  Confirm
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                  onClick={() => handleUpdateStatus(selectedOrder.id, "SHIPPED", trackingInput)}
                >
                  <Truck className="w-3.5 h-3.5" />
                  Ship
                </Button>
                <Button
                  variant="highlight"
                  size="sm"
                  disabled={updateStatusMutation.isPending}
                  onClick={() => handleUpdateStatus(selectedOrder.id, "DELIVERED")}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Deliver
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Fulfillment Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!statusChangingOrder}
        onClose={() => {
          if (!updateStatusMutation.isPending) {
            setStatusChangingOrder(null);
          }
        }}
        onConfirm={handleConfirmStatusChange}
        title={`Update Order Status to ${statusChangingOrder?.newStatus}`}
        confirmText={`Set to ${statusChangingOrder?.newStatus}`}
        variant="primary"
        isLoading={updateStatusMutation.isPending}
        description={
          statusChangingOrder ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to mark sub-order{" "}
                <span className="font-bold text-primary font-mono">{statusChangingOrder.orderId}</span> as{" "}
                <span className="font-bold">{statusChangingOrder.newStatus}</span>?
              </p>
              {statusChangingOrder.tracking && (
                <p className="text-[11px] text-secondary">
                  Tracking Number: <span className="font-mono font-semibold text-primary">{statusChangingOrder.tracking}</span>
                </p>
              )}
              <p className="text-[11px] text-secondary">
                {statusChangingOrder.newStatus === "DELIVERED"
                  ? "Marking as Delivered will finalize this shipment and count towards your payout balance."
                  : statusChangingOrder.newStatus === "SHIPPED"
                  ? "The customer will be notified that their items are in transit."
                  : "Order will be moved to confirmed state."}
              </p>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

