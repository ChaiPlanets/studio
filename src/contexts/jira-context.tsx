
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { JiraCredentials } from '@/types';

interface JiraContextType {
  credentials: JiraCredentials | null;
  isConfigured: boolean;
  isDialogOpen: boolean;
  saveCredentials: (creds: JiraCredentials) => void;
  openDialog: () => void;
  closeDialog: () => void;
}

const JiraContext = createContext<JiraContextType | undefined>(undefined);

// A simple check to ensure we are in a browser environment before accessing localStorage
const isBrowser = typeof window !== 'undefined';

export function JiraProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<JiraCredentials | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isBrowser) {
      try {
        const storedCreds = localStorage.getItem('jiraCredentials');
        if (storedCreds) {
          setCredentials(JSON.parse(storedCreds));
        }
      } catch (error) {
        console.error("Failed to parse Jira credentials from localStorage", error);
        localStorage.removeItem('jiraCredentials');
      }
    }
  }, []);

  const saveCredentials = useCallback((creds: JiraCredentials) => {
    if (isBrowser) {
        setCredentials(creds);
        localStorage.setItem('jiraCredentials', JSON.stringify(creds));
        setIsDialogOpen(false); // Close dialog on save
    }
  }, []);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);
  
  const isConfigured = !!credentials && !!credentials.baseUrl && !!credentials.email && !!credentials.apiToken && !!credentials.projectKey;

  return (
    <JiraContext.Provider value={{ 
      credentials,
      isConfigured,
      isDialogOpen,
      saveCredentials,
      openDialog,
      closeDialog
    }}>
      {children}
    </JiraContext.Provider>
  );
}

export function useJira() {
  const context = useContext(JiraContext);
  if (context === undefined) {
    throw new Error('useJira must be used within a JiraProvider');
  }
  return context;
}
