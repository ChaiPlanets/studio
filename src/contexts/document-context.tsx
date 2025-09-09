
"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import type { Document, Requirement, TestCase, ActivityEvent } from '@/types';
import { mockDocuments, mockUsers } from '@/data/mock';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, writeBatch, doc } from 'firebase/firestore';
import { ref, uploadBytes } from "firebase/storage";


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
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [loading, setLoading] = useState(true);
  const [activeDocument, setActiveDocument] = useState<Document | null>(mockDocuments[0] || null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      
      const clearFirestoreDocuments = async () => {
        try {
          const documentsCollection = collection(db, "documents");
          const querySnapshot = await getDocs(documentsCollection);
          
          console.log(`Found ${querySnapshot.size} document(s) in Firestore.`);

          if (!querySnapshot.empty) {
            const batch = writeBatch(db);
            querySnapshot.forEach(doc => {
              batch.delete(doc.ref);
            });
            await batch.commit();
            console.log("Successfully deleted all documents from Firestore.");
          }
        } catch (error: any) {
          console.error("Error connecting to or clearing Firestore:", error.message);
          if (error.code === 'permission-denied') {
              console.error("Firestore permission denied. Please check your Firestore security rules. For development, you might use 'allow read, write: if true;'.");
          } else {
              console.error("This is likely due to the Firestore database not being created or incorrect security rules. Please check your Firebase project settings.");
          }
        }
      };
      
      await clearFirestoreDocuments();

      setDocuments(mockDocuments);
      if (mockDocuments.length > 0) {
        setActiveDocument(mockDocuments[0]);
      }
      setLoading(false);
    };

    initializeApp();
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
    const storagePath = `documents/${Date.now()}_${file.name}`;
    const newDocForUi: Document = {
      id: tempId,
      name: file.name,
      type: getFileType(file),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      status: "Draft",
      storagePath: storagePath,
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
        // Step 1: Upload the actual file to Firebase Storage
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        console.log('Uploaded a file to Firebase Storage!');

        // Step 2: Save the metadata to Firestore
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
        
        setDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.id === tempId ? { ...newDocForUi, id: docRef.id } : doc
          )
        );
         setActiveDocument(prev => prev?.id === tempId ? { ...newDocForUi, id: docRef.id } : prev);


    } catch (e: any) {
        console.error("Error uploading document: ", e.message);
        // If there's an error, roll back the optimistic UI update
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
