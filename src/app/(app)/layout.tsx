"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  Bell,
  File,
  Home,
  Settings,
  FileText,
  ClipboardList,
  FlaskConical,
  GitMerge,
} from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { DocumentProvider, useDocuments } from "@/contexts/document-context";

function AppLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { documents, requirements, testCases } = useDocuments();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-sidebar-primary" />
            <h1 className="text-2xl font-semibold text-sidebar-primary">Fireflow</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard" passHref>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard'}>
                  <span>
                    <Home />
                    Dashboard
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/requirements" passHref>
                <SidebarMenuButton asChild isActive={pathname === '/requirements'}>
                  <span>
                    <ClipboardList />
                    Requirements
                    <SidebarMenuBadge>{requirements.length}</SidebarMenuBadge>
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/test-cases" passHref>
                <SidebarMenuButton asChild isActive={pathname === '/test-cases'}>
                  <span>
                    <FlaskConical />
                    Test Cases
                     <SidebarMenuBadge>{testCases.length}</SidebarMenuBadge>
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/traceability-matrix" passHref>
                <SidebarMenuButton asChild isActive={pathname === '/traceability-matrix'}>
                  <span>
                    <GitMerge />
                    Traceability Matrix
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <Link href="/documents" passHref>
                <SidebarMenuButton asChild isActive={pathname === '/documents'}>
                  <span>
                    <File />
                    All Documents
                    <SidebarMenuBadge>{documents.length}</SidebarMenuBadge>
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-2">
             <SidebarTrigger className="md:hidden" />
            <h2 className="text-xl font-semibold text-foreground capitalize">
              {pathname.substring(1).replace('-', ' ') || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <UserNav />
          </div>
        </header>
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <DocumentProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </DocumentProvider>
  );
}
