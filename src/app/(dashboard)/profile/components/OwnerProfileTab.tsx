"use client";

import React, { useState, useEffect } from "react";
import { Save, CheckCircle2, Store } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ImageUploadDropzone } from "@/components/ui/ImageUploadDropzone";
import { VendorUser, VendorProfile } from "@/types/vendor";
import { toast } from "sonner";

interface OwnerProfileTabProps {
  user: VendorUser;
  profile?: VendorProfile;
  onUpdateUser: (data: { name?: string; phone?: string | null }) => Promise<any>;
  onUploadAvatar: (file: File) => Promise<any>;
  onRemoveAvatar: () => Promise<any>;
  isUpdating: boolean;
}

export const OwnerProfileTab: React.FC<OwnerProfileTabProps> = ({
  user,
  profile,
  onUpdateUser,
  onUploadAvatar,
  onRemoveAvatar,
  isUpdating,
}) => {
  const [ownerName, setOwnerName] = useState(user.name || "");
  const [ownerPhone, setOwnerPhone] = useState(user.phone || "");

  useEffect(() => {
    setOwnerName(user.name || "");
    setOwnerPhone(user.phone || "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await onUpdateUser({
        name: ownerName.trim(),
        phone: ownerPhone.trim() || null,
      });
      toast.success("Owner profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-6 w-full">
      <Card title="Owner Avatar & Identity" subtitle="Personal account information">
        <ImageUploadDropzone
          label="Profile Picture / Avatar"
          aspectRatio="square"
          currentUrl={user.image}
          helperText="Square photo • Max 5MB"
          onUpload={onUploadAvatar}
          onRemove={onRemoveAvatar}
        />
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <Card title="Personal Details" subtitle="Contact info and security credentials">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              required
            />
            <Input
              label="Contact Phone"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Account Email"
                value={user.email}
                disabled
                helperText="Primary email cannot be changed without verification"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary tracking-wide block mb-1">
                Store Ownership & Status
              </label>
              <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                {profile?.storeName && (
                  <Badge variant="neutral" className="text-xs font-semibold py-1 px-3 inline-flex items-center">
                    Owner of{" "}
                    <span className="ml-1.5 px-2 py-0.5 rounded-md bg-primary text-white font-bold text-[11px] uppercase tracking-wide">
                      {profile.storeName}
                    </span>
                  </Badge>
                )}
                <Badge variant="success">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Verified Merchant
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isUpdating}>
            <Save className="w-4 h-4" />
            Save Owner Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
