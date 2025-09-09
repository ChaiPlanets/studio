
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FileText, ClipboardList, FlaskConical, Link2, GitMerge, LayoutDashboard } from "lucide-react";

const features = [
  {
    icon: <LayoutDashboard className="h-10 w-10 text-primary" />,
    title: "Interactive Dashboard",
    description: "Get a real-time overview of your project's health, traceability, and audit readiness from a single place.",
  },
  {
    icon: <ClipboardList className="h-10 w-10 text-primary" />,
    title: "AI Requirement Extraction",
    description: "Automatically identify and extract functional, non-functional, and compliance requirements from any document.",
  },
  {
    icon: <FlaskConical className="h-10 w-10 text-primary" />,
    title: "Automated Test Case Generation",
    description: "Generate comprehensive positive, negative, and edge-case test cases directly from your requirements.",
  },
  {
    icon: <Link2 className="h-10 w-10 text-primary" />,
    title: "Seamless Jira Integration",
    description: "Log test cases as issues in your Jira projects with a single click, keeping your workflows synchronized.",
  },
  {
    icon: <GitMerge className="h-10 w-10 text-primary" />,
    title: "Full Traceability",
    description: "Instantly view and export traceability matrices and compliance reports to ensure audit readiness.",
  },
];


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-1">
              <div className="flex flex-col justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Streamline Your Document Workflow with Fireflow
                  </h1>
                  <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl">
                    Our intelligent platform helps you extract requirements, generate test cases, and ensure compliance with ease.
                  </p>
                </div>
                <div className="flex justify-center gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/documents">
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
              <Carousel className="w-full max-w-5xl mx-auto" opts={{ loop: true }}>
                <CarouselContent className="-ml-4">
                  {features.map((feature, index) => (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2">
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex flex-col items-center justify-center p-6 aspect-video space-y-4 text-center">
                            {feature.icon}
                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
