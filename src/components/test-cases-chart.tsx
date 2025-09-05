
"use client"

import { useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useDocuments } from "@/contexts/document-context"

const chartConfig = {
  Positive: {
    label: "Positive",
    color: "hsl(var(--chart-1))",
  },
  Negative: {
    label: "Negative",
    color: "hsl(var(--chart-2))",
  },
  "Edge Case": {
    label: "Edge Case",
    color: "hsl(var(--chart-3))",
  },
}

export function TestCasesChart() {
  const { testCases } = useDocuments()

  const chartData = useMemo(() => {
    const counts = testCases.reduce((acc, tc) => {
      acc[tc.type] = (acc[tc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      fill: chartConfig[type as keyof typeof chartConfig]?.color || "hsl(var(--muted))"
    }));
  }, [testCases])

  if (testCases.length === 0) {
     return (
       <Card>
        <CardHeader>
          <CardTitle>Test Cases by Type</CardTitle>
          <CardDescription>No test cases generated yet.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-muted-foreground">
          <p>Chart will appear here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Cases by Type</CardTitle>
        <CardDescription>A breakdown of generated test cases.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10 }}>
            <YAxis
              dataKey="type"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="capitalize"
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
