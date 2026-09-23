import React, { Suspense } from "react";
import { DealTable } from "./components/DealTable";
import { DealsSkeleton } from "./components/DealsSkeleton";

export default function VendorDealsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Flash Deals & Campaigns</h1>
        <p className="text-xs text-secondary mt-1">
          Submit promotional discount proposals, track admin approval statuses, and monitor live sale quotas.
        </p>
      </div>

      <Suspense fallback={<DealsSkeleton />}>
        <DealTable />
      </Suspense>
    </div>
  );
}
