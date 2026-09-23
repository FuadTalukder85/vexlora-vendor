"use client";

import React, { useState } from "react";
import { FileCheck, Plus, Eye, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VendorDocument } from "@/types/vendor";
import { UploadDocumentModal } from "./UploadDocumentModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

interface DocumentsSettingsProps {
  documents?: VendorDocument[];
  onUploadDocument: (data: { file: File; type: string }) => Promise<any>;
  onDeleteDocument: (id: string) => Promise<any>;
}

export const DocumentsSettings: React.FC<DocumentsSettingsProps> = ({
  documents = [],
  onUploadDocument,
  onDeleteDocument,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<VendorDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (doc: VendorDocument) => {
    setDeletingDoc(doc);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoc?.id) return;
    setIsDeleting(true);
    try {
      await onDeleteDocument(deletingDoc.id);
      toast.success("Document removed successfully");
      setDeletingDoc(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove document");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Verification Documents"
        subtitle="Trade license, tax certificates, and national ID credentials for marketplace compliance"
        action={
          <Button type="button" variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            Upload New Document
          </Button>
        }
      >
        {documents.length > 0 ? (
          <div className="divide-y divide-border">
            {documents.map((doc) => (
              <div key={doc.id || doc.url} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted text-primary">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary capitalize">{doc.type.replace(/_/g, " ")}</p>
                    <p className="text-[11px] text-secondary truncate max-w-xs">{doc.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-secondary hover:text-primary rounded-lg hover:bg-muted transition-colors text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </a>
                  <Button type="button" variant="danger" size="sm" onClick={() => handleDelete(doc)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <FileCheck className="w-10 h-10 text-secondary mb-2" />
            <p className="text-sm font-semibold text-primary">No compliance documents uploaded</p>
            <p className="text-xs text-secondary mt-0.5">
              Upload your business license or tax certificate to accelerate payouts and trust verification.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Upload Document
            </Button>
          </div>
        )}
      </Card>

      <UploadDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={onUploadDocument}
      />

      {/* Delete Document Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingDoc}
        onClose={() => {
          if (!isDeleting) {
            setDeletingDoc(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Remove Compliance Document"
        confirmText="Remove Document"
        variant="danger"
        isLoading={isDeleting}
        description={
          deletingDoc ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to remove this{" "}
                <span className="font-bold text-primary capitalize">
                  {deletingDoc.type.replace(/_/g, " ")}
                </span>{" "}
                document?
              </p>
              <p className="text-[11px] text-highlight font-medium">
                Removing verification documents may delay your store payout processing until re-submitted.
              </p>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};
