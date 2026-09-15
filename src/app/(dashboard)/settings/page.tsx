"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Store, Upload } from "lucide-react";
import { storeSettingsSchema, StoreSettingsFormValues } from "@/schemas/storeSettingsSchema";
import { useVendorStore } from "@/stores/useVendorStore";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { profile, setProfile } = useVendorStore();
  const [successMessage, setSuccessMessage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      storeName: profile?.storeName || "",
      description: profile?.description || "",
      contactEmail: profile?.contactEmail || "",
      contactPhone: profile?.contactPhone || "",
      logoUrl: profile?.logoUrl || "",
      bannerUrl: profile?.bannerUrl || "",
    },
  });

  const onSubmit = async (data: StoreSettingsFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (profile) {
      setProfile({
        ...profile,
        ...data,
      });
    }
    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">Store Profile Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize your storefront appearance, logo, banner, and customer contact information.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Banner & Logo Preview */}
        <Card title="Branding & Media Assets" subtitle="Displayed on customer-facing storefront">
          <div className="space-y-4">
            {/* Banner preview */}
            <div className="h-36 w-full bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
              {profile?.bannerUrl ? (
                <Image src={profile.bannerUrl} alt="Store Banner" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  No Banner Image Set
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Store Logo URL"
                placeholder="https://images.unsplash.com/..."
                {...register("logoUrl")}
                error={errors.logoUrl?.message}
              />
              <Input
                label="Store Banner URL"
                placeholder="https://images.unsplash.com/..."
                {...register("bannerUrl")}
                error={errors.bannerUrl?.message}
              />
            </div>
          </div>
        </Card>

        {/* Store Info */}
        <Card title="General Information" subtitle="Store identity and story">
          <Input
            label="Store Name *"
            placeholder="Apex Electronics Store"
            {...register("storeName")}
            error={errors.storeName?.message}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 tracking-wide">
              Store Description *
            </label>
            <textarea
              rows={4}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-primary transition-all resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-highlight font-medium">{errors.description.message}</p>
            )}
          </div>
        </Card>

        {/* Contact Info */}
        <Card title="Contact & Support" subtitle="Direct customer service credentials">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Email *"
              type="email"
              placeholder="support@apexelectronics.com"
              {...register("contactEmail")}
              error={errors.contactEmail?.message}
            />
            <Input
              label="Contact Phone *"
              placeholder="+1 (555) 234-5678"
              {...register("contactPhone")}
              error={errors.contactPhone?.message}
            />
          </div>
        </Card>

        {successMessage && (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs">
            Store profile updated successfully!
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            <Save className="w-4 h-4" />
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
