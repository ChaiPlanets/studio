"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { DocumentProvider } from "@/contexts/document-context";
import { MainNav } from "@/components/main-nav";

function AppLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
       <header className="flex h-16 items-center px-4 md:px-6 border-b bg-background sticky top-0 z-50">
        <MainNav />
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

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <DocumentProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </DocumentProvider>
  );
}
