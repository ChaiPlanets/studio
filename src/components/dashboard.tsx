
"use client";

import { useState } from "react";
import type { Document } from "@/types";
import { Button } from "@/components/ui/button";
import { DocumentPreview } from "@/components/document-preview";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { PlusCircle, ClipboardList, FlaskConical } from "lucide-react";
import { useDocuments } from "@/contexts/document-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useRouter } from "next/navigation";
import { RequirementsChart } from "./requirements-chart";
import { TestCasesChart } from "./test-cases-chart";

export default function Dashboard() {
  const { documents, activeDocument, requirements, testCases } = useDocuments();
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

      {activeDocument ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Requirements
                  </CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{requirements.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Test Cases
                  </CardTitle>
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{testCases.length}</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <RequirementsChart />
              <TestCasesChart />
            </div>
          </div>
          <div className="lg:col-span-1">
             <DocumentPreview document={activeDocument} />
          </div>
        </div>
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
              <Button onClick={() => router.push("/documents")}>
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

      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
