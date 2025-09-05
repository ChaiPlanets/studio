"use client";

import { useState } from "react";
import type { Document } from "@/types";
import { Button } from "@/components/ui/button";
import { DocumentPreview } from "@/components/document-preview";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { PlusCircle } from "lucide-react";
import { useDocuments } from "@/contexts/document-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { documents, activeDocument } = useDocuments();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const router = useRouter();


  const handleUploadSuccess = (
    newFile: Omit<Document, "id" | "collaborators" | "projectId">
  ) => {
    // This is now handled by the FileUploadDialog directly with the context
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>
      <div className="grid grid-cols-1">
        {activeDocument ? (
          <DocumentPreview document={activeDocument} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Document Selected</CardTitle>
              <CardDescription>
                {documents.length > 0
                  ? "Select a document from the 'All Documents' page to view its details."
                  : "Upload your first document to get started."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <Button onClick={() => router.push('/documents')}>
                  View Documents
                </Button>
              ) : (
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
