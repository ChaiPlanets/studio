
"use client";

import { useState } from "react";
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
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FileUploadDialog } from "./file-upload-dialog";

export function TraceabilityMatrix() {
  const { requirements, testCases, activeDocument } = useDocuments();
  const router = useRouter();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

  if (!activeDocument) {
    return (
       <>
        <Card>
          <CardHeader>
            <CardTitle>No Document Selected</CardTitle>
            <CardDescription>
              Please select a document or upload a new one to view the traceability matrix.
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
