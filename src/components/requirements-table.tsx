
"use client";

import { useState } from "react";
import type { Requirement } from "@/types";
import { useDocuments } from "@/contexts/document-context";
import { Button } from "./ui/button";
import { TestTube, Loader2, PlusCircle } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateTestCases } from "@/ai/flows/generate-test-cases-flow";
import { useRouter } from "next/navigation";
import { FileUploadDialog } from "./file-upload-dialog";

export function RequirementsTable() {
  const {
    requirements,
    setRequirements,
    setTestCases,
    activeDocument,
  } = useDocuments();
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  const handleGenerateTestCases = async () => {
    if (selectedRequirements.length === 0) {
      toast({
        variant: "destructive",
        title: "No Requirements Selected",
        description:
          "Please select at least one requirement to generate test cases.",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const requirementsToProcess = requirements.filter((req) =>
        selectedRequirements.includes(req.id)
      );
      const result = await generateTestCases({ requirements: requirementsToProcess });
      setTestCases((prev) => [...result.testCases, ...prev].sort((a,b) => a.requirementId.localeCompare(b.requirementId) || a.id.localeCompare(b.id)));
      router.push("/test-cases");
      setSelectedRequirements([]);
    } catch (error) {
      console.error("Error generating test cases:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate test cases from the requirements.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRequirementChange = (
    id: string,
    field: "description" | "category",
    value: string
  ) => {
    setRequirements((prev) =>
      prev.map((req) => (req.id === id ? { ...req, [field]: value } : req))
    );
  };

  const handleSelectRequirement = (id: string, checked: boolean) => {
    setSelectedRequirements((prev) =>
      checked ? [...prev, id] : prev.filter((reqId) => reqId !== id)
    );
  };
  
  const handleSelectAllRequirements = (checked: boolean) => {
    if (checked) {
      setSelectedRequirements(requirements.map(req => req.id));
    } else {
      setSelectedRequirements([]);
    }
  };

  const allRequirementsSelected = selectedRequirements.length === requirements.length && requirements.length > 0;
  const someRequirementsSelected = selectedRequirements.length > 0 && selectedRequirements.length < requirements.length;

  if (!activeDocument) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>No Document Selected</CardTitle>
            <CardDescription>
              Please select a document from the 'All Documents' page or upload a
              new one to extract requirements.
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Extracted Requirements</CardTitle>
            <CardDescription>
              Select and edit the extracted requirements for '{activeDocument.name}'.
            </CardDescription>
          </div>
          <Button
            onClick={handleGenerateTestCases}
            disabled={isGenerating || selectedRequirements.length === 0}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="mr-2 h-4 w-4" />
            )}
            {isGenerating
              ? "Generating..."
              : `Generate Test Cases (${selectedRequirements.length})`}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md relative h-[60vh]">
          <ScrollArea className="absolute inset-0 h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12">
                     <Checkbox 
                      checked={allRequirementsSelected}
                      onCheckedChange={(checked) => handleSelectAllRequirements(!!checked)}
                      aria-label="Select all requirements"
                      data-state={someRequirementsSelected ? 'indeterminate' : (allRequirementsSelected ? 'checked' : 'unchecked')}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[180px]">Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requirements.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRequirements.includes(req.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRequirement(req.id, !!checked)
                        }
                        aria-label={`Select requirement ${req.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{req.id}</TableCell>
                    <TableCell>
                      <Input
                        value={req.description}
                        onChange={(e) =>
                          handleRequirementChange(
                            req.id,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={req.category}
                        onValueChange={(
                          value: Requirement["category"]
                        ) =>
                          handleRequirementChange(req.id, "category", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Functional">
                            Functional
                          </SelectItem>
                          <SelectItem value="Non-Functional">
                            Non-Functional
                          </SelectItem>
                          <SelectItem value="Compliance">
                            Compliance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
