"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit, Trash2, Eye, Plus, Search, Filter } from "lucide-react";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
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
  {
    id: "p-106",
    vendorId: "v-prof-1",
    title: "Ergonomic Wireless Gaming Mouse 16000 DPI",
    slug: "ergonomic-wireless-gaming-mouse",
    description: "Lightweight honeycomb wireless gaming mouse with optical sensor and PTFE feet.",
    category: "Gaming",
    basePrice: 69.99,
    compareAtPrice: 79.99,
    stock: 64,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300"],
    salesCount: 240,
    createdAt: "2026-04-12T00:00:00Z",
    updatedAt: "2026-09-11T00:00:00Z",
  },
  {
    id: "p-107",
    vendorId: "v-prof-1",
    title: "Dual 4K USB-C Docking Station 100W PD",
    slug: "dual-4k-usb-c-docking-station",
    description: "Multi-port hub with dual HDMI, DisplayPort, Gigabit Ethernet, and SD card reader.",
    category: "Accessories",
    basePrice: 119.0,
    compareAtPrice: 139.0,
    stock: 28,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=300"],
    salesCount: 175,
    createdAt: "2026-05-02T00:00:00Z",
    updatedAt: "2026-09-09T00:00:00Z",
  },
  {
    id: "p-108",
    vendorId: "v-prof-1",
    title: "Smart Bluetooth Fitness Tracker Watch",
    slug: "smart-bluetooth-fitness-tracker",
    description: "AMOLED touchscreen smartwatch with SpO2 monitoring, GPS and 14-day battery life.",
    category: "Electronics",
    basePrice: 159.99,
    stock: 8,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"],
    salesCount: 390,
    createdAt: "2026-03-18T00:00:00Z",
    updatedAt: "2026-09-13T00:00:00Z",
  },
  {
    id: "p-109",
    vendorId: "v-prof-1",
    title: "Hi-Fi Desktop Bookshelf Speakers 80W",
    slug: "hifi-desktop-bookshelf-speakers",
    description: "Wood enclosure active Bluetooth speakers with optical input and sub-out support.",
    category: "Audio",
    basePrice: 199.0,
    compareAtPrice: 229.0,
    stock: 14,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300"],
    salesCount: 95,
    createdAt: "2026-06-10T00:00:00Z",
    updatedAt: "2026-09-10T00:00:00Z",
  },
  {
    id: "p-110",
    vendorId: "v-prof-1",
    title: "NVMe M.2 2TB High-Speed Internal SSD",
    slug: "nvme-m2-2tb-high-speed-ssd",
    description: "PCIe 4.0 read speeds up to 7450 MB/s with custom heatsink for PC and console.",
    category: "Computers",
    basePrice: 179.99,
    compareAtPrice: 199.99,
    stock: 0,
    status: "OUT_OF_STOCK",
    images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300"],
    salesCount: 610,
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-09-15T00:00:00Z",
  },
  {
    id: "p-111",
    vendorId: "v-prof-1",
    title: "Extended XL Desk Pad Mouse Pad (900x400mm)",
    slug: "extended-xl-desk-pad-mouse-pad",
    description: "Water-resistant micro-weave cloth mat with stitched anti-fray edges.",
    category: "Accessories",
    basePrice: 24.99,
    stock: 150,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=300"],
    salesCount: 820,
    createdAt: "2026-01-05T00:00:00Z",
    updatedAt: "2026-09-07T00:00:00Z",
  },
  {
    id: "p-112",
    vendorId: "v-prof-1",
    title: "USB Webcam 4K HDR with Dual Noise Mic",
    slug: "usb-webcam-4k-hdr-dual-mic",
    description: "Autofocus 4K streaming camera with privacy shutter and tripod mount.",
    category: "Electronics",
    basePrice: 99.0,
    compareAtPrice: 119.0,
    stock: 35,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=300"],
    salesCount: 185,
    createdAt: "2026-04-20T00:00:00Z",
    updatedAt: "2026-09-12T00:00:00Z",
  },
  {
    id: "p-113",
    vendorId: "v-prof-1",
    title: "Wireless Controller with Hall Effect Joysticks",
    slug: "wireless-controller-hall-effect",
    description: "Multi-platform Bluetooth gamepad with zero drift analog sticks and programmable back paddles.",
    category: "Gaming",
    basePrice: 59.99,
    stock: 42,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=300"],
    salesCount: 310,
    createdAt: "2026-05-15T00:00:00Z",
    updatedAt: "2026-09-14T00:00:00Z",
  },
  {
    id: "p-114",
    vendorId: "v-prof-1",
    title: "Foldable Portable Monitor 15.6-Inch IPS 1080P",
    slug: "foldable-portable-monitor-15-inch",
    description: "Slim USB-C second display with protective cover stand for laptops and smartphones.",
    category: "Computers",
    basePrice: 149.0,
    compareAtPrice: 169.0,
    stock: 19,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1547082299-de196ea013d6?w=300"],
    salesCount: 140,
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-09-10T00:00:00Z",
  },
  {
    id: "p-115",
    vendorId: "v-prof-1",
    title: "RGB Light Bar Monitor Screen Lamp",
    slug: "rgb-light-bar-monitor-lamp",
    description: "Asymmetric optical glare-free eye protection desk light with wireless touch dial.",
    category: "Accessories",
    basePrice: 44.99,
    stock: 5,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300"],
    salesCount: 265,
    createdAt: "2026-03-25T00:00:00Z",
    updatedAt: "2026-09-13T00:00:00Z",
  },
  {
    id: "p-116",
    vendorId: "v-prof-1",
    title: "High Precision Mechanical Keycaps Set PBT",
    slug: "mechanical-keycaps-set-pbt",
    description: "135-key double-shot PBT Cherry profile keycap set for custom mechanical keyboards.",
    category: "Gaming",
    basePrice: 34.99,
    stock: 80,
    status: "DRAFT",
    images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?w=300"],
    salesCount: 0,
    createdAt: "2026-09-15T00:00:00Z",
    updatedAt: "2026-09-15T00:00:00Z",
  },
  {
    id: "p-117",
    vendorId: "v-prof-1",
    title: "Fast Wireless Charging Stand 15W",
    slug: "fast-wireless-charging-stand-15w",
    description: "Qi-certified dual coil vertical charging stand for iOS and Android devices.",
    category: "Electronics",
    basePrice: 29.99,
    compareAtPrice: 34.99,
    stock: 95,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1622445268465-84288045f5fa?w=300"],
    salesCount: 430,
    createdAt: "2026-02-18T00:00:00Z",
    updatedAt: "2026-09-08T00:00:00Z",
  },
  {
    id: "p-118",
    vendorId: "v-prof-1",
    title: "Active Noise-Cancelling Earbuds True Wireless",
    slug: "anc-earbuds-true-wireless",
    description: "Bluetooth 5.3 earbuds with 32h playback, wireless charging case and IPX7 rating.",
    category: "Audio",
    basePrice: 79.99,
    compareAtPrice: 99.99,
    stock: 52,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300"],
    salesCount: 510,
    createdAt: "2026-01-30T00:00:00Z",
    updatedAt: "2026-09-12T00:00:00Z",
  },
  {
    id: "p-119",
    vendorId: "v-prof-1",
    title: "Heavy Duty Gas Spring Dual Monitor Arm",
    slug: "gas-spring-dual-monitor-arm",
    description: "Desk clamp VESA mount bracket supporting 17 to 32 inch screens up to 9kg each.",
    category: "Accessories",
    basePrice: 79.0,
    stock: 22,
    status: "ACTIVE",
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300"],
    salesCount: 160,
    createdAt: "2026-04-05T00:00:00Z",
    updatedAt: "2026-09-11T00:00:00Z",
  },
  {
    id: "p-120",
    vendorId: "v-prof-1",
    title: "Custom Coiled Aviator USB-C Cable",
    slug: "custom-coiled-aviator-usbc-cable",
    description: "Double-sleeved braided cable with GX16 detachable metal aviator connector.",
    category: "Gaming",
    basePrice: 28.5,
    stock: 0,
    status: "OUT_OF_STOCK",
    images: ["https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=300"],
    salesCount: 380,
    createdAt: "2026-03-10T00:00:00Z",
    updatedAt: "2026-09-15T00:00:00Z",
  },
];

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

