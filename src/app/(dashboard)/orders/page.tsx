import React from "react";
import { OrderTable } from "./components/OrderTable";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Vendor Sub-Orders</h1>
        <p className="text-xs text-slate-500 mt-1">
          Fulfill customer orders, assign tracking numbers, and view net earnings.
        </p>
      </div>

      <OrderTable />
    </div>
  );
}
