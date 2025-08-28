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

export default function AllDocumentsPage() {
  const { documents } = useDocuments();

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
          selectedDocument={null}
          onSelectDocument={() => {}}
        />
      </CardContent>
    </Card>
  );
}
