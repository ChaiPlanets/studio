
"use client";

import { useDocuments } from "@/contexts/document-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle, Link2, BarChart3, ShieldCheck } from "lucide-react";
import { useMemo } from "react";

export function AuditMetrics() {
  const { requirements, testCases } = useDocuments();

  const metrics = useMemo(() => {
    const totalRequirements = requirements.length;
    const totalTestCases = testCases.length;

    if (totalRequirements === 0) {
      return { completeness: 0, traceability: 0, maturity: 0, readiness: 0 };
    }

    // Completeness: % of requirements with at least one test case
    const requirementsWithTests = new Set(testCases.map(tc => tc.requirementId));
    const completeness = (requirementsWithTests.size / totalRequirements) * 100;

    // Traceability: % of test cases logged to Jira
    const testCasesInJira = testCases.filter(tc => tc.jiraKey).length;
    const traceability = totalTestCases > 0 ? (testCasesInJira / totalTestCases) * 100 : 0;
    
    // Testing Maturity: Average number of test cases per requirement
    const maturity = totalTestCases / totalRequirements;

    // Audit Readiness: Average of the other scores (maturity normalized)
    // We'll cap maturity's contribution at 100% (e.g., 3+ tests/req is 100%)
    const normalizedMaturity = Math.min((maturity / 3) * 100, 100);
    const readiness = (completeness + traceability + normalizedMaturity) / 3;

    return {
      completeness: completeness.toFixed(0),
      traceability: traceability.toFixed(0),
      maturity: maturity.toFixed(1),
      readiness: readiness.toFixed(0),
    };
  }, [requirements, testCases]);

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completeness</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.completeness}%</div>
          <p className="text-xs text-muted-foreground">
            Requirements covered by tests
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Traceability</CardTitle>
          <Link2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.traceability}%</div>
          <p className="text-xs text-muted-foreground">
            Test cases logged in Jira
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Testing Maturity</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.maturity}</div>
          <p className="text-xs text-muted-foreground">
            Avg. tests per requirement
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Audit Readiness</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.readiness}%</div>
          <p className="text-xs text-muted-foreground">
            Overall readiness score
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
