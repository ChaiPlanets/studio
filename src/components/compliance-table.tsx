
"use client";

import { useDocuments } from "@/contexts/document-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { complianceStandards } from "@/types";

export function ComplianceTable() {
  const { requirements, testCases, activeDocument } = useDocuments();

  if (!activeDocument) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Document</CardTitle>
          <CardDescription>
            Please select a document and generate test cases first.
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
        <CardTitle>Compliance Matrix</CardTitle>
        <CardDescription>
          Mapping of test cases to compliance standards for '{activeDocument.name}'.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md relative h-[60vh]">
          <ScrollArea className="absolute inset-0 h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[120px]">Test Case ID</TableHead>
                  <TableHead>Test Case Title</TableHead>
                  <TableHead>Covered Standards</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases.map((tc) => (
                  <TableRow key={tc.id}>
                    <TableCell className="font-medium">{tc.id}</TableCell>
                    <TableCell>{tc.title}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tc.compliance.length > 0 ? (
                          tc.compliance.map((standard) => (
                            <Badge key={standard} variant="secondary">
                              {standard}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Not specified</span>
                        )}
                      </div>
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
