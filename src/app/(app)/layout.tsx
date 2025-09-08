
"use client";

import type { ReactNode } from "react";
import { Bell, FileText, Home, PanelLeft } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { DocumentProvider } from "@/contexts/document-context";
import { MainNav } from "@/components/main-nav";
import { JiraProvider } from "@/contexts/jira-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";

function AppLayoutContent({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <FileText className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Fireflow</span>
                </Link>
                <MainNav isMobile={true} />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/dashboard"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <FileText className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">Fireflow</span>
            </Link>
            <MainNav />
          </nav>
        </TooltipProvider>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 pt-0">{children}</main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <DocumentProvider>
      <JiraProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </JiraProvider>
    </DocumentProvider>
  );
}
