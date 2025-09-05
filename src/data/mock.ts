
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
    name: "Clinical_Trial_Protocol.pdf",
    type: "pdf",
    size: "1.8 MB",
    projectId: "proj-health-1",
    createdAt: "2023-11-01T10:00:00Z",
    modifiedAt: "2023-11-02T14:30:00Z",
    status: "Approved",
    storagePath: "/documents/Clinical_Trial_Protocol.pdf",
    collaborators: [mockUsers[0], mockUsers[1]],
  },
  {
    id: "doc-2",
    name: "Patient_Data_Privacy_Policy.docx",
    type: "docx",
    size: "750 KB",
    projectId: "proj-health-1",
    createdAt: "2023-10-27T15:20:00Z",
    modifiedAt: "2023-10-28T09:00:00Z",
    status: "In Review",
    storagePath: "/documents/Patient_Data_Privacy_Policy.docx",
    collaborators: [mockUsers[0], mockUsers[2]],
  },
  {
    id: "doc-3",
    name: "FDA_Submission_Checklist.xml",
    type: "xml",
    size: "300 KB",
    projectId: "proj-health-2",
    createdAt: "2023-10-26T11:45:00Z",
    modifiedAt: "2023-10-26T11:45:00Z",
    status: "Draft",
    storagePath: "/documents/FDA_Submission_Checklist.xml",
    collaborators: [mockUsers[1]],
  },
  {
    id: "doc-4",
    name: "System_Architecture_Diagram.pdf",
    type: "pdf",
    size: "4.2 MB",
    projectId: "proj-health-1",
    createdAt: "2023-10-25T16:00:00Z",
    modifiedAt: "2023-10-25T16:05:00Z",
    status: "Approved",
    storagePath: "/documents/System_Architecture_Diagram.pdf",
    collaborators: [mockUsers[0], mockUsers[1], mockUsers[2]],
  },
  {
    id: "doc-5",
    name: "HIPAA_Compliance_Checklist.docx",
    type: "docx",
    size: "250 KB",
    projectId: "proj-health-2",
    createdAt: "2023-10-24T09:00:00Z",
    modifiedAt: "2023-10-26T14:20:00Z",
    status: "In Review",
    storagePath: "/documents/HIPAA_Compliance_Checklist.docx",
    collaborators: [mockUsers[0], mockUsers[1]],
  },
];

export const mockDocumentText = `
System Requirements Specification for a Patient Portal Application

1. Introduction
This document outlines the functional and non-functional requirements for the "HealthLink" Patient Portal. The system will provide patients with secure access to their medical records, appointment scheduling, and communication with healthcare providers. The system must adhere to HIPAA regulations to ensure patient data privacy and security.

2. Functional Requirements
2.1. User Authentication and Authorization
2.1.1. The system shall require users to complete a multi-factor authentication process upon registration and login to ensure secure access.
2.1.2. The system must differentiate between patient and provider roles, granting appropriate access levels to medical records and system features.
2.1.3. Patients shall be able to view their personal information, medical history, lab results, and upcoming appointments.

2.2. Appointment Management
2.2.1. The system will allow patients to schedule, reschedule, and cancel appointments with their healthcare providers.
2.2.2. The system shall send automated reminders for upcoming appointments via email or SMS.
2.2.3. The system must display provider availability in real-time.

2.3. Secure Messaging
2.3.1. The system shall provide a secure messaging portal for patients to communicate with their healthcare providers.
2.3.2. All messages must be encrypted both in transit and at rest.

3. Non-Functional Requirements
3.1. Performance
3.1.1. The system should load patient dashboards and medical records within 3 seconds.
3.1.2. The system must support at least 500 concurrent users without performance degradation.

3.2. Security
3.2.1. The system will implement end-to-end encryption for all data transmissions.
3.2.2. The system shall maintain a comprehensive audit trail of all actions performed by users.

4. Compliance Requirements
4.1. The system must be fully compliant with the Health Insurance Portability and Accountability Act (HIPAA).
4.2. The system must adhere to the General Data Protection Regulation (GDPR) for handling data of EU citizens.
`;
