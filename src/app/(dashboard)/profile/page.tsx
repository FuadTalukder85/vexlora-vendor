"use client";

import React, { useState } from "react";
import { User, ShieldCheck, AlertTriangle, Store } from "lucide-react";
import { useVendorSettingsData } from "@/hooks/useVendorSettings";
import { useVendorStore } from "@/stores/useVendorStore";
import { ProfileSkeleton } from "./components/ProfileSkeleton";
import { Badge } from "@/components/ui/Badge";
import { OwnerProfileTab } from "./components/OwnerProfileTab";
import { VendorSecurityTab } from "./components/VendorSecurityTab";
import { VendorDangerZoneTab } from "./components/VendorDangerZoneTab";
import { cn } from "@/lib/utils";

type ProfileTab = "owner" | "security" | "danger";

export default function VendorProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("owner");
  const { logout } = useVendorStore();

  const {
    user,
    profile,
    sessions,
    isLoading,
    updateUser,
    isUpdatingUser,
    uploadAvatar,
    removeAvatar,
    changePassword,
    revokeSession,
    revokeOtherSessions,
  } = useVendorSettingsData();

  if (isLoading || !user || !profile) {
    return <ProfileSkeleton />;
  }

  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: "owner", label: "Owner Profile", icon: <User className="w-4 h-4" /> },
    { id: "security", label: "Security & Sessions", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "danger", label: "Account / Danger Zone", icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Vendor Profile</h1>
          <p className="text-xs text-secondary mt-1">
            Manage your personal merchant identity, authentication security, and session controls.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="primary">{user.role || "VENDOR"}</Badge>
          <Badge variant="neutral" className="text-xs font-semibold py-1 px-3 inline-flex items-center">
            Owner of{" "}
            <span className="ml-1.5 px-2 py-0.5 rounded-md bg-primary text-white font-bold text-[11px] uppercase tracking-wide">
              {profile.storeName}
            </span>
          </Badge>
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
        {activeTab === "owner" && (
          <OwnerProfileTab
            user={user}
            profile={profile}
            onUpdateUser={updateUser}
            onUploadAvatar={uploadAvatar}
            onRemoveAvatar={removeAvatar}
            isUpdating={isUpdatingUser}
          />
        )}

        {activeTab === "security" && (
          <VendorSecurityTab
            sessions={sessions}
            onChangePassword={changePassword}
            onRevokeSession={revokeSession}
            onRevokeOtherSessions={revokeOtherSessions}
          />
        )}

        {activeTab === "danger" && (
          <VendorDangerZoneTab user={user} profile={profile} onLogout={logout} />
        )}
      </div>
    </div>
  );
}
