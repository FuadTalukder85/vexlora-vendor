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
import { useVendorOrders } from "@/hooks/useVendorOrders";

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
        <p className="font-semibold text-primary">{row.customerName}</p>
        <p className="text-[10px] text-secondary">{row.customerEmail}</p>
      </div>
    ),
  },
  {
    header: "Items",
    cell: (row) => (
      <span className="font-medium text-secondary">
        {row.items[0]?.productName || "Item"}
        {row.items.length > 1 ? ` +${row.items.length - 1} more` : ""}
      </span>
    ),
  },
  {
    header: "Total",
    cell: (row) => (
      <span className="font-semibold text-primary">{formatCurrency(row.subtotal)}</span>
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
    cell: (row) => <span className="text-secondary">{formatDate(row.createdAt)}</span>,
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
  const { data } = useVendorOrders({ limit: 5 });
  const orders = data?.orders || [];

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
      data={orders}
      columns={columns}
      keyExtractor={(item) => item.id}
      defaultPageSize={5}
      showPagination={true}
    />
  );
};

