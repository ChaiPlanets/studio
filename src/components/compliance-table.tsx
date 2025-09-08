
"use client";

import { useState, useMemo } from "react";
import { useDocuments } from "@/contexts/document-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { PlusCircle, Download, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FileUploadDialog } from "./file-upload-dialog";
import type { Requirement, TestCase } from "@/types";
import { Packer, Document, Paragraph, HeadingLevel, Table as DocxTable, TableCell as DocxTableCell, TableRow as DocxTableRow, WidthType } from "docx";
import { saveAs } from "file-saver";


interface ComplianceData {
  standard: string;
  requirements: (Requirement & { testCases: TestCase[] })[];
}

export function ComplianceTable() {
  const { requirements, testCases, activeDocument, addActivity } = useDocuments();
  const router = useRouter();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);

  const complianceData = useMemo((): ComplianceData[] => {
    const standardsMap: Record<string, Requirement[]> = {};
    const testCasesByReqId = testCases.reduce((acc, tc) => {
        if (!acc[tc.requirementId]) acc[tc.requirementId] = [];
        acc[tc.requirementId].push(tc);
        return acc;
    }, {} as Record<string, TestCase[]>);

    // Find all requirements linked to test cases with compliance standards
    const coveredReqs = requirements.filter(req => 
        (testCasesByReqId[req.id] || []).some(tc => tc.compliance.length > 0)
    );
    
    // Group requirements by the compliance standards of their test cases
    coveredReqs.forEach(req => {
        const standards = new Set(
            (testCasesByReqId[req.id] || []).flatMap(tc => tc.compliance)
        );
        standards.forEach(standard => {
            if (!standardsMap[standard]) standardsMap[standard] = [];
            // Avoid duplicating requirements under the same standard
            if (!standardsMap[standard].find(r => r.id === req.id)) {
                standardsMap[standard].push(req);
            }
        });
    });

    return Object.entries(standardsMap).map(([standard, reqs]) => ({
      standard,
      requirements: reqs.map(req => ({
        ...req,
        testCases: testCasesByReqId[req.id] || []
      })).sort((a,b) => a.id.localeCompare(b.id)),
    })).sort((a,b) => a.standard.localeCompare(b.standard));

  }, [requirements, testCases]);

  const generateComplianceDoc = () => {
    if (!activeDocument) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `Compliance Report for: ${activeDocument.name}`,
            heading: HeadingLevel.TITLE,
          }),
          ...complianceData.flatMap(data => [
             new Paragraph({
                text: data.standard,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400 },
             }),
             ...data.requirements.flatMap(req => [
                new Paragraph({
                    text: `${req.id}: ${req.description}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200 },
                }),
                new Paragraph({
                    text: `Covered by Test Case(s): ${req.testCases.map(tc => tc.id).join(', ') || 'None - GAP IDENTIFIED'}`,
                }),
             ])
          ])
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `Compliance-Report-${activeDocument.name}.docx`);
       addActivity({
          type: 'report_downloaded',
          details: { documentName: activeDocument.name, reportType: 'Compliance' }
      });
    });
  };


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
        <div className="flex justify-between items-center">
            <div>
              <CardTitle>Compliance Report</CardTitle>
              <CardDescription>
                Requirements and test case coverage grouped by compliance standard for '{activeDocument.name}'.
              </CardDescription>
            </div>
             <Button
                variant="outline"
                onClick={generateComplianceDoc}
                disabled={complianceData.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
        </div>
      </CardHeader>
      <CardContent>
         {complianceData.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {complianceData.map(({ standard, requirements }) => (
                <AccordionItem value={standard} key={standard}>
                  <AccordionTrigger className="text-lg font-semibold">
                    {standard}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-4">
                      {requirements.map(req => (
                        <div key={req.id} className="p-3 border rounded-md">
                          <h4 className="font-medium">{req.id}: {req.description}</h4>
                          <div className="mt-2">
                            <span className="text-sm font-semibold">Covered by:</span>
                            {req.testCases.length > 0 ? (
                               <div className="flex flex-wrap gap-1 mt-1">
                                {req.testCases.map(tc => (
                                    <Badge key={tc.id} variant="secondary">{tc.id}</Badge>
                                ))}
                               </div>
                            ) : (
                               <div className="flex items-center gap-2 mt-1 text-destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">No test case coverage</span>
                               </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
         ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-muted-foreground">No test cases with compliance standards found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Generate test cases from requirements and ensure they are mapped to compliance standards.
                </p>
            </div>
         )}
      </CardContent>
    </Card>
  );
}
