import React from "react";
import { ProductTable } from "./components/ProductTable";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Product Catalog</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage prices, stock levels, categories, and visibility across Vexlora.
        </p>
      </div>

      <ProductTable />
    </div>
  );
}
