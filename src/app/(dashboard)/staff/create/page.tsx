"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, CheckCircle2, RefreshCw } from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { useVendorStaff } from "@/hooks/useVendorStaff";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DualPanePermissionMatrix } from "../components/DualPanePermissionMatrix";

export default function CreateStaffPage() {
  const router = useRouter();
  const { availablePermissions, createStaff, assignPermissions, isSaving } = useVendorStaff();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError("Name and email are required");
      return;
    }

    try {
      const createdStaff = await createStaff({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (createdStaff && createdStaff.id && selectedPermissions.length > 0) {
        await assignPermissions({
          staffUserId: createdStaff.id,
          permissions: selectedPermissions,
        });
      }

      router.push("/staff");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create staff account";
      setFormError(msg);
    }
  };

  return (
    <PermissionGuard requiredPermission="staff:create">
      <div className="space-y-6 w-full">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link href="/staff">
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Back to Staff
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Add Store Staff Member</h1>
            <p className="text-xs text-secondary">
              Create employee credentials and delegate specific module permissions for your store.
            </p>
          </div>
        </div>

        {formError && (
          <div className="p-4 bg-highlight/10 border border-highlight/20 text-highlight text-xs rounded-xl">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {/* Account Credentials */}
          <div className="bg-white p-6 rounded-2xl border border-border space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
              Staff Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. sarah@mystore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Login Password"
                type="password"
                placeholder="Assign login password for staff user"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Phone Number (Optional)"
                placeholder="e.g. +1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Two-Side Permission Assignment Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-border space-y-3 shadow-xs w-full">
            <div>
              <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
                Delegate Store Capabilities
              </h2>
              <p className="text-[11px] text-secondary">
                Toggle permissions on the left to assign them, or toggle on the right to remove.
              </p>
            </div>

            <DualPanePermissionMatrix
              permissions={availablePermissions}
              selectedPermissions={selectedPermissions}
              onChange={setSelectedPermissions}
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link href="/staff">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving} className="gap-2 cursor-pointer">
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Create & Delegate Permissions
            </Button>
          </div>
        </form>
      </div>
    </PermissionGuard>
  );
}
