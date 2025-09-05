"use client";

import { DocumentPreview } from "@/components/document-preview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/contexts/document-context";
import { useRouter } from "next/navigation";

export default function DocumentPage() {
  const { activeDocument } = useDocuments();
  const router = useRouter();

  if (!activeDocument) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Document Selected</CardTitle>
          <CardDescription>
            Select a document from the 'All Documents' page to view its
            details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/documents")}>
            View Documents
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <DocumentPreview document={activeDocument} />;
}
