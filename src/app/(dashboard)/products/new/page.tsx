import React from "react";
import { ProductForm } from "../components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Create New Product</h1>
        <p className="text-xs text-slate-500 mt-1">
          Add a new item to your store catalog with pricing, stock and media assets.
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
