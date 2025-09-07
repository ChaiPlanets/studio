
"use client";

import { useDocuments } from "@/contexts/document-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Target, DollarSign, Activity, Percent } from "lucide-react";
import type { Requirement, ComplianceStandard } from "@/types";
import { useMemo } from "react";

// --- ROI Calculation Constants ---
const AVG_HOURLY_RATE_USD = 75; // Blended rate for analyst/QA
const TIME_SAVED_PER_REQUIREMENT_MINS = 5;
const TIME_SAVED_PER_TEST_CASE_MINS = 15;
// --- End ROI Constants ---

export function Metrics() {
  const { requirements, testCases } = useDocuments();

  const roiData = useMemo(() => {
    const totalRequirementsTimeSaved =
      requirements.length * TIME_SAVED_PER_REQUIREMENT_MINS;
    const totalTestCasesTimeSaved =
      testCases.length * TIME_SAVED_PER_TEST_CASE_MINS;

    const totalTimeSavedMins =
      totalRequirementsTimeSaved + totalTestCasesTimeSaved;
    const totalTimeSavedHours = totalTimeSavedMins / 60;
    const totalCostSaved = totalTimeSavedHours * AVG_HOURLY_RATE_USD;

    return {
      timeSaved: totalTimeSavedHours.toFixed(1),
      costSaved: totalCostSaved.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    };
  }, [requirements, testCases]);

  const complianceScore = useMemo(() => {
    const complianceRequirements = requirements.filter(
      (r) => r.category === "Compliance"
    );

    if (complianceRequirements.length === 0) {
      return 100; // If no compliance reqs, we are 100% compliant with what's specified
    }

    const testCasesForComplianceReqs = testCases.filter((tc) =>
      complianceRequirements.some((r) => r.id === tc.requirementId)
    );
    
    // Check which compliance requirements have at least one test case
    const coveredReqs = new Set(testCasesForComplianceReqs.map(tc => tc.requirementId));

    return (coveredReqs.size / complianceRequirements.length) * 100;

  }, [requirements, testCases]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Automation ROI
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{roiData.costSaved}</div>
          <p className="text-xs text-muted-foreground">
            Estimated cost savings from ~{roiData.timeSaved} hours of automated work.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Compliance Confidence Score
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {complianceScore.toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Percentage of compliance requirements covered by test cases.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
