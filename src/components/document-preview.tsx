"use client";

import React, { useState } from "react";
import type { Document, Requirement, TestCase } from "@/types";
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
import { FileText, Loader2, TestTube } from "lucide-react";
import { extractRequirements } from "@/ai/flows/extract-requirements-flow";
import { generateTestCases } from "@/ai/flows/generate-test-cases-flow";
import { useToast } from "@/hooks/use-toast";
import { mockDocumentText } from "@/data/mock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  React.useEffect(() => {
    if (document) {
      setStatus(document.status);
      setRequirements([]);
      setSelectedRequirements([]);
      setTestCases([]);
      setActiveTab("details");
    }
  }, [document]);

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
    setSelectedRequirements([]);
    try {
      const result = await extractRequirements({
        documentText: mockDocumentText,
      });
      const numberedRequirements = result.requirements.map((req, index) => ({
        ...req,
        id: `REQ-${(index + 1).toString().padStart(3, "0")}`,
      }));
      setRequirements(numberedRequirements);
      setActiveTab("requirements");
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
      setTestCases((prev) => [...prev, ...result.testCases].sort((a,b) => a.id.localeCompare(b.id)));
      setActiveTab("test-cases");
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{document.name}</CardTitle>
        <CardDescription>
          Uploaded on {new Date(document.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="requirements" disabled={!requirements.length}>
              Requirements
            </TabsTrigger>
            <TabsTrigger value="test-cases" disabled={!testCases.length}>
              Test Cases
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="details"
            className="flex-1 overflow-y-auto space-y-6 pt-4"
          >
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
            <Separator />
            <div className="pt-2 pb-6">
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
            </div>
          </TabsContent>
          <TabsContent
            value="requirements"
            className="flex-1 flex flex-col min-h-0 pt-4"
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                Select and edit the extracted requirements.
              </p>
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
            <div className="flex-1 relative border rounded-md">
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
          </TabsContent>
          <TabsContent
            value="test-cases"
            className="flex-1 flex flex-col min-h-0 pt-4"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Review and edit the generated test cases.
            </p>
            <div className="flex-1 relative border rounded-md">
              <ScrollArea className="absolute inset-0 h-full">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[120px]">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="w-[250px]">Steps</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testCases.map((tc) => (
                      <TableRow key={tc.id}>
                        <TableCell className="font-medium">{tc.id}</TableCell>
                        <TableCell>
                          <Textarea
                            defaultValue={tc.title}
                            rows={2}
                            className="w-full min-w-[200px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tc.type === "Positive"
                                ? "default"
                                : tc.type === "Negative"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {tc.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ul className="list-disc pl-4 space-y-1 text-xs">
                            {tc.testSteps.map((step) => (
                              <li key={step.step}>
                                <strong>{step.action}:</strong>{" "}
                                {step.expectedResult}
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
