"use client";

import React from "react";
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
import Image from "next/image";
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
import { FileText, Loader2 } from "lucide-react";
import { extractRequirements } from "@/ai/flows/extract-requirements-flow";
import { useToast } from "@/hooks/use-toast";
import { RequirementsDialog } from "./requirements-dialog";
import { mockDocumentText } from "@/data/mock";

interface DocumentPreviewProps {
  document: Document | null;
}

const statusColors: { [key: string]: string } = {
  Draft: "bg-gray-400",
  "In Review": "bg-yellow-500",
  Approved: "bg-green-500",
};

export function DocumentPreview({ document }: DocumentPreviewProps) {
  if (!document) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground p-6">
          <p>Select a document to see its details.</p>
        </CardContent>
      </Card>
    );
  }
  
  const [status, setStatus] = React.useState(document.status);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [requirements, setRequirements] = React.useState<Requirement[]>([]);
  const [isRequirementsDialogOpen, setRequirementsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const handleExtractRequirements = async () => {
    setIsExtracting(true);
    try {
      // In a real app, you would fetch the document text from storage.
      // For this prototype, we'll use mock text.
      const result = await extractRequirements({ documentText: mockDocumentText });
      const numberedRequirements = result.requirements.map((req, index) => ({
        ...req,
        id: `REQ-${(index + 1).toString().padStart(3, '0')}`,
      }));
      setRequirements(numberedRequirements);
      setRequirementsDialogOpen(true);
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

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="truncate">{document.name}</CardTitle>
          <CardDescription>
            Uploaded on {new Date(document.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex-1">
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
            <Image
              src="https://picsum.photos/600/400"
              alt="Document preview"
              width={600}
              height={400}
              data-ai-hint="document preview"
              className="rounded-md object-cover"
            />
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
          <Separator />
          <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Status</h3>
                  <Badge className={`${statusColors[status]}`}>{status}</Badge>
              </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold">Collaborators</h3>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                {document.collaborators.map((c) => (
                  <Tooltip key={c.id}>
                    <TooltipTrigger>
                      <Avatar>
                        <AvatarImage src={c.avatarUrl} alt={c.name} />
                        <AvatarFallback>
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{c.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleExtractRequirements} disabled={isExtracting}>
            {isExtracting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isExtracting ? "Extracting..." : "Extract Requirements"}
          </Button>
        </CardFooter>
      </Card>
      <RequirementsDialog 
        isOpen={isRequirementsDialogOpen}
        onClose={() => setRequirementsDialogOpen(false)}
        requirements={requirements}
        setRequirements={setRequirements}
        documentName={document.name}
      />
    </>
  );
}
