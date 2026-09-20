import React, { Suspense } from "react";
import { OrderTable } from "./components/OrderTable";

export default function OrdersPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Vendor Sub-Orders</h1>
        <p className="text-xs text-secondary mt-1">
          Fulfill customer orders, assign tracking numbers, and view net earnings.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-secondary">Loading sub-orders...</div>}>
        <OrderTable />
      </Suspense>
    </div>
  );
}
