"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center p-6 bg-muted text-center font-sans">
        <h2 className="text-xl font-bold text-primary">Something went wrong</h2>
        <p className="text-xs text-secondary mt-1">{error.message || "An unexpected error occurred."}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
