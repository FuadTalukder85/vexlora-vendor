"use client";

import React, { useState } from "react";
import { Store, FileCheck, CreditCard } from "lucide-react";
import { useVendorSettingsData } from "@/hooks/useVendorSettings";
import { SettingsSkeleton } from "./components/SettingsSkeleton";
import { Badge } from "@/components/ui/Badge";
import { StoreBrandingSettings } from "./components/StoreBrandingSettings";
import { DocumentsSettings } from "./components/DocumentsSettings";
import { PayoutsPaymentSettings } from "./components/PayoutsPaymentSettings";
import { cn } from "@/lib/utils";

type SettingsTab = "store" | "documents" | "payments";

export default function VendorSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("store");

  const {
    profile,
    payoutStats,
    stripeStatus,
    isLoading,
    updateProfile,
    isUpdatingProfile,
    uploadLogo,
    removeLogo,
    uploadBanner,
    removeBanner,
    uploadDocument,
    deleteDocument,
  } = useVendorSettingsData();

  if (isLoading || !profile) {
    return <SettingsSkeleton />;
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "store", label: "Store & Branding", icon: <Store className="w-4 h-4" /> },
    { id: "documents", label: "Legal & Compliance Documents", icon: <FileCheck className="w-4 h-4" /> },
    { id: "payments", label: "Payouts & Stripe", icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Store Settings</h1>
          <p className="text-xs text-secondary mt-1">
            Customize storefront branding, verify legal compliance, and manage automated payout gateways.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              profile.status === "APPROVED"
                ? "success"
                : profile.status === "PENDING"
                  ? "warning"
                  : profile.status === "SUSPENDED"
                    ? "danger"
                    : "neutral"
            }
          >
            Store Status: {profile.status}
          </Badge>
          {profile.commissionRate !== undefined && (
            <Badge variant="primary">Commission: {profile.commissionRate}%</Badge>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border no-scrollbar w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer",
              activeTab === tab.id
                ? "bg-primary text-white shadow-xs"
                : "text-secondary hover:text-primary hover:bg-muted/70"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {activeTab === "store" && (
          <StoreBrandingSettings
            profile={profile}
            onUpdateProfile={updateProfile}
            onUploadLogo={uploadLogo}
            onRemoveLogo={removeLogo}
            onUploadBanner={uploadBanner}
            onRemoveBanner={removeBanner}
            isUpdating={isUpdatingProfile}
          />
        )}

        {activeTab === "documents" && (
          <DocumentsSettings
            documents={profile.documents}
            onUploadDocument={uploadDocument}
            onDeleteDocument={deleteDocument}
          />
        )}

        {activeTab === "payments" && (
          <PayoutsPaymentSettings
            profile={profile}
            payoutStats={payoutStats}
            stripeStatus={stripeStatus}
            onUpdateProfile={updateProfile}
            isUpdating={isUpdatingProfile}
          />
        )}
      </div>
    </div>
  );
}
