
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
import { FileText, Loader2, ArrowRight, CheckCircle, Shield, Eye, EyeOff } from "lucide-react";
import { extractRequirements } from "@/ai/flows/extract-requirements-flow";
import { redactPii, type RedactPiiOutput } from "@/ai/flows/redact-pii-flow";
import { useToast } from "@/hooks/use-toast";
import { mockDocumentText } from "@/data/mock";
import { useDocuments } from "@/contexts/document-context";
import { useRouter } from "next/navigation";
import { ScrollArea } from "./ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

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
  const [isScanning, setIsScanning] = useState(false);
  const [piiResult, setPiiResult] = useState<RedactPiiOutput | null>(null);
  const [showRedacted, setShowRedacted] = useState(true);

  const { setRequirements, setTestCases, setActiveDocument } = useDocuments();
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    if (document) {
      setStatus(document.status);
      setActiveDocument(document);
      setExtractionResult(null);
      setPiiResult(null);
      setShowRedacted(true);
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

   const handleScanForPii = async () => {
    setIsScanning(true);
    try {
      const result = await redactPii({ documentText: mockDocumentText });
      setPiiResult(result);
      toast({
        title: "PII Scan Complete",
        description: `Found ${result.findings.length} potential PII instances.`,
      });
    } catch (error) {
      console.error("Error scanning for PII:", error);
      toast({
        variant: "destructive",
        title: "PII Scan Failed",
        description: "Could not process the document for PII.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleExtractRequirements = async () => {
    setIsExtracting(true);
    setTestCases([]);
    try {
      const textToProcess = piiResult ? piiResult.redactedText : mockDocumentText;
      const result = await extractRequirements({
        documentText: textToProcess,
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
  
  const displayedText = piiResult && showRedacted ? piiResult.redactedText : mockDocumentText;
  
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
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Document Content</h3>
                {piiResult && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="redacted-toggle"
                      checked={showRedacted}
                      onCheckedChange={setShowRedacted}
                    />
                    <Label htmlFor="redacted-toggle" className="flex items-center gap-2">
                      {showRedacted ? <EyeOff /> : <Eye />}
                       <span>{showRedacted ? 'Redacted' : 'Original'}</span>
                    </Label>
                  </div>
                )}
              </div>
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                <pre className="whitespace-pre-wrap text-sm">{displayedText}</pre>
              </ScrollArea>
            </div>
            {piiResult && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>PII Scan Results</AlertTitle>
                <AlertDescription>
                  Found {piiResult.findings.length} items.{" "}
                  {piiResult.findings.length > 0 &&
                    "Requirement extraction will use the redacted text."}
                </AlertDescription>
              </Alert>
            )}
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
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleScanForPii}
              disabled={isScanning || isExtracting}
            >
              {isScanning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              {isScanning ? "Scanning..." : "Scan for PII"}
            </Button>
            <Button
              className="w-full"
              onClick={handleExtractRequirements}
              disabled={isExtracting || isScanning}
            >
              {isExtracting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              {isExtracting ? "Extracting..." : "Extract Requirements"}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
