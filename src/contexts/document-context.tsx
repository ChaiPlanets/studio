"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import type { Document, Requirement, TestCase } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

interface DocumentContextType {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id'>) => Promise<void>;
  activeDocument: Document | null;
  setActiveDocument: Dispatch<SetStateAction<Document | null>>;
  requirements: Requirement[];
  setRequirements: Dispatch<SetStateAction<Requirement[]>>;
  testCases: TestCase[];
  setTestCases: Dispatch<SetStateAction<TestCase[]>>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
        setDocuments(fetchedDocs);
        if (fetchedDocs.length > 0) {
          setActiveDocument(fetchedDocs[0]);
        }
      } catch (error) {
        console.error("Error fetching documents: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const addDocument = async (document: Omit<Document, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'documents'), document);
      const newDocument = { id: docRef.id, ...document };
      setDocuments((prevDocuments) => [newDocument as Document, ...prevDocuments]);
      setActiveDocument(newDocument as Document);
    } catch (error) {
      console.error("Error adding document to Firestore: ", error);
    }
  };


  return (
    <DocumentContext.Provider value={{ 
      documents, 
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
