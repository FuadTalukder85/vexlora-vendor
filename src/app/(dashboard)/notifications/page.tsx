"use client";

import React from "react";
import { Bell } from "lucide-react";
import { useVendorSettingsData } from "@/hooks/useVendorSettings";
import { NotificationSkeleton } from "./components/NotificationSkeleton";
import { NotificationFeed } from "./components/NotificationFeed";

export default function VendorNotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useVendorSettingsData();

  if (isLoading) {
    return <NotificationSkeleton />;
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Notifications</h1>
          <p className="text-xs text-secondary mt-1">
            Stay updated with real-time order fulfillments, financial payouts, and platform alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-highlight/10 text-highlight text-xs font-bold">
            <Bell className="w-3.5 h-3.5" />
            <span>{unreadCount} Unread Notifications</span>
          </div>
        )}
      </div>

      {/* Main Notifications Feed */}
      <div className="w-full">
        <NotificationFeed
          notifications={notifications}
          onMarkAllRead={markAllNotificationsRead}
          onClearAll={clearAllNotifications}
        />
      </div>
    </div>
  );
}
