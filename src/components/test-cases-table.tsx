"use client";

import type { TestCase } from "@/types";
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

export function TestCasesTable() {
  const { testCases, activeDocument } = useDocuments();

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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Test Cases</CardTitle>
        <CardDescription>
          Review and edit the generated test cases for '{activeDocument.name}'.
        </CardDescription>
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
                       <ScrollArea className="h-24 w-full rounded-md border p-2">
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                          {tc.testSteps.map((step) => (
                            <li key={step.step}>
                              <strong>{step.action}:</strong>{" "}
                              {step.expectedResult}
                            </li>
                          ))}
                        </ul>
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
  );
}
