
"use client";

import { useState, useCallback } from "react";
import type { Document, User } from "@/types";
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
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useDocuments } from "@/contexts/document-context";
import { mockUsers } from "@/data/mock";

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (file: Omit<Document, 'id' | 'collaborators' | 'projectId'>) => void;
}

interface UploadableFile {
  file: File;
  progress: number;
  error?: string;
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
    if (files.length === 0) return;
  
    setIsUploading(true);
    const filesToUpload = [...files];
    
    const uploadPromises = filesToUpload.map(uploadableFile => {
      return new Promise<string>((resolve, reject) => {
        const storageRef = ref(storage, `documents/${uploadableFile.file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, uploadableFile.file);
  
        uploadTask.on(
          'state_changed',
          snapshot => {
            // Progress can be handled here in the future
          },
          error => {
            console.error(`Upload error for ${uploadableFile.file.name}:`, error);
            reject({ fileName: uploadableFile.file.name, error });
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const newFile: Omit<Document, 'id'> = {
                name: uploadableFile.file.name,
                type: getFileType(uploadableFile.file),
                size: `${(uploadableFile.file.size / 1024 / 1024).toFixed(2)} MB`,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                status: "Draft",
                storagePath: downloadURL,
                collaborators: [mockUsers[0] as User],
                projectId: "proj-1"
              };
              await addDocument(newFile);
              resolve(uploadableFile.file.name);
            } catch (dbError) {
              console.error(`Error creating document in DB for ${uploadableFile.file.name}:`, dbError);
              reject({ fileName: uploadableFile.file.name, error: dbError });
            }
          }
        );
      });
    });
  
    setFiles([]);
    onClose();

    try {
      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads = results.filter(r => r.status === 'fulfilled').length;
      const failedUploads = results.filter(r => r.status === 'rejected').length;

      if (successfulUploads > 0) {
        toast({
          title: "Uploads Complete",
          description: `${successfulUploads} file(s) uploaded successfully.`,
        });
      }

      if (failedUploads > 0) {
        const firstError = results.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined;
        const failedFileName = firstError?.reason?.fileName || 'a file';
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: `Could not upload ${failedFileName}. ${failedUploads > 1 ? `(${failedUploads - 1} other files also failed)` : ''}`,
        });
      }

    } catch (error) {
       console.error("An unexpected error occurred during upload processing:", error);
       toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "An unexpected error occurred. Please try again.",
        });
    } finally {
      setIsUploading(false);
    }
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
            {isUploading ? "Uploading..." : `Upload ${files.length} file(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
