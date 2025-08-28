"use client";

import { useState } from "react";
import type { Document } from "@/types";
import { Button } from "@/components/ui/button";
import { DocumentTable } from "@/components/document-table";
import { DocumentPreview } from "@/components/document-preview";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { mockDocuments, mockUsers } from "@/data/mock";
import { PlusCircle } from "lucide-react";

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    documents[0] || null
  );
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUploadSuccess = (newFile: Omit<Document, 'id' | 'collaborators' | 'projectId'>) => {
    const newDocument: Document = {
      ...newFile,
      id: `doc-${Date.now()}`,
      projectId: 'proj-1', // Assuming it belongs to a default project
      collaborators: [mockUsers[0]], // Assuming the current user is the collaborator
    };

    setDocuments(prevDocuments => [newDocument, ...prevDocuments]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Recent Documents</h2>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DocumentTable
            documents={documents}
            selectedDocument={selectedDocument}
            onSelectDocument={setSelectedDocument}
          />
        </div>
        <div className="lg:col-span-1">
          <DocumentPreview document={selectedDocument} />
        </div>
      </div>
      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
