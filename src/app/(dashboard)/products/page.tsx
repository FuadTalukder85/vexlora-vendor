import React from "react";
import { ProductTable } from "./components/ProductTable";

export default function ProductsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Product Catalog</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage prices, stock levels, categories, and visibility across Vexlora.
        </p>
      </div>

      <ProductTable />
    </div>
  );
}
