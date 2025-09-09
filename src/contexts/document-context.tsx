
"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import type { Document, Requirement, TestCase, ActivityEvent } from '@/types';
import { mockDocuments, mockUsers } from '@/data/mock';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


interface DocumentContextType {
  documents: Document[];
  loading: boolean;
  addDocument: (file: File) => void;
  deleteDocument: (documentId: string) => void;
  activeDocument: Document | null;
  setActiveDocument: (document: Document | null) => void;
  requirements: Requirement[];
  setRequirements: Dispatch<SetStateAction<Requirement[]>>;
  testCases: TestCase[];
  setTestCases: Dispatch<SetStateAction<TestCase[]>>;
  activityLog: ActivityEvent[];
  addActivity: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
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
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);

  // useEffect for initial data fetching, runs only once
  useEffect(() => {
    // Using only mock data for faster initial load as requested
    setLoading(true);
    setDocuments(mockDocuments);
    if (mockDocuments.length > 0) {
      setActiveDocument(mockDocuments[0]);
    }
    setLoading(false);
  }, []);


  const addActivity = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newActivity: ActivityEvent = {
        ...event,
        id: `event-${Date.now()}`,
        timestamp: new Date().toISOString(),
    };
    setActivityLog(prev => [newActivity, ...prev].slice(0, 10)); // Keep last 10 activities
  }

  const addDocument = async (file: File) => {
    if (!file) return;

    const newDocForUi: Document = {
      id: `local-${Date.now()}`, // Keep it local
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
    
    // Optimistically update the UI
    setDocuments(prevDocs => [newDocForUi, ...prevDocs]);
    setActiveDocument(newDocForUi);
    setRequirements([]);
    setTestCases([]);
    addActivity({
        type: 'document_uploaded',
        details: { documentName: newDocForUi.name }
    });
    
    try {
        const docData = {
            name: newDocForUi.name,
            type: newDocForUi.type,
            size: newDocForUi.size,
            status: newDocForUi.status,
            storagePath: newDocForUi.storagePath,
            projectId: newDocForUi.projectId,
            createdAt: serverTimestamp(),
            modifiedAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, "documents"), docData);
        console.log("Document written to Firestore with ID: ", docRef.id);

    } catch (e) {
        console.error("Error adding document to Firestore: ", e);
    }
  };
  
  const deleteDocument = (documentId: string) => {
    setDocuments(prevDocs => {
      const newDocs = prevDocs.filter(doc => doc.id !== documentId);
      
      if (activeDocument?.id === documentId) {
        if (newDocs.length > 0) {
          setActiveDocument(newDocs[0]);
        } else {
          setActiveDocument(null);
        }
        setRequirements([]);
        setTestCases([]);
      }
      return newDocs;
    });
  };

  const selectActiveDocument = (document: Document | null) => {
    setActiveDocument(document);
    setRequirements([]);
    setTestCases([]);
  }

  return (
    <DocumentContext.Provider value={{ 
      documents, 
      loading,
      addDocument,
      deleteDocument,
      activeDocument,
      setActiveDocument: selectActiveDocument,
      requirements,
      setRequirements,
      testCases,
      setTestCases,
      activityLog,
      addActivity
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
