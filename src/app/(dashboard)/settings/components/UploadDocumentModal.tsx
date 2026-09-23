"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { file: File; type: string }) => Promise<any>;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [docType, setDocType] = useState("trade_license");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      toast.error("Please choose a document file to upload");
      return;
    }

    try {
      setIsUploading(true);
      await onUpload({ file: docFile, type: docType });
      toast.success("Document uploaded successfully!");
      onClose();
      setDocFile(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Verification Document">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-primary block mb-1">Document Classification *</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-primary focus:outline-none focus:border-primary"
          >
            <option value="trade_license">Trade / Business License</option>
            <option value="tax_cert">Tax Certificate (TIN / VAT)</option>
            <option value="nid">National ID / Passport</option>
            <option value="bank_statement">Official Bank Statement</option>
            <option value="other">Other Compliance Document</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-primary block mb-1">Select File (PDF or Image) *</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setDocFile(e.target.files[0]);
              }
            }}
            className="w-full text-xs text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isUploading}>
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>
  );
};
