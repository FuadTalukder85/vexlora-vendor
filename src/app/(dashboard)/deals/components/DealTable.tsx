"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Flame,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
  Search,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { DealRequestModal, ProductOption } from "./DealRequestModal";
import { DealsSkeleton } from "./DealsSkeleton";
import { getVendorSocket } from "@/lib/socket";
import { toast } from "sonner";

export interface DealRequestItem {
  id: string;
  productId: string;
  proposedDealPrice: number;
  requestedStartAt: string;
  requestedEndAt: string;
  quantityLimit?: number | null;
  maxPerCustomer?: number | null;
  note?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  product: {
    id: string;
    title: string;
    basePrice: number;
    images: string[];
  };
  deal?: {
    id: string;
    status: string;
    soldCount: number;
  } | null;
}

export const DealTable: React.FC = () => {
  const [requests, setRequests] = useState<DealRequestItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [dealsRes, productsRes] = await Promise.all([
        apiClient.get("/deals/requests/vendor/me"),
        apiClient.get("/products/vendor/me?limit=100"),
      ]);

      if (dealsRes.data?.data) {
        setRequests(dealsRes.data.data);
      }
      if (productsRes.data?.data) {
        setProducts(productsRes.data.data);
      }
    } catch (err: unknown) {
      if (!silent) {
        console.error("Failed to load deals data:", err);
        toast.error("Failed to load deal requests");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Connect to WebSocket & listen for real-time review updates
    const socket = getVendorSocket();

    const handleDealReviewed = (payload: any) => {
      fetchData(true);
      if (payload.data?.status === "APPROVED" || payload.status === "APPROVED") {
        toast.success(payload.message || "Your flash deal proposal was approved!", {
          duration: 5000,
        });
      } else {
        toast.error(payload.message || "Your flash deal proposal was rejected", {
          duration: 5000,
        });
      }
    };

    const handleDealUpdated = () => {
      fetchData(true);
    };

    socket.on("DEAL_REQUEST_REVIEWED", handleDealReviewed);
    socket.on("DEAL_UPDATED", handleDealUpdated);

    return () => {
      socket.off("DEAL_REQUEST_REVIEWED", handleDealReviewed);
      socket.off("DEAL_UPDATED", handleDealUpdated);
    };
  }, [fetchData]);

  if (isLoading) {
    return <DealsSkeleton />;
  }

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const activeCount = requests.filter((r) => r.deal?.status === "ACTIVE").length;

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.note && req.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "PENDING" && req.status === "PENDING") ||
      (activeTab === "APPROVED" && req.status === "APPROVED") ||
      (activeTab === "REJECTED" && req.status === "REJECTED");

    return matchesSearch && matchesTab;
  });

  const columns: ColumnDef<DealRequestItem>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Product",
      cell: (req) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-muted/60 border border-border shrink-0">
            <Image
              src={req.product?.images?.[0] || "/placeholder-product.png"}
              alt={req.product?.title || "Product"}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 max-w-[200px] sm:max-w-xs">
            <p className="text-xs font-bold text-primary truncate">
              {req.product?.title}
            </p>
            <p className="text-[11px] text-secondary">
              Regular: {formatCurrency(req.product?.basePrice || 0)}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Proposed Deal Price",
      cell: (req) => {
        const discount = Math.round(
          (((req.product?.basePrice || 0) - req.proposedDealPrice) /
            (req.product?.basePrice || 1)) *
          100
        );
        return (
          <div>
            <span className="font-bold text-xs text-primary">
              {formatCurrency(req.proposedDealPrice)}
            </span>
            <span className="ml-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-highlight/10 text-highlight">
              -{discount}%
            </span>
          </div>
        );
      },
    },
    {
      header: "Campaign Duration",
      cell: (req) => (
        <div className="text-[11px] text-secondary space-y-0.5">
          <div className="flex items-center gap-1">
            <span className="font-medium text-primary">From:</span> {formatDate(req.requestedStartAt)}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-primary">To:</span> {formatDate(req.requestedEndAt)}
          </div>
        </div>
      ),
    },
    {
      header: "Limits & Sold",
      cell: (req) => (
        <div className="text-xs text-secondary">
          <div>Quota: <b className="text-primary">{req.quantityLimit || "Unlimited"}</b></div>
          {req.deal && (
            <div className="text-[11px] text-highlight font-bold mt-0.5">
              Sold: {req.deal.soldCount} units
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Review Status",
      cell: (req) => {
        switch (req.status) {
          case "PENDING":
            return <Badge variant="warning">Under Review</Badge>;
          case "APPROVED":
            return <Badge variant="success">Approved</Badge>;
          case "REJECTED":
            return <Badge variant="danger">Rejected</Badge>;
          default:
            return <Badge variant="neutral">{req.status}</Badge>;
        }
      },
    },
    {
      header: "Admin Feedback",
      cell: (req) =>
        req.reviewNote ? (
          <p className="text-[11px] text-secondary max-w-[180px] truncate" title={req.reviewNote}>
            {req.reviewNote}
          </p>
        ) : (
          <span className="text-[11px] text-secondary/60 italic">—</span>
        ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      {/* 1. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 shrink-0">
        <StatCard
          title="Under Admin Review"
          value={pendingCount}
          icon={Clock}
          iconColorClass="text-warning bg-warning/10"
        />
        <StatCard
          title="Approved Deals"
          value={approvedCount}
          icon={CheckCircle2}
          iconColorClass="text-success bg-success/10"
        />
        <StatCard
          title="Live Flash Promotions"
          value={activeCount}
          icon={Flame}
          iconColorClass="text-highlight bg-highlight/10"
        />
      </div>

      {/* 2. Deals Table */}
      <PaginateTable
        data={filteredRequests}
        columns={columns}
        keyExtractor={(req) => req.id}
        defaultPageSize={15}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="border-b border-border pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-primary"
                    }`}
                >
                  {tab === "ALL" ? "All Proposals" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search & New Proposal Action */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search product proposal..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Propose Flash Deal
              </Button>
            </div>
          </div>
        }
      />

      {/* 3. Deal Proposal Modal */}
      <DealRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        onSuccess={fetchData}
      />
    </div>
  );
};
