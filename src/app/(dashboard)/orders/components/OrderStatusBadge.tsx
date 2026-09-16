import React from "react";
import { SubOrderStatus } from "@/types/order";
import { Badge } from "@/components/ui/Badge";

interface OrderStatusBadgeProps {
  status: SubOrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
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
    case "RETURNED":
      return <Badge variant="neutral">Returned</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};
