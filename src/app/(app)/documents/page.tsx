"use client";

import { useState } from "react";
import type { Document } from "@/types";
import { DocumentTable } from "@/components/document-table";
import { mockDocuments } from "@/data/mock";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AllDocumentsPage() {
  const [documents] = useState<Document[]>(mockDocuments);

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
