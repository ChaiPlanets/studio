
"use client";

import React, { useState } from "react";
import type { Document, Requirement } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import { FileText, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { extractRequirements } from "@/ai/flows/extract-requirements-flow";
import { useToast } from "@/hooks/use-toast";
import { mockDocumentText } from "@/data/mock";
import { useDocuments } from "@/contexts/document-context";
import { useRouter } from "next/navigation";
import { ScrollArea } from "./ui/scroll-area";

interface DocumentPreviewProps {
  document: Document | null;
}

const statusColors: { [key: string]: string } = {
  Draft: "bg-gray-400",
  "In Review": "bg-yellow-500",
  Approved: "bg-green-500",
};

export function DocumentPreview({ document }: DocumentPreviewProps) {
  const [status, setStatus] = useState(document?.status || "Draft");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<Requirement[] | null>(null);

  const { setRequirements, setTestCases, setActiveDocument } = useDocuments();
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    if (document) {
      setStatus(document.status);
      setActiveDocument(document);
      setExtractionResult(null);
    }
  }, [document, setActiveDocument]);

  if (!document) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground p-6">
          <p>Select a document to see its details.</p>
        </CardContent>
      </Card>
    );
  }

  const handleExtractRequirements = async () => {
    setIsExtracting(true);
    setTestCases([]);
    try {
      const result = await extractRequirements({
        documentText: mockDocumentText,
      });
      const numberedRequirements = result.requirements.map((req, index) => ({
        ...req,
        id: `REQ-${(index + 1).toString().padStart(3, "0")}`,
      }));
      setRequirements(numberedRequirements);
      setExtractionResult(numberedRequirements);
      toast({
        title: "Extraction Successful",
        description: `Found ${numberedRequirements.length} requirements.`,
      });
    } catch (error) {
      console.error("Error extracting requirements:", error);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: "Could not extract requirements from the document.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleViewRequirements = () => {
    router.push("/requirements");
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{document.name}</CardTitle>
        <CardDescription>
          Uploaded on {new Date(document.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4 pt-4">
        {extractionResult ? (
           <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Extraction Complete</h3>
            <p className="text-muted-foreground mb-4">
              Successfully extracted{" "}
              <span className="font-bold text-foreground">
                {extractionResult.length}
              </span>{" "}
              requirements.
            </p>
            <p className="text-sm text-muted-foreground">
              You can now proceed to review and edit them.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h3 className="font-semibold">Document Content</h3>
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                <pre className="whitespace-pre-wrap text-sm">{mockDocumentText}</pre>
              </ScrollArea>
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold">Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">File Type</span>
                <span className="text-right font-medium uppercase">
                  {document.type}
                </span>
                <span className="text-muted-foreground">File Size</span>
                <span className="text-right font-medium">{document.size}</span>
                <span className="text-muted-foreground">Last Modified</span>
                <span className="text-right font-medium">
                  {new Date(document.modifiedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
       <CardFooter className="pt-6 border-t">
        {extractionResult ? (
          <Button className="w-full" onClick={handleViewRequirements}>
            View Requirements <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={handleExtractRequirements}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isExtracting ? "Extracting..." : "Extract Requirements"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
