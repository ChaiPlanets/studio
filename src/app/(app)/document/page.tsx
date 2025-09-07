"use client";

import { useState } from "react";
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
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { PlusCircle, MessageCircle } from "lucide-react";
import { Chatbot } from "@/components/chatbot";
import { mockDocumentText } from "@/data/mock";

export default function DocumentPage() {
  const { activeDocument } = useDocuments();
  const router = useRouter();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isChatbotOpen, setChatbotOpen] = useState(false);

  if (!activeDocument) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>No Document Selected</CardTitle>
            <CardDescription>
              Select a document from the 'All Documents' page or upload a new
              one to get started.
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

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Document Details
        </h2>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload New Document
        </Button>
      </div>
      <DocumentPreview document={activeDocument} />
      
      <Button 
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
        onClick={() => setChatbotOpen(true)}
      >
        <MessageCircle className="h-8 w-8" />
        <span className="sr-only">Open AI Chatbot</span>
      </Button>

      <Chatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setChatbotOpen(false)}
        documentText={mockDocumentText}
        documentName={activeDocument.name}
      />

      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadSuccess={() => {}}
      />
    </>
  );
}
