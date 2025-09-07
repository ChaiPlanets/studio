
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
import { complianceStandards } from "@/types";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FileUploadDialog } from "./file-upload-dialog";


export function ComplianceTable() {
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
              Please select a document or upload a new one to view the compliance matrix.
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
