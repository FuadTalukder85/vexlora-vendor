"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface DeactivateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeactivateStoreModal: React.FC<DeactivateStoreModalProps> = ({ isOpen, onClose }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    onClose();
    toast.success("Deactivation request submitted to marketplace administration for review.");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Store Deactivation Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-secondary leading-relaxed">
          Please provide a brief reason for requesting store deactivation. Our administrative team will review your
          pending orders and unpaid balances before final deactivation.
        </p>

        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Taking a seasonal break, moving platforms..."
          className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-primary focus:outline-none focus:border-primary resize-none"
          required
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" size="md" isLoading={isSubmitting}>
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
