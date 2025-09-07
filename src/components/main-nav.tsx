
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, ClipboardList, FlaskConical, GitMerge, File, FileSearch, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDocuments } from "@/contexts/document-context"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"

export function MainNav() {
  const pathname = usePathname()
  const { documents, requirements, testCases } = useDocuments()
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: FileSearch,
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
    },
    {
      href: "/compliance",
      label: "Compliance",
      icon: ShieldCheck,
    },
    {
      href: "/documents",
      label: "All Documents",
      icon: File,
      badge: documents.length,
    },
  ]

  return (
    <nav className="flex items-center gap-6 text-sm font-medium">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-lg font-semibold md:text-base"
      >
        <FileText className="h-6 w-6" />
        <span className="sr-only">Fireflow</span>
      </Link>
       {isClient
        ? navLinks.map(({ href, label, badge }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "transition-colors hover:text-foreground relative",
                pathname === href ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
              {badge !== undefined && badge > 0 && (
                <Badge className="absolute -right-4 -top-2 h-4 w-4 justify-center rounded-full p-1 text-xs">
                  {badge}
                </Badge>
              )}
            </Link>
          ))
        : navLinks.map((link) => (
            <Skeleton key={link.href} className="h-5 w-24" />
          ))}
    </nav>
  )
}
