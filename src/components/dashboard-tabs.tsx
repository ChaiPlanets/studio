
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useDocuments } from "@/contexts/document-context";
import { DocumentPreview } from "./document-preview";
import { RequirementsChart } from "./requirements-chart";
import { TestCasesChart } from "./test-cases-chart";
import { ClipboardList, FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function DashboardTabs() {
  const { activeDocument, requirements, testCases } = useDocuments();
  const router = useRouter();

  if (!activeDocument) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Document Selected</CardTitle>
          <CardDescription>
            Select a document from the 'All Documents' page to view its
            details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/documents")}>
            View Documents
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="document">Document</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
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
      </TabsContent>
      <TabsContent value="document">
        <div className="mt-6">
          <DocumentPreview document={activeDocument} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
