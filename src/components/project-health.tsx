
"use client";

import { useMemo } from "react";
import { useDocuments } from "@/contexts/document-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Target, Link2, TestTube } from "lucide-react";

export function ProjectHealth() {
  const { requirements, testCases } = useDocuments();
  const router = useRouter();

  const metrics = useMemo(() => {
    const totalRequirements = requirements.length;
    if (totalRequirements === 0) {
      return { readiness: 0, completeness: 0, traceability: 0, nextAction: 'extract' };
    }

    const requirementsWithTests = new Set(testCases.map(tc => tc.requirementId));
    const completeness = (requirementsWithTests.size / totalRequirements) * 100;

    const totalTestCases = testCases.length;
    const testCasesInJira = testCases.filter(tc => tc.jiraKey).length;
    const traceability = totalTestCases > 0 ? (testCasesInJira / totalTestCases) * 100 : 0;
    
    const maturity = totalTestCases / totalRequirements;
    const normalizedMaturity = Math.min((maturity / 3) * 100, 100);

    const readiness = (completeness + traceability + normalizedMaturity) / 3;

    let nextAction = 'done';
    if (completeness < 100) nextAction = 'generate';
    else if (traceability < 100) nextAction = 'log';

    return {
      readiness: Math.round(readiness),
      completeness: Math.round(completeness),
      traceability: Math.round(traceability),
      nextAction,
    };
  }, [requirements, testCases]);

  const getHealthStatus = () => {
    if (metrics.readiness >= 80) {
      return {
        title: "Excellent",
        description: "This project is in great shape and well-prepared for an audit.",
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        color: "bg-green-500",
      };
    }
    if (metrics.readiness >= 50) {
      return {
        title: "Good",
        description: "This project is on the right track but could use some improvements.",
        icon: <Target className="h-6 w-6 text-yellow-500" />,
        color: "bg-yellow-500",
      };
    }
    return {
      title: "Needs Attention",
      description: "There are critical gaps in this project that need to be addressed.",
      icon: <AlertCircle className="h-6 w-6 text-red-500" />,
      color: "bg-red-500",
    };
  };

  const getNextAction = () => {
    switch (metrics.nextAction) {
      case 'extract':
        return {
          text: "Start by extracting requirements from your document.",
          buttonText: "Go to Document",
          icon: <TestTube className="mr-2 h-4 w-4" />,
          action: () => router.push('/document'),
        };
      case 'generate':
        return {
          text: `Your next step is to generate test cases for the ${requirements.length - testCases.filter(tc => requirements.some(r => r.id === tc.requirementId)).length} uncovered requirements.`,
          buttonText: "Go to Requirements",
          icon: <TestTube className="mr-2 h-4 w-4" />,
          action: () => router.push('/requirements'),
        };
      case 'log':
        return {
          text: `Improve your traceability by logging the remaining ${testCases.length - testCases.filter(tc => tc.jiraKey).length} test cases to Jira.`,
          buttonText: "Go to Test Cases",
          icon: <Link2 className="mr-2 h-4 w-4" />,
          action: () => router.push('/test-cases'),
        };
      case 'done':
      default:
        return {
          text: "All requirements are covered and traced. Great job!",
          buttonText: null,
          icon: null,
          action: () => {},
        };
    }
  };

  const healthStatus = getHealthStatus();
  const nextAction = getNextAction();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Health Summary</CardTitle>
        <CardDescription>
          An overview of your project's audit readiness and next steps.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          {healthStatus.icon}
          <div>
            <h3 className="text-lg font-semibold">{healthStatus.title}</h3>
            <p className="text-sm text-muted-foreground">{healthStatus.description}</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Overall Readiness</span>
            <span className="text-sm font-bold">{metrics.readiness}%</span>
          </div>
          <Progress value={metrics.readiness} indicatorClassName={healthStatus.color} />
        </div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Recommended Next Step</h4>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{nextAction.text}</p>
            {nextAction.buttonText && (
              <Button onClick={nextAction.action}>
                {nextAction.icon}
                {nextAction.buttonText}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
