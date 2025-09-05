
"use client";

import { useState } from "react";
import type { Document } from "@/types";
import { Button } from "@/components/ui/button";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { PlusCircle, ClipboardList, FlaskConical } from "lucide-react";
import { useDocuments } from "@/contexts/document-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useRouter } from "next/navigation";
import { RequirementsChart } from "./requirements-chart";
import { TestCasesChart } from "./test-cases-chart";

export default function Dashboard() {
  const { documents, activeDocument, requirements, testCases } = useDocuments();
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of your active document '{activeDocument?.name}'.
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {documents.length > 0 ? (
        <div className="grid gap-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Requirements
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{requirements.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Test Cases
                </CardTitle>
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testCases.length}</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <RequirementsChart />
            <TestCasesChart />
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Documents Found</CardTitle>
            <CardDescription>
              Upload your first document to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      )}

      <FileUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadSuccess={() => {}}
      />
    </div>
  );
}
