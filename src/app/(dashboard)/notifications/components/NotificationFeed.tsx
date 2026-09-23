"use client";

import React, { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { VendorNotification } from "@/hooks/useVendorSettings";
import { cn } from "@/lib/utils";

interface NotificationFeedProps {
  notifications: VendorNotification[];
  onMarkAllRead: () => Promise<any>;
  onClearAll: () => Promise<any>;
}

export const NotificationFeed: React.FC<NotificationFeedProps> = ({
  notifications,
  onMarkAllRead,
  onClearAll,
}) => {
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleConfirmClearAll = async () => {
    setIsClearing(true);
    try {
      await onClearAll();
      setIsClearModalOpen(false);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Card
        title="Recent Notifications"
        subtitle="System announcements, order notifications, and payout disbursements"
        action={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onMarkAllRead()}>
              <Check className="w-3.5 h-3.5" />
              Mark All Read
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={notifications.length === 0}
              onClick={() => setIsClearModalOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </Button>
          </div>
        }
      >
        {notifications.length > 0 ? (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      n.isRead ? "bg-border" : "bg-highlight"
                    )}
                  />
                  <div>
                    {n.title && <h4 className="text-xs font-bold text-primary">{n.title}</h4>}
                    <p className="text-xs text-secondary mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-secondary/80 mt-1 block">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <Bell className="w-10 h-10 text-secondary mb-2" />
            <p className="text-sm font-semibold text-primary">No notifications</p>
            <p className="text-xs text-secondary mt-0.5">You are completely up to date!</p>
          </div>
        )}
      </Card>

      {/* Clear All Notifications Confirmation Modal */}
      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => {
          if (!isClearing) setIsClearModalOpen(false);
        }}
        onConfirm={handleConfirmClearAll}
        title="Clear All Notifications"
        confirmText="Clear Notifications"
        variant="danger"
        isLoading={isClearing}
        description="Are you sure you want to permanently clear all notifications from your vendor feed? This action cannot be undone."
      />
    </>
  );
};
