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

export function TraceabilityMatrix() {
  const { requirements, testCases, activeDocument } = useDocuments();

  if (!activeDocument) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Document</CardTitle>
          <CardDescription>
            Please go to the dashboard and extract requirements from a document
            first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const testCasesByRequirement = testCases.reduce((acc, tc) => {
    if (!acc[tc.requirementId]) {
      acc[tc.requirementId] = [];
    }
    acc[tc.requirementId].push(tc);
    return acc;
  }, {} as Record<string, typeof testCases>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traceability Matrix</CardTitle>
        <CardDescription>
          Mapping of requirements to generated test cases for '
          {activeDocument.name}'.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md relative h-[60vh]">
          <ScrollArea className="absolute inset-0 h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[120px]">Requirement ID</TableHead>
                  <TableHead>Requirement Description</TableHead>
                  <TableHead>Test Case(s)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requirements.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.id}</TableCell>
                    <TableCell>{req.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(testCasesByRequirement[req.id] || []).map((tc) => (
                           <Badge key={tc.id} variant="secondary">
                            {tc.id}
                          </Badge>
                        ))}
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
