"use client";

import React, { useState } from "react";
import { LogOut, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { VendorProfile, VendorUser } from "@/types/vendor";
import { DeactivateStoreModal } from "./DeactivateStoreModal";

interface VendorDangerZoneTabProps {
  user: VendorUser;
  profile: VendorProfile;
  onLogout: () => Promise<void>;
}

export const VendorDangerZoneTab: React.FC<VendorDangerZoneTabProps> = ({
  user,
  profile,
  onLogout,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 w-full">
      <Card title="Account Identity & Multi-tenant Context" subtitle="Unique database reference keys">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Store Profile ID" value={profile.id} disabled />
          <Input label="Owner User ID" value={user.id} disabled />
        </div>
      </Card>

      <Card title="Session Termination" subtitle="Safely terminate your current authenticated session">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-primary">Sign Out of Dashboard</p>
            <p className="text-[11px] text-secondary mt-0.5">
              Terminates your cookie session and clears local authentication tokens.
            </p>
          </div>
          <Button type="button" variant="outline" size="md" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </Card>

      <Card title="Store Deactivation Request" subtitle="Request temporary or permanent storefront suspension">
        <div className="p-4 rounded-xl bg-highlight/5 border border-highlight/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-highlight flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Deactivate Storefront
            </h4>
            <p className="text-xs text-secondary mt-1">
              Submitting a deactivation inquiry will hide your catalog from public search and alert the platform admins
              to settle any unpaid balances before final closure.
            </p>
          </div>

          <Button type="button" variant="danger" size="md" onClick={() => setIsModalOpen(true)}>
            Request Deactivation
          </Button>
        </div>
      </Card>

      <DeactivateStoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
