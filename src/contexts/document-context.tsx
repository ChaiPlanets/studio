
"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import type { Document, Requirement, TestCase, ActivityEvent } from '@/types';
import { mockDocuments, mockUsers } from '@/data/mock';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';


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
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const firebaseDocs = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                type: data.type,
                size: data.size,
                projectId: data.projectId,
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
                modifiedAt: data.modifiedAt?.toDate().toISOString() || new Date().toISOString(),
                status: data.status,
                storagePath: data.storagePath,
                collaborators: [mockUsers[0]],
            } as Document;
        });
        
        const combinedDocuments = [...firebaseDocs, ...mockDocuments];
        setDocuments(combinedDocuments);
        if (combinedDocuments.length > 0) {
            setActiveDocument(combinedDocuments[0]);
        }
      } catch (error) {
        console.error("Error fetching documents from Firestore:", error);
        setDocuments(mockDocuments);
        if (mockDocuments.length > 0) {
            setActiveDocument(mockDocuments[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
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

    const tempId = `temp-${Date.now()}`;
    const newDocForUi: Document = {
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
        
        // Final document object with real ID from Firestore
        const finalDoc: Document = { ...newDocForUi, id: docRef.id };
        
        // Replace the temporary document with the final one
        setDocuments(prevDocs => prevDocs.map(doc => (doc.id === tempId ? finalDoc : doc)));

        // If the active document is the temporary one, update it as well
        if (activeDocument?.id === tempId) {
            setActiveDocument(finalDoc);
        }

    } catch (e) {
        console.error("Error adding document to Firestore: ", e);
        // If there's an error, remove the temporary document
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== tempId));
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
