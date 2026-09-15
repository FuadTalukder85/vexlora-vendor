import React from "react";
import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { SubOrder } from "@/types/order";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";

const mockOrders: SubOrder[] = [
  {
    id: "ORD-9021",
    parentOrderId: "PO-8810",
    vendorId: "v-prof-1",
    customerName: "Sarah Jenkins",
    customerEmail: "sarah.j@example.com",
    shippingAddress: "742 Evergreen Terrace, Springfield",
    items: [
      {
        id: "item-1",
        productId: "p-101",
        productName: "Pro Wireless Mechanical Gaming Keyboard",
        productImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100",
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
    shippingAddress: "1200 Market St, San Francisco, CA",
    items: [
      {
        id: "item-2",
        productId: "p-102",
        productName: "Ultra HD Curved Monitor 34-Inch",
        productImage: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100",
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
    shippingAddress: "450 5th Ave, New York, NY",
    items: [
      {
        id: "item-3",
        productId: "p-103",
        productName: "Noise-Cancelling Studio Headphones",
        productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100",
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
  {
    id: "ORD-9018",
    parentOrderId: "PO-8807",
    vendorId: "v-prof-1",
    customerName: "Emma Watson",
    customerEmail: "emma.w@example.com",
    shippingAddress: "32 Wall St, New York, NY",
    items: [
      {
        id: "item-4",
        productId: "p-104",
        productName: "Ergonomic Aluminium Laptop Stand",
        productImage: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100",
        quantity: 1,
        unitPrice: 49.99,
        totalPrice: 49.99,
      },
    ],
    subtotal: 49.99,
    commissionFee: 4.25,
    netPayout: 45.74,
    status: "PENDING",
    createdAt: "2026-09-14T08:12:00Z",
    updatedAt: "2026-09-14T08:12:00Z",
  },
];

const getStatusBadge = (status: SubOrder["status"]) => {
  switch (status) {
    case "DELIVERED":
      return <Badge variant="success">Delivered</Badge>;
    case "SHIPPED":
      return <Badge variant="info">Shipped</Badge>;
    case "CONFIRMED":
      return <Badge variant="primary">Confirmed</Badge>;
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>;
    case "CANCELLED":
      return <Badge variant="danger">Cancelled</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export const RecentOrdersTable: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-primary">Recent Orders</h3>
          <p className="text-xs text-slate-500 mt-0.5">Fulfillment status of latest customer purchases</p>
        </div>
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
            View All Orders
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-5">Order ID</th>
              <th className="py-3 px-5">Customer</th>
              <th className="py-3 px-5">Items</th>
              <th className="py-3 px-5">Total</th>
              <th className="py-3 px-5">Net Payout</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Date</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {mockOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-5 font-bold text-primary">{order.id}</td>
                <td className="py-3.5 px-5">
                  <p className="font-semibold text-slate-800">{order.customerName}</p>
                  <p className="text-[10px] text-slate-400">{order.customerEmail}</p>
                </td>
                <td className="py-3.5 px-5">
                  <span className="font-medium text-slate-700">
                    {order.items[0]?.productName}
                    {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                  </span>
                </td>
                <td className="py-3.5 px-5 font-semibold text-slate-800">
                  {formatCurrency(order.subtotal)}
                </td>
                <td className="py-3.5 px-5 font-semibold text-emerald-600">
                  {formatCurrency(order.netPayout)}
                </td>
                <td className="py-3.5 px-5">{getStatusBadge(order.status)}</td>
                <td className="py-3.5 px-5 text-slate-500">{formatDate(order.createdAt)}</td>
                <td className="py-3.5 px-5 text-right">
                  <Link href="/orders">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
