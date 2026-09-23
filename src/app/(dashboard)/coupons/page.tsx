"use client";

import React, { useState } from "react";
import { Plus, Search, Tag, Sparkles, CheckCircle2, History } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import {
  useVendorCoupons,
  useCreateVendorCoupon,
  useUpdateVendorCoupon,
  useToggleVendorCouponStatus,
  useDeleteVendorCoupon,
  useVendorCouponUsageLogs,
} from "@/hooks/useVendorCoupons";
import { CouponTable } from "./components/CouponTable";
import { CouponModal } from "./components/CouponModal";
import { CouponUsageLogsTable } from "./components/CouponUsageLogsTable";
import { VendorCoupon } from "@/types/coupon";

export default function VendorCouponsPage() {
  const [activeTab, setActiveTab] = useState<"COUPONS" | "LOGS">("COUPONS");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<VendorCoupon | null>(null);

  const { data: couponData, isLoading: isCouponsLoading } = useVendorCoupons({
    searchTerm: searchTerm.trim() || undefined,
    isActive: statusFilter === "ACTIVE" ? true : statusFilter === "INACTIVE" ? false : undefined,
  });

  const { data: logsData, isLoading: isLogsLoading } = useVendorCouponUsageLogs({
    searchTerm: searchTerm.trim() || undefined,
  });

  const createCouponMutation = useCreateVendorCoupon();
  const updateCouponMutation = useUpdateVendorCoupon();
  const toggleStatusMutation = useToggleVendorCouponStatus();
  const deleteCouponMutation = useDeleteVendorCoupon();

  const coupons = couponData?.coupons || [];
  const logs = logsData?.logs || [];

  // Metrics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive && (!c.expiresAt || new Date(c.expiresAt) > new Date())).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: VendorCoupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (payload: any) => {
    if (editingCoupon) {
      await updateCouponMutation.mutateAsync({ id: editingCoupon.id, payload: payload.payload || payload });
    } else {
      await createCouponMutation.mutateAsync(payload);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = async (coupon: VendorCoupon) => {
    await toggleStatusMutation.mutateAsync({ id: coupon.id, isActive: !coupon.isActive });
  };

  const handleDeleteCoupon = async (coupon: VendorCoupon) => {
    if (window.confirm(`Are you sure you want to permanently delete coupon "${coupon.code}"?`)) {
      await deleteCouponMutation.mutateAsync(coupon.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-5.5rem)] space-y-4">
      {/* 1. Header (Shrink-0) */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Coupons & Discounts</h1>
          <p className="text-xs text-secondary mt-1">
            Create promotional discount codes exclusive to your store items and monitor redemptions.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreateModal} className="self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Create Store Voucher
        </Button>
      </div>

      {/* 2. Metric Stat Cards (Shrink-0) */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Store Coupons"
          value={totalCoupons}
          icon={Tag}
          iconColorClass="bg-primary/10 text-primary"
        />
        <StatCard
          title="Active Promotions"
          value={activeCoupons}
          icon={CheckCircle2}
          iconColorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total Redemptions"
          value={totalRedemptions}
          icon={Sparkles}
          iconColorClass="bg-highlight/10 text-highlight"
        />
      </div>

      {/* 3. Main Switcher & Table Area (Flex-1 Min-h-0) */}
      <div className="flex-1 min-h-0 flex flex-col space-y-3">
        {/* Main Tab Switcher */}
        <div className="shrink-0 flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("COUPONS")}
              className={`flex items-center gap-2 text-xs font-bold transition-all border-b-2 pb-2 -mb-2.5 cursor-pointer ${
                activeTab === "COUPONS"
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>My Store Coupons ({totalCoupons})</span>
            </button>
            <button
              onClick={() => setActiveTab("LOGS")}
              className={`flex items-center gap-2 text-xs font-bold transition-all border-b-2 pb-2 -mb-2.5 cursor-pointer ${
                activeTab === "LOGS"
                  ? "border-primary text-primary"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Redemption History ({logs.length})</span>
            </button>
          </div>
        </div>

        {/* Table Views with Header Content */}
        {activeTab === "COUPONS" ? (
          <CouponTable
            coupons={coupons}
            isLoading={isCouponsLoading}
            onEdit={handleOpenEditModal}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteCoupon}
            headerContent={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Status Tabs */}
                <div className="flex items-center gap-1 bg-white border border-border p-1 rounded-xl">
                  {(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        statusFilter === st
                          ? "bg-primary text-white shadow-2xs"
                          : "text-secondary hover:text-primary"
                      }`}
                    >
                      {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search voucher code..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            }
          />
        ) : (
          <CouponUsageLogsTable
            logs={logs}
            isLoading={isLogsLoading}
            headerContent={
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-secondary font-medium">
                  Auditing all customer checkouts where your store coupons were applied
                </p>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search voucher code..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            }
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={editingCoupon}
        onSave={handleSaveCoupon}
        isSaving={createCouponMutation.isPending || updateCouponMutation.isPending}
      />
    </div>
  );
}
