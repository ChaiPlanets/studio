export interface User {
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
  collaborators: User[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
}
