
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequirementsTable } from "@/components/requirements-table";
import { useDocuments } from "@/contexts/document-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { PlusCircle } from "lucide-react";

export default function RequirementsPage() {
  const { activeDocument } = useDocuments();
  const router = useRouter();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

  if (!activeDocument) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>No Document Selected</CardTitle>
            <CardDescription>
              Please select a document from the 'All Documents' page or upload a
              new one to extract requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => router.push("/documents")}>
              View All Documents
            </Button>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
        <FileUploadDialog
          isOpen={isUploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          onUploadSuccess={() => {}}
        />
      </>
    );
  }

  return <RequirementsTable />;
}
