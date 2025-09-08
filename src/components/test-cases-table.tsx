
"use client";

import { useState } from "react";
import type { TestCase, TestStep } from "@/types";
import { useDocuments } from "@/contexts/document-context";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { logTestCaseToJira } from "@/ai/flows/log-to-jira-flow";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, Settings, PlusCircle, Download } from "lucide-react";
import Link from "next/link";
import { useJira } from "@/contexts/jira-context";
import { JiraConfigDialog } from "./jira-config-dialog";
import { Checkbox } from "./ui/checkbox";
import { FileUploadDialog } from "./file-upload-dialog";
import { useRouter } from "next/navigation";
import { Packer, Document, Paragraph, HeadingLevel, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, WidthType, TextRun } from "docx";
import { saveAs } from "file-saver";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";


export function TestCasesTable() {
  const { testCases, setTestCases, activeDocument } = useDocuments();
  const { openDialog, isConfigured, credentials } = useJira();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

   const generateTestCasesDoc = () => {
    if (!activeDocument) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `Test Cases for: ${activeDocument.name}`,
            heading: HeadingLevel.TITLE,
          }),
          ...testCases.flatMap(tc => [
             new Paragraph({
                text: `${tc.id}: ${tc.title}`,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200 },
             }),
             new Paragraph({ text: `Requirement ID: ${tc.requirementId}`}),
             new Paragraph({ text: `Type: ${tc.type}`}),
             new Paragraph({
                text: "Test Steps",
                heading: HeadingLevel.HEADING_3,
             }),
             new DocxTable({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new DocxTableRow({
                    children: [
                      new DocxTableCell({ children: [new Paragraph({ text: "Step", bold: true })]}),
                      new DocxTableCell({ children: [new Paragraph({ text: "Action", bold: true })]}),
                      new DocxTableCell({ children: [new Paragraph({ text: "Expected Result", bold: true })]}),
                    ],
                  }),
                  ...tc.testSteps.map(step => new DocxTableRow({
                    children: [
                      new DocxTableCell({ children: [new Paragraph(String(step.step))] }),
                      new DocxTableCell({ children: [new Paragraph(step.action)] }),
                      new DocxTableCell({ children: [new Paragraph(step.expectedResult)] }),
                    ]
                  }))
                ]
             })
          ])
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `Test-Cases-${activeDocument.name}.docx`);
    });
  };

  const generateTestCasesCsv = () => {
    if (!activeDocument || testCases.length === 0) return;

    const escapeCsvCell = (cellData: string) => {
      // If the cell data contains a comma, newline, or double quote, wrap it in double quotes.
      // Also, double up any existing double quotes.
      if (/[",\n]/.test(cellData)) {
        return `"${cellData.replace(/"/g, '""')}"`;
      }
      return cellData;
    };

    const headers = [
        "Test Case ID",
        "Title",
        "Requirement ID",
        "Type",
        "Step Number",
        "Action",
        "Expected Result",
        "Jira Key"
    ];

    const rows = testCases.flatMap(tc => 
        tc.testSteps.map(step => [
            escapeCsvCell(tc.id),
            escapeCsvCell(tc.title),
            escapeCsvCell(tc.requirementId),
            escapeCsvCell(tc.type),
            step.step,
            escapeCsvCell(step.action),
            escapeCsvCell(step.expectedResult),
            escapeCsvCell(tc.jiraKey || '')
        ].join(','))
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Test-Cases-${activeDocument.name}.csv`);
  };

  if (!activeDocument) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>No Document Selected</CardTitle>
            <CardDescription>
              Please select a document or upload a new one to view test cases.
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

  if (testCases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Test Cases Generated</CardTitle>
          <CardDescription>
            Go to the 'Requirements' page to generate test cases for '{activeDocument.name}'.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleTestCaseChange = (id: string, field: "title", value: string) => {
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
  };

  const handleStepChange = (
    testCaseId: string,
    stepNumber: number,
    field: keyof Omit<TestStep, 'step'>,
    value: string
  ) => {
    setTestCases(prev =>
      prev.map(tc => {
        if (tc.id === testCaseId) {
          const updatedSteps = tc.testSteps.map(step =>
            step.step === stepNumber ? { ...step, [field]: value } : step
          );
          return { ...tc, testSteps: updatedSteps };
        }
        return tc;
      })
    );
  };
  
  const handleSelectTestCase = (id: string, checked: boolean) => {
    setSelectedTestCases((prev) =>
      checked ? [...prev, id] : prev.filter((tcId) => tcId !== id)
    );
  };

  const handleSelectAllTestCases = (checked: boolean) => {
    if (checked) {
      setSelectedTestCases(testCases.map(tc => tc.id));
    } else {
      setSelectedTestCases([]);
    }
  };

  const handleBulkLogToJira = async () => {
    if (!isConfigured || !credentials) {
      toast({
        variant: "destructive",
        title: "Jira Not Configured",
        description: "Please configure your Jira credentials first.",
      });
      openDialog();
      return;
    }

    setIsLogging(true);
    const selected = testCases.filter(tc => selectedTestCases.includes(tc.id));
    
    const results = await Promise.allSettled(
      selected.map(testCase => 
        logTestCaseToJira({
          testCase,
          jiraProjectKey: credentials.projectKey,
          jiraBaseUrl: credentials.baseUrl,
          jiraUserEmail: credentials.email,
          jiraApiToken: credentials.apiToken,
        })
      )
    );

    let successCount = 0;
    const updatedTestCases: Record<string, { jiraKey: string; jiraUrl: string }> = {};

    results.forEach((result, index) => {
      const testCase = selected[index];
      if (result.status === "fulfilled") {
        successCount++;
        updatedTestCases[testCase.id] = {
          jiraKey: result.value.jiraKey,
          jiraUrl: result.value.jiraUrl,
        };
      } else {
        toast({
          variant: "destructive",
          title: `Failed to log ${testCase.id}`,
          description: (result.reason as Error)?.message || "An unknown error occurred.",
        });
      }
    });
    
    if (successCount > 0) {
      setTestCases(prev =>
        prev.map(tc =>
          updatedTestCases[tc.id]
            ? { ...tc, jiraKey: updatedTestCases[tc.id].jiraKey, jiraUrl: updatedTestCases[tc.id].jiraUrl }
            : tc
        )
      );
      toast({
        title: "Jira Logging Complete",
        description: `Successfully logged ${successCount} out of ${selected.length} selected test cases to Jira.`,
      });
    }

    setSelectedTestCases([]);
    setIsLogging(false);
  };

  const allTestCasesSelected = selectedTestCases.length === testCases.length && testCases.length > 0;
  const someTestCasesSelected = selectedTestCases.length > 0 && selectedTestCases.length < testCases.length;

  return (
    <>
      <JiraConfigDialog />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Generated Test Cases</CardTitle>
              <CardDescription>
                Review and edit the generated test cases for '{activeDocument.name}'.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button
                    variant="outline"
                    disabled={testCases.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={generateTestCasesDoc}>
                    Download as DOCX
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={generateTestCasesCsv}>
                    Download as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
             
              <Button
                variant="outline"
                onClick={handleBulkLogToJira}
                disabled={isLogging || selectedTestCases.length === 0}
              >
                {isLogging ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isLogging
                  ? "Logging..."
                  : `Log to Jira (${selectedTestCases.length})`}
              </Button>
              <Button variant="outline" onClick={openDialog}>
                <Settings className="mr-2 h-4 w-4" />
                Configure Jira
              </Button>
            </div>
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
                        checked={allTestCasesSelected}
                        onCheckedChange={(checked) => handleSelectAllTestCases(!!checked)}
                        aria-label="Select all test cases"
                        data-state={someTestCasesSelected ? 'indeterminate' : (allTestCasesSelected ? 'checked' : 'unchecked')}
                      />
                    </TableHead>
                    <TableHead className="w-[120px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead className="w-[350px]">Steps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testCases.map((tc) => (
                    <TableRow key={tc.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTestCases.includes(tc.id)}
                          onCheckedChange={(checked) =>
                            handleSelectTestCase(tc.id, !!checked)
                          }
                          aria-label={`Select test case ${tc.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{tc.id}</div>
                        {tc.jiraKey && tc.jiraUrl && (
                          <Link href={tc.jiraUrl} target="_blank" rel="noopener noreferrer">
                            <Badge variant="secondary" className="mt-1 gap-1">
                              {tc.jiraKey}
                              <ExternalLink className="h-3 w-3" />
                            </Badge>
                          </Link>
                        )}
                      </TableCell>
                      <TableCell>
                         <Textarea
                            value={tc.title}
                            onChange={(e) => handleTestCaseChange(tc.id, "title", e.target.value)}
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
                        <div className="flex flex-wrap gap-1">
                          {tc.compliance.map(standard => (
                            <Badge key={standard} variant="outline">{standard}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                         <ScrollArea className="h-48 w-full rounded-md border p-4">
                          <div className="space-y-4">
                            {tc.testSteps.map((step) => (
                              <div key={step.step} className="space-y-2 text-xs">
                                <Label className="font-semibold">Step {step.step}</Label>
                                <Textarea
                                  placeholder="Action"
                                  value={step.action}
                                  onChange={(e) => handleStepChange(tc.id, step.step, "action", e.target.value)}
                                  rows={2}
                                />
                                <Textarea
                                  placeholder="Expected Result"
                                  value={step.expectedResult}
                                  onChange={(e) => handleStepChange(tc.id, step.step, "expectedResult", e.target.value)}
                                  rows={2}
                                />
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
