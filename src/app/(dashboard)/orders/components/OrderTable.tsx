"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Truck, CheckCircle } from "lucide-react";
import { SubOrder, SubOrderStatus } from "@/types/order";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { formatCurrency, formatDate } from "@/lib/utils";

const mockOrders: SubOrder[] = [
  {
    id: "ORD-9021",
    parentOrderId: "PO-8810",
    vendorId: "v-prof-1",
    customerName: "Sarah Jenkins",
    customerEmail: "sarah.j@example.com",
    shippingAddress: "742 Evergreen Terrace, Springfield, OR 97477",
    items: [
      {
        id: "item-1",
        productId: "p-101",
        productName: "Pro Wireless Mechanical Gaming Keyboard",
        productImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200",
        quantity: 1,
        unitPrice: 149.99,
        totalPrice: 149.99,
      },
    ],
    subtotal: 149.99,
    commissionFee: 12.74,
    netPayout: 137.25,
    status: "CONFIRMED",
    createdAt: "2026-09-15T14:30:00Z",
    updatedAt: "2026-09-15T14:30:00Z",
  },
  {
    id: "ORD-9020",
    parentOrderId: "PO-8809",
    vendorId: "v-prof-1",
    customerName: "Michael Chen",
    customerEmail: "mchen@example.com",
    shippingAddress: "1200 Market St, San Francisco, CA 94102",
    items: [
      {
        id: "item-2",
        productId: "p-102",
        productName: "Ultra HD Curved Monitor 34-Inch",
        productImage: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200",
        quantity: 1,
        unitPrice: 599.0,
        totalPrice: 599.0,
      },
    ],
    subtotal: 599.0,
    commissionFee: 50.91,
    netPayout: 548.09,
    status: "SHIPPED",
    trackingNumber: "TRK-9948201",
    createdAt: "2026-09-15T11:15:00Z",
    updatedAt: "2026-09-15T16:00:00Z",
  },
  {
    id: "ORD-9019",
    parentOrderId: "PO-8808",
    vendorId: "v-prof-1",
    customerName: "David Miller",
    customerEmail: "dmiller@example.com",
    shippingAddress: "450 5th Ave, New York, NY 10018",
    items: [
      {
        id: "item-3",
        productId: "p-103",
        productName: "Noise-Cancelling Studio Headphones",
        productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
        quantity: 2,
        unitPrice: 129.5,
        totalPrice: 259.0,
      },
    ],
    subtotal: 259.0,
    commissionFee: 22.01,
    netPayout: 236.99,
    status: "DELIVERED",
    createdAt: "2026-09-14T09:00:00Z",
    updatedAt: "2026-09-15T10:00:00Z",
  },
];

export const OrderTable: React.FC = () => {
  const [orders, setOrders] = useState<SubOrder[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SubOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "ALL" || o.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleUpdateStatus = (orderId: string, newStatus: SubOrderStatus, tracking?: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, trackingNumber: tracking || o.trackingNumber } : o))
    );
    setSelectedOrder(null);
  };

  const columns: ColumnDef<SubOrder>[] = [
    {
      header: "SL",
      cell: (_, idx) => <span className="font-semibold text-slate-500 text-xs">{idx + 1}</span>,
    },
    {
      header: "Sub-Order ID",
      cell: (o) => (
        <div>
          <span className="font-bold text-primary block">{o.id}</span>
          <span className="text-[10px] text-slate-400">Parent: {o.parentOrderId}</span>
        </div>
      ),
    },
    {
      header: "Customer Details",
      cell: (o) => (
        <div>
          <p className="font-semibold text-slate-800">{o.customerName}</p>
          <p className="text-[10px] text-slate-400">{o.shippingAddress}</p>
        </div>
      ),
    },
    {
      header: "Order Items",
      cell: (o) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
            <Image src={o.items[0].productImage} alt="" fill className="object-cover" />
          </div>
          <div>
            <p className="font-medium text-slate-800">{o.items[0].productName}</p>
            <p className="text-[10px] text-slate-400">Qty: {o.items[0].quantity}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Subtotal",
      cell: (o) => <span className="font-semibold text-slate-800">{formatCurrency(o.subtotal)}</span>,
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
      cell: (o) => <span className="text-slate-500">{formatDate(o.createdAt)}</span>,
    },
    {
      header: "Actions",
      align: "right",
      cell: (o) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedOrder(o);
            setTrackingInput(o.trackingNumber || "");
          }}
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PaginateTable
        data={filteredOrders}
        columns={columns}
        keyExtractor={(o) => o.id}
        defaultPageSize={10}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex items-center justify-between">
            {/* Status Tabs */}
            <div className="border-b border-slate-200/80 pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {tab === "ALL" ? "All Orders" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search order ID or customer name..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
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
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="font-semibold text-primary">Customer: {selectedOrder.customerName}</p>
              <p className="text-slate-500">Address: {selectedOrder.shippingAddress}</p>
              <p className="text-slate-500">Email: {selectedOrder.customerEmail}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-700 mb-1">Item Details:</p>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-slate-100 py-1.5">
                  <span>
                    {item.productName} (x{item.quantity})
                  </span>
                  <span className="font-semibold">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="font-semibold text-slate-700 block mb-1">Update Tracking Number</label>
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="e.g. TRK-98741029"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <p className="font-semibold text-slate-700">Fulfillment Status:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "CONFIRMED")}
                >
                  Confirm
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "SHIPPED", trackingInput)}
                >
                  <Truck className="w-3.5 h-3.5" />
                  Ship
                </Button>
                <Button
                  variant="highlight"
                  size="sm"
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
    </div>
  );
};
