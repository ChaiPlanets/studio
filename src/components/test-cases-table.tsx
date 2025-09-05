
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
import { Loader2, ExternalLink, Settings } from "lucide-react";
import Link from "next/link";
import { useJira } from "@/contexts/jira-context";
import { JiraConfigDialog } from "./jira-config-dialog";
import { Checkbox } from "./ui/checkbox";

export function TestCasesTable() {
  const { testCases, setTestCases, activeDocument } = useDocuments();
  const { openDialog, isConfigured, credentials } = useJira();
  const { toast } = useToast();

  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [isLogging, setIsLogging] = useState(false);

  if (!activeDocument) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Document</CardTitle>
          <CardDescription>
            Please go to the dashboard and extract requirements from a document first.
          </CardDescription>
        </CardHeader>
      </Card>
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
    results.forEach((result, index) => {
      const testCase = selected[index];
      if (result.status === "fulfilled") {
        successCount++;
      } else {
        toast({
          variant: "destructive",
          title: `Failed to log ${testCase.id}`,
          description: result.reason.message || "An unknown error occurred.",
        });
      }
    });

    if (successCount > 0) {
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
                      <TableCell className="font-medium">{tc.id}</TableCell>
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
