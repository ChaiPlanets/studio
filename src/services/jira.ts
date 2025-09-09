
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
export async function createJiraIssue(
    testCase: TestCase, 
    projectId: string,
    jiraBaseUrl: string,
    jiraUserEmail: string,
    jiraApiToken: string
) {
  if (!jiraApiToken || !jiraUserEmail || !jiraBaseUrl) {
    throw new Error("Jira credentials are not fully provided.");
  }
  
  // Robust URL validation to prevent network errors
  try {
    const url = new URL(jiraBaseUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Invalid protocol. URL must start with http:// or https://');
    }
  } catch (error) {
    throw new JiraApiError('The provided Jira Base URL is not a valid URL.');
  }


  const url = `${jiraBaseUrl}/rest/api/3/issue`;
  
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
        'Authorization': `Basic ${Buffer.from(`${jiraUserEmail}:${jiraApiToken}`).toString('base64')}`,
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
      url: `${jiraBaseUrl}/browse/${result.key}`,
    };
  } catch (error) {
    console.error("Error in createJiraIssue:", error);
    if (error instanceof JiraApiError) {
      throw error;
    }
    // Forward the original error message for better debugging.
    if (error instanceof Error) {
       throw new Error(`An unexpected error occurred: ${error.message}`);
    }
    // Fallback for non-Error objects
    throw new Error("An unexpected and unknown error occurred while communicating with Jira.");
  }
}


// Function to get the status of an issue from Jira
export async function getJiraIssueStatus(
    issueKey: string,
    jiraBaseUrl: string,
    jiraUserEmail: string,
    jiraApiToken: string
): Promise<{ status: string }> {
    if (!jiraApiToken || !jiraUserEmail || !jiraBaseUrl) {
        throw new Error("Jira credentials are not fully provided.");
    }
    
    const url = `${jiraBaseUrl}/rest/api/3/issue/${issueKey}?fields=status`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${jiraUserEmail}:${jiraApiToken}`).toString('base64')}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Jira API Error:", errorBody);
            const errorMessage = errorBody.errorMessages?.join(', ') || `Failed to fetch issue ${issueKey}`;
            throw new JiraApiError(errorMessage, response.status);
        }

        const result = await response.json();
        const status = result.fields?.status?.name || 'Unknown';
        
        return { status };
    } catch (error) {
        console.error("Error in getJiraIssueStatus:", error);
        if (error instanceof JiraApiError) {
            throw error;
        }
        if (error instanceof Error) {
            throw new Error(`An unexpected error occurred: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while fetching Jira issue status.");
    }
}
