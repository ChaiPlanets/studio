"use client";

import type { Document } from "@/types";
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

export default function AllDocumentsPage() {
  const { documents, activeDocument, setActiveDocument } = useDocuments();
  const router = useRouter();

  const handleSelectDocument = (document: Document) => {
    setActiveDocument(document);
    router.push("/dashboard");
  };

  return (
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
        />
      </CardContent>
    </Card>
  );
}
