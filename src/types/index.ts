
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

export const complianceStandards = [
  "FDA",
  "IEC 62304",
  "ISO 9001",
  "ISO 13485",
  "ISO 27001",
  "GDPR",
] as const;

export type ComplianceStandard = (typeof complianceStandards)[number];

export interface TestCase {
  id: string;
  title: string;
  requirementId: string;
  preconditions: string[];
  testSteps: TestStep[];
  testData: string[];
  type: "Positive" | "Negative" | "Edge Case";
  compliance: ComplianceStandard[];
}
