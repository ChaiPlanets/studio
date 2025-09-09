
'use server';
/**
 * @fileOverview An AI flow for getting the status of a Jira issue.
 *
 * - getJiraStatus - A function that handles fetching a Jira issue's status.
 * - GetJiraStatusInput - The input type for the getJiraStatus function.
 * - GetJiraStatusOutput - The return type for the getJiraStatus function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getJiraIssueStatus } from '@/services/jira';

const GetJiraStatusInputSchema = z.object({
  issueKey: z.string().describe("The Jira issue key (e.g., 'PROJ-123')."),
  jiraBaseUrl: z.string().describe("The base URL of the Jira instance."),
  jiraUserEmail: z.string().describe("The user's email for Jira authentication."),
  jiraApiToken: z.string().describe("The user's API token for Jira authentication."),
});
export type GetJiraStatusInput = z.infer<typeof GetJiraStatusInputSchema>;

const GetJiraStatusOutputSchema = z.object({
  status: z.string().describe("The current status of the Jira issue."),
});
export type GetJiraStatusOutput = z.infer<typeof GetJiraStatusOutputSchema>;


export async function getJiraStatus(input: GetJiraStatusInput): Promise<GetJiraStatusOutput> {
  return getJiraStatusFlow(input);
}

const getJiraStatusFlow = ai.defineFlow(
  {
    name: 'getJiraStatusFlow',
    inputSchema: GetJiraStatusInputSchema,
    outputSchema: GetJiraStatusOutputSchema,
  },
  async ({ issueKey, jiraBaseUrl, jiraUserEmail, jiraApiToken }) => {
    // This flow acts as a secure backend wrapper for the Jira service.
    const result = await getJiraIssueStatus(
        issueKey,
        jiraBaseUrl,
        jiraUserEmail,
        jiraApiToken
    );
    
    return {
      status: result.status,
    };
  }
);
