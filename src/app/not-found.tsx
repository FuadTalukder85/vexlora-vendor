import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center space-y-4">
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-2xl">
        404
      </div>
      <h1 className="text-2xl font-extrabold text-primary">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm">
        The vendor portal route you are trying to access does not exist or has been moved.
      </p>
      <Link href="/">
        <Button variant="primary" size="md">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
