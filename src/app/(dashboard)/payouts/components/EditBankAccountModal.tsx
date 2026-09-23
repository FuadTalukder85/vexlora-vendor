"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useVendorStore } from "@/stores/useVendorStore";
import { useUpdateVendorBanking } from "@/hooks/useVendorPayouts";
import { toast } from "sonner";
import { Building, Save } from "lucide-react";

interface EditBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditBankAccountModal: React.FC<EditBankAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, setProfile, fetchProfile } = useVendorStore();
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  useEffect(() => {
    if (profile) {
      setBankName(profile.bankName || "");
      setBankAccountName(profile.bankAccountName || profile.storeName || "");
      setBankAccountNumber(profile.bankAccountNumber || "");
    }
  }, [profile, isOpen]);

  const updateBankingMutation = useUpdateVendorBanking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankName.trim() || !bankAccountNumber.trim()) {
      toast.error("Bank name and account number are required");
      return;
    }

    try {
      await updateBankingMutation.mutateAsync({
        bankName: bankName.trim(),
        bankAccountName: bankAccountName.trim() || undefined,
        bankAccountNumber: bankAccountNumber.trim(),
      });

      if (profile) {
        setProfile({
          ...profile,
          bankName: bankName.trim(),
          bankAccountName: bankAccountName.trim(),
          bankAccountNumber: bankAccountNumber.trim(),
        });
      }

      await fetchProfile();
      toast.success("Bank account credentials updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update bank account details"
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Bank Account Details"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-muted/60 rounded-xl border border-border text-xs text-secondary flex items-start gap-2.5">
          <Building className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            These banking credentials will be used by the platform administrator to disburse your manual net revenue withdrawals.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Bank Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. JPMorgan Chase Bank / Standard Chartered"
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Account Holder Name
          </label>
          <input
            type="text"
            value={bankAccountName}
            onChange={(e) => setBankAccountName(e.target.value)}
            placeholder="e.g. Acme Corporation LLC or Full Legal Name"
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-primary mb-1.5">
            Account Number / IBAN <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={bankAccountNumber}
            onChange={(e) => setBankAccountNumber(e.target.value)}
            placeholder="e.g. 0123456789 or GB29XNNN..."
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs font-mono text-primary focus:outline-none focus:border-primary transition-all"
            required
          />
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={updateBankingMutation.isPending}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Bank Credentials
          </Button>
        </div>
      </form>
    </Modal>
  );
};
