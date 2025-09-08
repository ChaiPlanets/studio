
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useDocuments } from "@/contexts/document-context";
import {
  FileText,
  ClipboardList,
  FlaskConical,
  Link2,
  Download,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ActivityEvent, ActivityEventType } from "@/types";

const activityIcons: Record<ActivityEventType, React.ReactNode> = {
  document_uploaded: <FileText className="h-4 w-4" />,
  requirements_extracted: <ClipboardList className="h-4 w-4" />,
  test_cases_generated: <FlaskConical className="h-4 w-4" />,
  test_cases_logged: <Link2 className="h-4 w-4" />,
  report_downloaded: <Download className="h-4 w-4" />,
};

const formatActivityText = (event: ActivityEvent): string => {
    switch (event.type) {
        case 'document_uploaded':
            return `Uploaded '${event.details.documentName}'.`;
        case 'requirements_extracted':
            return `Extracted ${event.details.count} requirements from '${event.details.documentName}'.`;
        case 'test_cases_generated':
            return `Generated ${event.details.count} test cases.`;
        case 'test_cases_logged':
            return `Logged ${event.details.count} test cases to Jira.`;
        case 'report_downloaded':
            return `Downloaded the ${event.details.reportType} report.`;
        default:
            return "An unknown activity occurred.";
    }
}

export function RecentActivity() {
  const { activityLog } = useDocuments();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of the latest events in your project.</CardDescription>
      </CardHeader>
      <CardContent>
        {activityLog.length > 0 ? (
            <div className="space-y-4">
            {activityLog.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {activityIcons[event.type]}
                    </div>
                    <div>
                        <p className="text-sm">{formatActivityText(event)}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center text-sm text-muted-foreground h-32 flex items-center justify-center">
                <p>No recent activity to display.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
