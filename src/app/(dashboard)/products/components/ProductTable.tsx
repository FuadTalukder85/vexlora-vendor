"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit, Trash2, Eye, Plus, Search, Filter } from "lucide-react";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";

const mockProducts: Product[] = [
  {
    id: "p-101",
    vendorId: "v-prof-1",
    title: "Pro Wireless Mechanical Gaming Keyboard",
    slug: "pro-wireless-mechanical-keyboard",
    description: "Custom RGB mechanical keyboard with hot-swappable tactile switches and ultra-low latency.",
    category: "Electronics",
    basePrice: 149.99,
    compareAtPrice: 179.99,
    stock: 45,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300"],
    salesCount: 312,
    createdAt: "2026-02-10T00:00:00Z",
    updatedAt: "2026-09-10T00:00:00Z",
  },
  {
    id: "p-102",
    vendorId: "v-prof-1",
    title: "Ultra HD Curved Monitor 34-Inch 144Hz",
    slug: "ultra-hd-curved-monitor-34",
    description: "Immersive 34-inch ultrawide display with HDR400, 1ms response time and dual HDMI ports.",
    category: "Electronics",
    basePrice: 599.0,
    compareAtPrice: 699.0,
    stock: 12,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300"],
    salesCount: 89,
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-09-12T00:00:00Z",
  },
  {
    id: "p-103",
    vendorId: "v-prof-1",
    title: "Noise-Cancelling Studio Headphones",
    slug: "noise-cancelling-studio-headphones",
    description: "Active noise cancellation wireless headphones with 40-hour battery life and HD mic.",
    category: "Audio",
    basePrice: 129.5,
    stock: 0,
    status: "OUT_OF_STOCK",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"],
    salesCount: 520,
    createdAt: "2025-11-15T00:00:00Z",
    updatedAt: "2026-09-14T00:00:00Z",
  },
  {
    id: "p-104",
    vendorId: "v-prof-1",
    title: "Ergonomic Aluminium Laptop Stand",
    slug: "ergonomic-aluminium-laptop-stand",
    description: "Adjustable height aluminium alloy desktop riser with heat-dissipation ventilation slots.",
    category: "Accessories",
    basePrice: 49.99,
    compareAtPrice: 59.99,
    stock: 120,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300"],
    salesCount: 418,
    createdAt: "2026-01-20T00:00:00Z",
    updatedAt: "2026-09-08T00:00:00Z",
  },
  {
    id: "p-105",
    vendorId: "v-prof-1",
    title: "RGB Streaming Condenser Microphone",
    slug: "rgb-streaming-condenser-mic",
    description: "Cardioid USB microphone with quick touch mute button and shock mount.",
    category: "Audio",
    basePrice: 89.0,
    stock: 18,
    status: "DRAFT",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300"],
    salesCount: 0,
    createdAt: "2026-09-14T00:00:00Z",
    updatedAt: "2026-09-14T00:00:00Z",
  },
];

export const ProductTable: React.FC = () => {
  const [products] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "OUT_OF_STOCK":
        return <Badge variant="danger" className="font-bold">Out of Stock</Badge>;
      case "DRAFT":
        return <Badge variant="warning">Draft</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header Filters & Search */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product title or category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          <Link href="/products/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Product</th>
              <th className="py-3.5 px-5">Category</th>
              <th className="py-3.5 px-5">Price</th>
              <th className="py-3.5 px-5">Stock</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Sales</th>
              <th className="py-3.5 px-5">Created</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                      <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-primary truncate max-w-xs">{p.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {p.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-5 font-medium text-slate-600">{p.category}</td>
                <td className="py-3.5 px-5 font-bold text-slate-800">
                  {formatCurrency(p.basePrice)}
                  {p.compareAtPrice && (
                    <span className="text-[10px] text-slate-400 line-through block font-normal">
                      {formatCurrency(p.compareAtPrice)}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5">
                  <span
                    className={
                      p.stock === 0
                        ? "font-bold text-rose-600"
                        : p.stock < 15
                        ? "font-semibold text-amber-600"
                        : "font-semibold text-slate-700"
                    }
                  >
                    {p.stock} units
                  </span>
                </td>
                <td className="py-3.5 px-5">{getStatusBadge(p.status)}</td>
                <td className="py-3.5 px-5 font-medium text-slate-700">{p.salesCount} sold</td>
                <td className="py-3.5 px-5 text-slate-500">{formatDate(p.createdAt)}</td>
                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-highlight hover:bg-rose-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
