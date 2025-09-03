
"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import type { Document, Requirement, TestCase } from '@/types';
import { mockUsers } from '@/data/mock';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

interface DocumentContextType {
  documents: Document[];
  loading: boolean;
  addDocument: (file: File) => void;
  activeDocument: Document | null;
  setActiveDocument: Dispatch<SetStateAction<Document | null>>;
  requirements: Requirement[];
  setRequirements: Dispatch<SetStateAction<Requirement[]>>;
  testCases: TestCase[];
  setTestCases: Dispatch<SetStateAction<TestCase[]>>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

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

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (documents.length > 0 && !activeDocument) {
      setActiveDocument(documents[0]);
    }
  }, [documents, activeDocument]);

  const addDocument = (file: File) => {
    if (!file) return;

    const tempId = `temp-${Date.now()}`;
    const newDoc: Document = {
      id: tempId,
      name: file.name,
      type: getFileType(file),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      status: "Draft",
      storagePath: `/documents/${file.name}`,
      collaborators: [mockUsers[0]],
      projectId: "proj-1"
    };

    setDocuments(prevDocs => [newDoc, ...prevDocs]);
    setActiveDocument(newDoc);

    // Run the actual upload in the background
    (async () => {
      try {
        const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        const docData = {
          name: file.name,
          type: getFileType(file),
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          status: "Draft",
          storagePath: uploadResult.ref.fullPath,
          downloadURL: downloadURL,
          projectId: "proj-1",
          createdAt: serverTimestamp(),
          modifiedAt: serverTimestamp(),
          collaboratorIds: [mockUsers[0].id],
        };

        const docRef = await addDoc(collection(db, 'documents'), docData);

        setDocuments(prevDocs =>
          prevDocs.map(doc =>
            doc.id === tempId ? { ...doc, id: docRef.id, storagePath: uploadResult.ref.fullPath } : doc
          )
        );

        toast({
          title: "Upload Successful",
          description: `'${file.name}' has been saved to Firebase.`,
        });

      } catch (error) {
        console.error("Firebase upload failed:", error);
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== tempId));
        if (activeDocument?.id === tempId) {
            setActiveDocument(documents[0] || null);
        }
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: `Could not save '${file.name}' to Firebase.`,
        });
      }
    })();
  };


  return (
    <DocumentContext.Provider value={{ 
      documents, 
      loading,
      addDocument,
      activeDocument,
      setActiveDocument,
      requirements,
      setRequirements,
      testCases,
      setTestCases
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}
