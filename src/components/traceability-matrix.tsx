
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
import { PlusCircle, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { FileUploadDialog } from "./file-upload-dialog";
import { Packer, Document, Paragraph, HeadingLevel, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, WidthType } from "docx";
import { saveAs } from "file-saver";

export function TraceabilityMatrix() {
  const { requirements, testCases, activeDocument } = useDocuments();
  const router = useRouter();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

  const testCasesByRequirement = testCases.reduce((acc, tc) => {
    if (!acc[tc.requirementId]) {
      acc[tc.requirementId] = [];
    }
    acc[tc.requirementId].push(tc);
    return acc;
  }, {} as Record<string, typeof testCases>);
  
  const generateMatrixDoc = () => {
    if (!activeDocument) return;

    const table = new DocxTable({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new DocxTableRow({
            children: [
              new DocxTableCell({ children: [new Paragraph({ text: "Requirement ID", bold: true })]}),
              new DocxTableCell({ children: [new Paragraph({ text: "Requirement Description", bold: true })]}),
              new DocxTableCell({ children: [new Paragraph({ text: "Test Case(s)", bold: true })]}),
            ],
            tableHeader: true,
          }),
          ...requirements.map(req => new DocxTableRow({
            children: [
              new DocxTableCell({ children: [new Paragraph(req.id)] }),
              new DocxTableCell({ children: [new Paragraph(req.description)] }),
              new DocxTableCell({ children: [new Paragraph((testCasesByRequirement[req.id] || []).map(tc => tc.id).join(', '))] }),
            ]
          }))
        ]
     });

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `Traceability Matrix: ${activeDocument.name}`,
            heading: HeadingLevel.TITLE,
          }),
          table,
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `Traceability-Matrix-${activeDocument.name}.docx`);
    });
  };


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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
              <CardTitle>Traceability Matrix</CardTitle>
              <CardDescription>
                Mapping of requirements to generated test cases for '
                {activeDocument.name}'.
              </CardDescription>
            </div>
             <Button
                variant="outline"
                onClick={generateMatrixDoc}
                disabled={requirements.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Download as DOCX
              </Button>
        </div>
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
