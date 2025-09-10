
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FlaskConical,
  GitMerge,
  File,
  ShieldCheck,
  LayoutDashboard,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocuments } from "@/contexts/document-context";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface MainNavProps {
  isMobile?: boolean;
}

export function MainNav({ isMobile = false }: MainNavProps) {
  const pathname = usePathname();
  const { documents, requirements, testCases, loading } = useDocuments();

  const navLinks = [
    {
      href: "/home",
      label: "Home",
      icon: Home,
      badge: undefined,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      href: "/documents",
      label: "All Documents",
      icon: File,
      badge: documents.length,
    },
    {
      href: "/requirements",
      label: "Requirements",
      icon: ClipboardList,
      badge: requirements.length,
    },
    {
      href: "/test-cases",
      label: "Test Cases",
      icon: FlaskConical,
      badge: testCases.length,
    },
    {
      href: "/traceability-matrix",
      label: "Traceability Matrix",
      icon: GitMerge,
      badge: undefined,
    },
    {
      href: "/compliance",
      label: "Compliance",
      icon: ShieldCheck,
      badge: undefined,
    },
  ];

  if (isMobile) {
    return (
      <>
        {navLinks.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-4 px-2.5",
              pathname === href
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
            {badge !== undefined && badge > 0 && (
              <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                {badge}
              </Badge>
            )}
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      {loading
        ? navLinks.map((link) => (
            <Skeleton key={link.href} className="h-8 w-8 rounded-lg" />
          ))
        : navLinks.map(({ href, label, icon: Icon, badge }) => (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 relative",
                    pathname === href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <Badge className="absolute -right-2 -top-2 h-4 w-4 justify-center rounded-full p-1 text-xs">
                      {badge}
                    </Badge>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ))}
    </>
  );
}
