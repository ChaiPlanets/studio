
"use client";

import { useState } from "react";
import type { Document } from "@/types";
import { Button } from "@/components/ui/button";
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
import { DashboardTabs } from "./dashboard-tabs";

export default function Dashboard() {
  const { documents } = useDocuments();
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
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of your active document and its assets.
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {documents.length > 0 ? (
        <DashboardTabs />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Documents Found</CardTitle>
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

      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
