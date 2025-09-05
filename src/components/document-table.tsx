"use client";

import type React from "react";
import type { Document } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, FileCode, MoreHorizontal } from "lucide-react";

interface DocumentTableProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDocument: (document: Document) => void;
  onDeleteDocument: (document: Document) => void;
}

const fileTypeIcons: { [key: string]: React.ElementType } = {
  pdf: FileText,
  docx: FileText,
  xml: FileCode,
  txt: FileCode,
};

const statusColors: { [key: string]: string } = {
  Draft:
    "border-gray-300 text-gray-800 bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800",
  "In Review":
    "border-yellow-300 text-yellow-800 bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:bg-yellow-800",
  Approved:
    "border-green-300 text-green-800 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-800",
};

export function DocumentTable({
  documents,
  selectedDocument,
  onSelectDocument,
  onDeleteDocument,
}: DocumentTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80%]">File Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const Icon = fileTypeIcons[doc.type] || FileText;
            return (
              <TableRow
                key={doc.id}
                className={cn(
                  "cursor-pointer",
                  selectedDocument?.id === doc.id && "bg-muted/50"
                )}
                onClick={() => onSelectDocument(doc)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Last updated{" "}
                        {new Date(doc.modifiedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(statusColors[doc.status])}
                  >
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => onDeleteDocument(doc)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
