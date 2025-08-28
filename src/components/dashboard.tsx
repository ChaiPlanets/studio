"use client";

import { useState } from "react";
import type { Document } from "@/types";
import { Button } from "@/components/ui/button";
import { DocumentPreview } from "@/components/document-preview";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { mockUsers } from "@/data/mock";
import { PlusCircle } from "lucide-react";
import { useDocuments } from "@/contexts/document-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function Dashboard() {
  const { documents, addDocument } = useDocuments();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

  // The most recent document is the first one in the list
  const mostRecentDocument = documents[0] || null;

  const handleUploadSuccess = (
    newFile: Omit<Document, "id" | "collaborators" | "projectId">
  ) => {
    const newDocument: Document = {
      ...newFile,
      id: `doc-${Date.now()}`,
      projectId: "proj-1", // Assuming it belongs to a default project
      collaborators: [mockUsers[0]], // Assuming the current user is the collaborator
    };
    addDocument(newDocument);
    // No need to set selected document as we will always show the most recent
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
        {mostRecentDocument ? (
          <DocumentPreview document={mostRecentDocument} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Documents Yet</CardTitle>
              <CardDescription>
                Upload your first document to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
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
