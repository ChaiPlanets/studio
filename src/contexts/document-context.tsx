
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
                collaborators: [mockUsers[0]], // Using mock collaborator for now
            } as Document;
        });
        
        // Combine mock data with Firebase data
        const combinedDocuments = [...firebaseDocs, ...mockDocuments];
        setDocuments(combinedDocuments);

      } catch (error) {
        console.error("Error fetching documents from Firestore:", error);
        // Fallback to mock documents if Firebase fetch fails
        setDocuments(mockDocuments);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    // Ensure a default document is selected on load if one isn't already active
    if (!loading && documents.length > 0 && !activeDocument) {
      setActiveDocument(documents[0]);
    }
  }, [documents, loading, activeDocument]);

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

    // Create a temporary local object for immediate UI update
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
        console.log("Document metadata written to Firestore with ID: ", docRef.id);
        
        // Replace temporary local object with the real one from Firestore
        setDocuments(prevDocs => prevDocs.map(doc => 
            doc.id === tempId 
            ? { ...newDocForUi, id: docRef.id, createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString() } 
            : doc
        ));

    } catch (e) {
        console.error("Error adding document to Firestore: ", e);
        // If there was an error, remove the temporary document from the UI
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
