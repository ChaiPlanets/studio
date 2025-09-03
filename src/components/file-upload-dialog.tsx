
"use client";

import { useState, useCallback } from "react";
import type { Document } from "@/types";
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

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (file: Omit<Document, 'id' | 'collaborators' | 'projectId'>) => void;
}

const ALLOWED_FILE_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/xml", "text/plain"];

export function FileUploadDialog({ isOpen, onClose }: FileUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { addDocument } = useDocuments();

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;

    const selectedFile = newFiles[0];
    
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: `${selectedFile.name} is not a supported file type.`,
      });
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
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
    if (!file) return;

    addDocument(file);
    toast({
      title: "Upload Started",
      description: `'${file.name}' is being uploaded in the background.`,
    });
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setIsUploading(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Select a single PDF, DOCX, XML, or TXT file to upload.
          </DialogDescription>
        </DialogHeader>
        <div 
          className="p-8 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary transition-colors"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Drop a file here or click to upload</p>
          <input 
            type="file" 
            id="file-input"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
            accept={ALLOWED_FILE_TYPES.join(",")}
          />
        </div>

        {file && (
          <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <File className="h-6 w-6 text-muted-foreground"/>
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                   <p className="text-xs text-muted-foreground">
                    {`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} disabled={isUploading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : `Upload File`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
