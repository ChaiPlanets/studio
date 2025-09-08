
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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
import { AuditMetrics } from "./audit-metrics";
import { ProjectHealth } from "./project-health";
import { RecentActivity } from "./recent-activity";

export default function Dashboard() {
  const { documents, activeDocument } = useDocuments();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          {activeDocument ? (
            <p className="text-sm text-muted-foreground">
              Health and activity overview for '{activeDocument.name}'.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active document. Select one from 'All Documents' or upload a new one.
            </p>
          )}
        </div>
      </div>

      {documents.length > 0 ? (
        <div className="grid gap-6 mt-6">
           <AuditMetrics />
           <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ProjectHealth />
              </div>
              <RecentActivity />
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
            <Button onClick={() => router.push('/document')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
