
"use client"

import { useMemo } from "react"
import { Pie, PieChart } from "recharts"
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { useDocuments } from "@/contexts/document-context"

const chartConfig = {
  Functional: {
    label: "Functional",
    color: "hsl(var(--chart-1))",
  },
  "Non-Functional": {
    label: "Non-Functional",
    color: "hsl(var(--chart-2))",
  },
  Compliance: {
    label: "Compliance",
    color: "hsl(var(--chart-3))",
  },
}

export function RequirementsChart() {
  const { requirements } = useDocuments()

  const chartData = useMemo(() => {
    const counts = requirements.reduce((acc, req) => {
      acc[req.category] = (acc[req.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      fill: chartConfig[category as keyof typeof chartConfig]?.color || "hsl(var(--muted))",
    }))
  }, [requirements])

  if (requirements.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Requirements by Category</CardTitle>
          <CardDescription>No requirements extracted yet.</CardDescription>
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
        <CardTitle>Requirements by Category</CardTitle>
        <CardDescription>A breakdown of extracted requirements.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="category"
              innerRadius={60}
            />
             <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="-translate-y-[2px] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
