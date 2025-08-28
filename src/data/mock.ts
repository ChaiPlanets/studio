import type { User, Document } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    avatarUrl: "https://picsum.photos/seed/user1/100",
  },
  {
    id: "user-2",
    name: "Bob Williams",
    email: "bob@example.com",
    avatarUrl: "https://picsum.photos/seed/user2/100",
  },
  {
    id: "user-3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    avatarUrl: "https://picsum.photos/seed/user3/100",
  },
];

export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "Q4_Financial_Report.docx",
    type: "docx",
    size: "2.5 MB",
    projectId: "proj-1",
    createdAt: "2023-10-28T10:00:00Z",
    modifiedAt: "2023-10-28T12:30:00Z",
    status: "Approved",
    storagePath: "/documents/Q4_Financial_Report.docx",
    collaborators: [mockUsers[0], mockUsers[1]],
  },
  {
    id: "doc-2",
    name: "Project_Proposal_V2.pdf",
    type: "pdf",
    size: "1.2 MB",
    projectId: "proj-1",
    createdAt: "2023-10-27T15:20:00Z",
    modifiedAt: "2023-10-28T09:00:00Z",
    status: "In Review",
    storagePath: "/documents/Project_Proposal_V2.pdf",
    collaborators: [mockUsers[0], mockUsers[2]],
  },
  {
    id: "doc-3",
    name: "User_Feedback_Data.xml",
    type: "xml",
    size: "850 KB",
    projectId: "proj-2",
    createdAt: "2023-10-26T11:45:00Z",
    modifiedAt: "2023-10-26T11:45:00Z",
    status: "Draft",
    storagePath: "/documents/User_Feedback_Data.xml",
    collaborators: [mockUsers[1]],
  },
    {
    id: "doc-4",
    name: "Meeting_Notes_Oct25.txt",
    type: "txt",
    size: "15 KB",
    projectId: "proj-1",
    createdAt: "2023-10-25T16:00:00Z",
    modifiedAt: "2023-10-25T16:05:00Z",
    status: "Draft",
    storagePath: "/documents/Meeting_Notes_Oct25.txt",
    collaborators: [mockUsers[0], mockUsers[1], mockUsers[2]],
  },
  {
    id: "doc-5",
    name: "Marketing_Campaign_Brief.pdf",
    type: "pdf",
    size: "3.1 MB",
    projectId: "proj-2",
    createdAt: "2023-10-24T09:00:00Z",
    modifiedAt: "2023-10-26T14:20:00Z",
    status: "Approved",
    storagePath: "/documents/Marketing_Campaign_Brief.pdf",
    collaborators: [mockUsers[0], mockUsers[1]],
  },
];

export const mockDocumentText = `
System Requirements Specification for Fireflow Document Management System

1. Introduction
This document outlines the functional and non-functional requirements for the Fireflow Document Management System.

2. Functional Requirements
2.1. User Authentication
2.1.1. The system shall allow users to register with an email and password.
2.1.2. The system must provide a login mechanism for registered users.
2.1.3. The system should support password recovery.

2.2. Document Handling
2.2.1. The system will allow users to upload documents in PDF, DOCX, and TXT formats.
2.2.2. Users shall be able to view a list of their uploaded documents.
2.2.3. The system must provide a document previewer.

3. Non-Functional Requirements
3.1. Performance
3.1.1. The system should load the main dashboard in under 2 seconds.
3.1.2. Document uploads must complete within 30 seconds for files up to 10MB.

3.2. Security
3.2.1. All user passwords shall be stored in a securely hashed format.
3.2.2. The system will use HTTPS for all communication.

4. Compliance Requirements
4.1. The system must be GDPR compliant regarding user data.
`;
