
'use server';
/**
 * @fileOverview An AI flow for logging test cases to Jira.
 *
 * - logTestCaseToJira - A function that handles logging a test case to Jira.
 * - LogTestCaseToJiraInput - The input type for the logTestCaseToJira function.
 * - LogTestCaseToJiraOutput - The return type for the logTestCaseToJira function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createJiraIssue } from '@/services/jira';
import type { TestCase } from '@/types';

// We don't need a full TestCase schema here, just what's necessary for the flow.
const LogTestCaseToJiraInputSchema = z.object({
  testCase: z.any().describe("The test case object to be logged."),
  jiraProjectKey: z.string().describe("The Jira Project Key (e.g., 'PROJ')."),
});
export type LogTestCaseToJiraInput = z.infer<typeof LogTestCaseToJiraInputSchema>;

const LogTestCaseToJiraOutputSchema = z.object({
  jiraId: z.string().describe("The ID of the created Jira issue."),
  jiraKey: z.string().describe("The key of the created Jira issue (e.g., 'PROJ-123')."),
  jiraUrl: z.string().describe("The full URL to the created Jira issue."),
});
export type LogTestCaseToJiraOutput = z.infer<typeof LogTestCaseToJiraOutputSchema>;


export async function logTestCaseToJira(input: LogTestCaseToJiraInput): Promise<LogTestCaseToJiraOutput> {
  return logToJiraFlow(input);
}

const logToJiraFlow = ai.defineFlow(
  {
    name: 'logToJiraFlow',
    inputSchema: LogTestCaseToJiraInputSchema,
    outputSchema: LogTestCaseToJiraOutputSchema,
  },
  async ({ testCase, jiraProjectKey }) => {
    // This flow doesn't need an LLM. It acts as a secure backend wrapper
    // for the Jira service.
    
    console.log(`Logging test case ${testCase.id} to Jira project ${jiraProjectKey}`);

    const result = await createJiraIssue(testCase as TestCase, jiraProjectKey);
    
    return {
      jiraId: result.id,
      jiraKey: result.key,
      jiraUrl: result.url,
    };
  }
);
