"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import type { Document, Requirement, TestCase } from '@/types';
import { mockDocuments } from '@/data/mock';

interface DocumentContextType {
  documents: Document[];
  addDocument: (document: Document) => void;
  activeDocument: Document | null;
  setActiveDocument: Dispatch<SetStateAction<Document | null>>;
  requirements: Requirement[];
  setRequirements: Dispatch<SetStateAction<Requirement[]>>;
  testCases: TestCase[];
  setTestCases: Dispatch<SetStateAction<TestCase[]>>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [activeDocument, setActiveDocument] = useState<Document | null>(mockDocuments[0] || null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);


  const addDocument = (document: Document) => {
    setDocuments((prevDocuments) => [document, ...prevDocuments]);
    setActiveDocument(document);
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
