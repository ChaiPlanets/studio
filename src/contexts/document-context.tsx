
"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import type { Document, Requirement, TestCase } from '@/types';
import { db, storage } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { mockUsers } from '@/data/mock';

interface DocumentContextType {
  documents: Document[];
  loading: boolean;
  addDocument: (file: File) => Promise<void>;
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

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docsData: Document[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        docsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          modifiedAt: data.modifiedAt?.toDate().toISOString() || new Date().toISOString(),
        } as Document);
      });
      setDocuments(docsData);
      if (docsData.length > 0 && !activeDocument) {
        setActiveDocument(docsData[0]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching documents: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeDocument]);

  const addDocument = async (file: File) => {
    if (!file) throw new Error("File is required.");
  
    // 1. Upload file to Firebase Storage
    const storagePath = `documents/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // 2. Add document metadata to Firestore
    const newDoc = {
      name: file.name,
      type: getFileType(file),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      createdAt: serverTimestamp(),
      modifiedAt: serverTimestamp(),
      status: "Draft",
      storagePath: downloadURL, // Store the public URL
      collaborators: [mockUsers[0]], // Using mock user for now
      projectId: "proj-1" // Mock project ID
    };

    const docRef = await addDoc(collection(db, "documents"), newDoc);
    
    // Set the new document as active
    setActiveDocument({
        id: docRef.id,
        ...newDoc,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
    } as Document);
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
