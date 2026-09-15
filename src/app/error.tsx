"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Vendor Dashboard Error:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-14 h-14 bg-rose-50 text-highlight rounded-2xl flex items-center justify-center font-bold text-xl">
        !
      </div>
      <h2 className="text-xl font-extrabold text-primary">Something went wrong</h2>
      <p className="text-xs text-slate-500 max-w-md">
        An error occurred while rendering this vendor section. Please try again.
      </p>
      <Button variant="primary" size="sm" onClick={() => reset()}>
        Try Again
      </Button>
    </div>
  );
}
