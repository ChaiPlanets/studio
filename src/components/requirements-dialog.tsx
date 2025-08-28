"use client";

import { useState } from "react";
import type { Requirement } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "./ui/scroll-area";

interface RequirementsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requirements: Requirement[];
  setRequirements: (requirements: Requirement[]) => void;
  documentName: string;
}

export function RequirementsDialog({
  isOpen,
  onClose,
  requirements,
  setRequirements,
  documentName,
}: RequirementsDialogProps) {
  const [editedRequirements, setEditedRequirements] = useState(requirements);

  useState(() => {
    setEditedRequirements(requirements);
  });
  
  const handleDescriptionChange = (id: string, value: string) => {
    setEditedRequirements(prev =>
      prev.map(req => (req.id === id ? { ...req, description: value } : req))
    );
  };

  const handleCategoryChange = (id: string, value: Requirement['category']) => {
    setEditedRequirements(prev =>
      prev.map(req => (req.id === id ? { ...req, category: value } : req))
    );
  };

  const handleSaveChanges = () => {
    setRequirements(editedRequirements);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Extracted Requirements</DialogTitle>
          <DialogDescription>
            Review, edit, and validate the requirements extracted from {documentName}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 relative">
          <ScrollArea className="h-full absolute inset-0">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[200px]">Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedRequirements.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.id}</TableCell>
                    <TableCell>
                      <Input
                        value={req.description}
                        onChange={(e) => handleDescriptionChange(req.id, e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={req.category}
                        onValueChange={(value: Requirement['category']) => handleCategoryChange(req.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Functional">Functional</SelectItem>
                          <SelectItem value="Non-Functional">Non-Functional</SelectItem>
                          <SelectItem value="Compliance">Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
