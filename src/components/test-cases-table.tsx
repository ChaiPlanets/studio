
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

function JiraButton({ testCase }: { testCase: TestCase }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { credentials, isConfigured, openDialog } = useJira();

  const handleLogToJira = async () => {
    if (!isConfigured || !credentials) {
      toast({
        variant: "destructive",
        title: "Jira Not Configured",
        description: "Please configure your Jira credentials first.",
      });
      openDialog();
      return;
    }

    setLoading(true);
    try {
      const jiraProjectKey = "FIRE";
      const result = await logTestCaseToJira({
        testCase,
        jiraProjectKey,
        jiraBaseUrl: credentials.baseUrl,
        jiraUserEmail: credentials.email,
        jiraApiToken: credentials.apiToken,
      });

      toast({
        title: "Logged to Jira",
        description: (
          <p>
            Test case logged as{" "}
            <Link href={result.jiraUrl} target="_blank" className="underline">
              {result.jiraKey} <ExternalLink className="inline h-3 w-3" />
            </Link>
          </p>
        ),
      });
    } catch (error: any) {
      console.error("Failed to log to Jira:", error);
      toast({
        variant: "destructive",
        title: "Jira Logging Failed",
        description: error.message || "Could not log the test case to Jira.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogToJira} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {loading ? "Logging..." : "Log to Jira"}
    </Button>
  );
}

export function TestCasesTable() {
  const { testCases, setTestCases, activeDocument } = useDocuments();
  const { openDialog } = useJira();

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
            <Button variant="outline" onClick={openDialog}>
              <Settings className="mr-2 h-4 w-4" />
              Configure Jira
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md relative h-[60vh]">
            <ScrollArea className="absolute inset-0 h-full">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[120px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[350px]">Steps</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testCases.map((tc) => (
                    <TableRow key={tc.id}>
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
                      <TableCell>
                        <JiraButton testCase={tc} />
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
