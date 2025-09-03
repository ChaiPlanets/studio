"use client";

import { useState, useCallback } from "react";
import type { Document, AppUser } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, X, Loader2 } from "lucide-react";
import { useDocuments } from "@/contexts/document-context";
import { mockUsers } from "@/data/mock";

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (file: Omit<Document, 'id' | 'collaborators' | 'projectId'>) => void;
}

interface UploadableFile {
  file: File;
}

const ALLOWED_FILE_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/xml", "text/plain"];

const getFileType = (file: File): Document['type'] => {
    switch (file.type) {
        case "application/pdf":
            return "pdf";
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return "docx";
        case "text/xml":
            return "xml";
        case "text/plain":
            return "txt";
        default:
            return "txt";
    }
}

export function FileUploadDialog({ isOpen, onClose }: FileUploadDialogProps) {
  const [files, setFiles] = useState<UploadableFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { addDocument } = useDocuments();

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const addedFiles = Array.from(newFiles).map(f => ({ file: f }));
    
    const validFiles = addedFiles.filter(f => {
      if (!ALLOWED_FILE_TYPES.includes(f.file.type)) {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: `${f.file.name} is not a supported file type.`,
        });
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.file.name !== fileName));
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleFileChange(event.dataTransfer.files);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleUpload = () => {
    if (files.length === 0) return;
  
    setIsUploading(true);
    
    files.forEach(f => {
      const newFile: Omit<Document, 'id'> = {
        name: f.file.name,
        type: getFileType(f.file),
        size: `${(f.file.size / 1024 / 1024).toFixed(2)} MB`,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        status: "Draft",
        storagePath: `/documents/${f.file.name}`, // Mock path
        collaborators: [mockUsers[0] as AppUser],
        projectId: "proj-1"
      };
      addDocument(newFile);
    });

    setIsUploading(false);
    setFiles([]);
    onClose();
    toast({
      title: "Upload Complete",
      description: `${files.length} file(s) added successfully.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if(!open) {
        setFiles([]);
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Drag and drop files or click to browse. Supports PDF, DOCX, XML, and TXT.
          </DialogDescription>
        </DialogHeader>
        <div 
          className="p-8 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary transition-colors"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Drop files here or click to upload</p>
          <input 
            type="file" 
            id="file-input"
            multiple 
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
            accept={ALLOWED_FILE_TYPES.join(",")}
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-4 mt-4 max-h-60 overflow-y-auto">
            {files.map(f => (
              <div key={f.file.name} className="flex items-center gap-4">
                <File className="h-6 w-6 text-muted-foreground"/>
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{f.file.name}</p>
                   <p className="text-xs text-muted-foreground">
                    {`${(f.file.size / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(f.file.name)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setFiles([]);
            onClose();
          }}>Cancel</Button>
          <Button onClick={handleUpload} disabled={files.length === 0 || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Processing..." : `Add ${files.length} file(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
