"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, X } from "lucide-react";

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadableFile {
  file: File;
  progress: number;
  error?: string;
}

const ALLOWED_FILE_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/xml", "text/plain"];

export function FileUploadDialog({ isOpen, onClose }: FileUploadDialogProps) {
  const [files, setFiles] = useState<UploadableFile[]>([]);
  const { toast } = useToast();

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const addedFiles = Array.from(newFiles).map(f => ({ file: f, progress: 0 }));
    
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


  const handleUpload = async () => {
    // Simulate upload process
    const uploadPromises = files.map(uploadableFile => {
        return new Promise<void>(resolve => {
            const interval = setInterval(() => {
                setFiles(prev => prev.map(f => {
                    if (f.file.name === uploadableFile.file.name && f.progress < 100) {
                        return { ...f, progress: f.progress + 10 };
                    }
                    return f;
                }));
            }, 200);

            setTimeout(() => {
                clearInterval(interval);
                 setFiles(prev => prev.map(f => f.file.name === uploadableFile.file.name ? { ...f, progress: 100 } : f));
                resolve();
            }, 2200);
        });
    });

    await Promise.all(uploadPromises);

    toast({
      title: "Upload Successful",
      description: `${files.length} file(s) have been uploaded.`,
    });

    // Reset and close
    setTimeout(() => {
      setFiles([]);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                  <Progress value={f.progress} className="h-2 mt-1" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(f.file.name)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpload} disabled={files.length === 0 || files.some(f => f.progress > 0 && f.progress < 100)}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
