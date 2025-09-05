
'use server';

import type { TestCase } from "@/types";

// Basic error class for Jira API issues
class JiraApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'JiraApiError';
  }
}

// Function to create an issue in Jira
export async function createJiraIssue(testCase: TestCase, projectId: string) {
  const { JIRA_API_TOKEN, JIRA_USER_EMAIL, JIRA_BASE_URL } = process.env;

  if (!JIRA_API_TOKEN || !JIRA_USER_EMAIL || !JIRA_BASE_URL) {
    throw new Error("Jira environment variables are not configured.");
  }

  const url = `${JIRA_BASE_URL}/rest/api/3/issue`;
  
  // Format the test case data into a structure Jira understands.
  // This is a basic example; you can customize it further.
  const bodyData = {
    fields: {
      project: {
        key: projectId,
      },
      summary: `[TC] ${testCase.title}`,
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Test case for requirement: ${testCase.requirementId}`,
              },
            ],
          },
           {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Test Steps:",
              },
            ],
          },
          {
            type: "orderedList",
            content: testCase.testSteps.map(step => ({
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                     { type: "text", text: `${step.action} -> `, marks: [{ type: "strong" }] },
                     { type: "text", text: step.expectedResult }
                  ]
                }
              ]
            }))
          }
        ],
      },
      issuetype: {
        // NOTE: 'Task' is a common default. Change if you use a custom issue type for tests.
        name: "Task", 
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Jira API Error:", errorBody);
      const errorMessage = errorBody.errorMessages?.join(', ') || 'Failed to create Jira issue';
      throw new JiraApiError(errorMessage, response.status);
    }

    const result = await response.json();
    return {
      id: result.id,
      key: result.key,
      url: `${JIRA_BASE_URL}/browse/${result.key}`,
    };
  } catch (error) {
    console.error("Error in createJiraIssue:", error);
    if (error instanceof JiraApiError) {
      throw error;
    }
    throw new Error("An unexpected error occurred while communicating with Jira.");
  }
}
