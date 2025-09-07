
"use client";

import type { Document } from "@/types";
import { useState } from "react";
import { DocumentTable } from "@/components/document-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDocuments } from "@/contexts/document-context";
import { useRouter } from "next/navigation";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { FileUploadDialog } from "@/components/file-upload-dialog";

export default function AllDocumentsPage() {
  const { documents, activeDocument, setActiveDocument, deleteDocument } =
    useDocuments();
  const router = useRouter();
  const { toast } = useToast();

  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null
  );
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleSelectDocument = (document: Document) => {
    setActiveDocument(document);
    router.push("/document");
  };

  const handleDeleteRequest = (document: Document) => {
    setDocumentToDelete(document);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      deleteDocument(documentToDelete.id);
      toast({
        title: "Document Deleted",
        description: `'${documentToDelete.name}' has been successfully deleted.`,
      });
      setDocumentToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>
                Browse and manage all documents in your workspace.
              </CardDescription>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload New Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentTable
            documents={documents}
            selectedDocument={activeDocument}
            onSelectDocument={handleSelectDocument}
            onDeleteDocument={handleDeleteRequest}
          />
        </CardContent>
      </Card>
      <DeleteConfirmationDialog
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleConfirmDelete}
        documentName={documentToDelete?.name || ""}
      />
      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadSuccess={() => {}}
      />
    </>
  );
}
