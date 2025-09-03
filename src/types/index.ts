import type { User } from 'firebase/auth';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xml" | "txt";
  size: string;
  projectId: string;
  createdAt: string;
  modifiedAt: string;
  status: "Draft" | "In Review" | "Approved";
  storagePath: string;
  collaborators: AppUser[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
}

export interface Requirement {
  id: string;
  description: string;
  category: "Functional" | "Non-Functional" | "Compliance";
}

export interface TestStep {
  step: number;
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id: string;
  title: string;
  requirementId: string;
  preconditions: string[];
  testSteps: TestStep[];
  testData: string[];
  type: "Positive" | "Negative" | "Edge Case";
}