const columns: ColumnDef<Product>[] = [
  {
    header: "SL",
    cell: (_, idx) => <span className="font-semibold text-slate-500 text-xs">{idx + 1}</span>,
  },
  {
    header: "Product",
    cell: (p) => (
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
          <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-primary truncate max-w-xs">{p.title}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {p.id}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Category",
    cell: (p) => <span className="font-medium text-slate-600">{p.category}</span>,
  },
  {
    header: "Price",
    cell: (p) => (
      <div className="font-bold text-slate-800">
        {formatCurrency(p.basePrice)}
        {p.compareAtPrice && (
          <span className="text-[10px] text-slate-400 line-through block font-normal">
            {formatCurrency(p.compareAtPrice)}
          </span>
        )}
      </div>
    ),
  },
  {
    header: "Stock",
    cell: (p) => (
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
    ),
  },
  {
    header: "Status",
    cell: (p) => getStatusBadge(p.status),
  },
  {
    header: "Sales",
    cell: (p) => <span className="font-medium text-slate-700">{p.salesCount} sold</span>,
  },
  {
    header: "Created",
    cell: (p) => <span className="text-slate-500">{formatDate(p.createdAt)}</span>,
  },
  {
    header: "Actions",
    align: "right",
    cell: () => (
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
    ),
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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PaginateTable
        data={filteredProducts}
        columns={columns}
        keyExtractor={(item) => item.id}
        defaultPageSize={10}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex items-center justify-between">
            {/* Status Tabs */}
            <div className="border-b border-slate-200/80 pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "ACTIVE", "DRAFT", "OUT_OF_STOCK", "REJECTED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${statusFilter === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {tab === "ALL"
                    ? "All Products"
                    : tab === "OUT_OF_STOCK"
                      ? "Out of Stock"
                      : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product title or category..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />
    </div>
  );
};
