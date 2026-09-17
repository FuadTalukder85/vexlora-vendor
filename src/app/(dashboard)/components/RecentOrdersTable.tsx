"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { SubOrder } from "@/types/order";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
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

const columns: ColumnDef<SubOrder>[] = [
  {
    header: "Order ID",
    cell: (row) => <span className="font-bold text-primary">{row.id}</span>,
  },
  {
    header: "Customer",
    cell: (row) => (
      <div>
        <p className="font-semibold text-slate-800">{row.customerName}</p>
        <p className="text-[10px] text-slate-400">{row.customerEmail}</p>
      </div>
    ),
  },
  {
    header: "Items",
    cell: (row) => (
      <span className="font-medium text-slate-700">
        {row.items[0]?.productName}
        {row.items.length > 1 ? ` +${row.items.length - 1} more` : ""}
      </span>
    ),
  },
  {
    header: "Total",
    cell: (row) => (
      <span className="font-semibold text-slate-800">{formatCurrency(row.subtotal)}</span>
    ),
  },
  {
    header: "Net Payout",
    cell: (row) => (
      <span className="font-semibold text-emerald-600">{formatCurrency(row.netPayout)}</span>
    ),
  },
  {
    header: "Status",
    cell: (row) => getStatusBadge(row.status),
  },
  {
    header: "Date",
    cell: (row) => <span className="text-slate-500">{formatDate(row.createdAt)}</span>,
  },
  {
    header: "Action",
    align: "right",
    cell: () => (
      <TableActions>
        <TableActionButton
          as={Link}
          href="/orders"
          title="View Order"
        >
          <Eye className="w-4 h-4" />
        </TableActionButton>
      </TableActions>
    ),
  },
];

export const RecentOrdersTable: React.FC = () => {
  return (
    <PaginateTable
      title="Recent Orders"
      subtitle="Fulfillment status of latest customer purchases"
      action={
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
            View All Orders
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      }
      data={mockOrders}
      columns={columns}
      keyExtractor={(item) => item.id}
      defaultPageSize={5}
      showPagination={true}
    />
  );
};
