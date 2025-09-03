"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import type { Document, Requirement, TestCase } from '@/types';
import { mockDocuments } from '@/data/mock';

interface DocumentContextType {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id'>) => void;
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

  useEffect(() => {
    // Load mock documents on initial load
    setDocuments(mockDocuments);
    if (mockDocuments.length > 0) {
      setActiveDocument(mockDocuments[0]);
    }
  }, []);

  const addDocument = (document: Omit<Document, 'id'>) => {
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      ...document,
    };
    setDocuments((prevDocuments) => [newDocument, ...prevDocuments]);
    setActiveDocument(newDocument);
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
