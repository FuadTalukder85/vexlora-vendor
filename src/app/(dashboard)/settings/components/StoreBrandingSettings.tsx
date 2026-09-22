"use client";

import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploadDropzone } from "@/components/ui/ImageUploadDropzone";
import { VendorProfile } from "@/types/vendor";
import { toast } from "sonner";

interface StoreBrandingSettingsProps {
  profile: VendorProfile;
  onUpdateProfile: (data: Partial<VendorProfile>) => Promise<any>;
  onUploadLogo: (file: File) => Promise<any>;
  onRemoveLogo: () => Promise<any>;
  onUploadBanner: (file: File) => Promise<any>;
  onRemoveBanner: () => Promise<any>;
  isUpdating: boolean;
}

export const StoreBrandingSettings: React.FC<StoreBrandingSettingsProps> = ({
  profile,
  onUpdateProfile,
  onUploadLogo,
  onRemoveLogo,
  onUploadBanner,
  onRemoveBanner,
  isUpdating,
}) => {
  const [storeName, setStoreName] = useState(profile.storeName || "");
  const [storeSlug, setStoreSlug] = useState(profile.storeSlug || profile.slug || "");
  const [description, setDescription] = useState(profile.description || "");

  useEffect(() => {
    setStoreName(profile.storeName || "");
    setStoreSlug(profile.storeSlug || profile.slug || "");
    setDescription(profile.description || "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      toast.error("Store name is required");
      return;
    }
    try {
      await onUpdateProfile({
        storeName: storeName.trim(),
        storeSlug: storeSlug.trim() || undefined,
        description: description.trim() || undefined,
      });
      toast.success("Store details updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update store details");
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Store Branding & Media" subtitle="Uploaded directly to Cloudinary and displayed to customers">
        <div className="space-y-6">
          <ImageUploadDropzone
            label="Store Banner"
            aspectRatio="banner"
            currentUrl={profile.storeBanner}
            helperText="Recommended 1200x350px • JPG, PNG, WEBP"
            onUpload={onUploadBanner}
            onRemove={onRemoveBanner}
          />

          <ImageUploadDropzone
            label="Store Logo / Brand Icon"
            aspectRatio="square"
            currentUrl={profile.storeLogo}
            helperText="Recommended 400x400px square • JPG, PNG, WEBP"
            onUpload={onUploadLogo}
            onRemove={onRemoveLogo}
          />
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Store Information" subtitle="Public marketplace identifiers">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Store Name *"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Apex Tech Hub"
              required
            />
            <Input
              label="Store URL Slug *"
              value={storeSlug}
              onChange={(e) => setStoreSlug(e.target.value)}
              placeholder="e.g. apex-tech-hub"
              helperText="Letters, numbers, and hyphens only"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-primary tracking-wide">Store Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell shoppers about your store, product specialties, and guarantee..."
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-primary focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isUpdating}>
            <Save className="w-4 h-4" />
            Save Store Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
