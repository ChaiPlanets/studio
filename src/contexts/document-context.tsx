"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Document } from '@/types';
import { mockDocuments } from '@/data/mock';

interface DocumentContextType {
  documents: Document[];
  addDocument: (document: Document) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  const addDocument = (document: Document) => {
    setDocuments((prevDocuments) => [document, ...prevDocuments]);
  };

  return (
    <DocumentContext.Provider value={{ documents, addDocument }}>
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
