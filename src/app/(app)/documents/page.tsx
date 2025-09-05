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

export default function AllDocumentsPage() {
  const { documents, activeDocument, setActiveDocument, deleteDocument } =
    useDocuments();
  const router = useRouter();
  const { toast } = useToast();

  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null
  );

  const handleSelectDocument = (document: Document) => {
    setActiveDocument(document);
    router.push("/dashboard");
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
          <CardTitle>All Documents</CardTitle>
          <CardDescription>
            Browse and manage all documents in your workspace.
          </CardDescription>
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
    </>
  );
}
