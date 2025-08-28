'use server';
/**
 * @fileOverview An AI flow for generating test cases from software requirements.
 *
 * - generateTestCases - A function that handles the test case generation process.
 * - GenerateTestCasesInput - The input type for the generateTestCases function.
 * - GenerateTestCasesOutput - The return type for the generateTestCases function.
 */

import { ai } from '@/ai/genkit';
import { Requirement } from '@/types';
import { z } from 'zod';

const RequirementSchema = z.object({
  id: z.string(),
  description: z.string(),
  category: z.enum(['Functional', 'Non-Functional', 'Compliance']),
});

const TestCaseSchema = z.object({
  id: z.string().describe('A unique identifier for the test case (e.g., TC-001).'),
  title: z.string().describe('A concise and descriptive title for the test case.'),
  requirementId: z.string().describe('The ID of the requirement this test case is verifying.'),
  preconditions: z.array(z.string()).describe('A list of conditions that must be met before executing the test.'),
  testSteps: z.array(z.object({
    step: z.number().describe('The step number.'),
    action: z.string().describe('The action to be performed by the tester.'),
    expectedResult: z.string().describe('The expected outcome of the action.'),
  })).describe('A sequence of steps to execute the test.'),
  testData: z.array(z.string()).describe('A list of specific data required to perform the test.'),
  type: z.enum(['Positive', 'Negative', 'Edge Case']).describe('The type of test case.'),
});

const GenerateTestCasesInputSchema = z.object({
  requirements: z.array(RequirementSchema).describe('The list of requirements to generate test cases for.'),
});
export type GenerateTestCasesInput = z.infer<typeof GenerateTestCasesInputSchema>;

const GenerateTestCasesOutputSchema = z.object({
  testCases: z.array(TestCaseSchema).describe('An array of generated test cases.'),
});
export type GenerateTestCasesOutput = z.infer<typeof GenerateTestCasesOutputSchema>;

export async function generateTestCases(input: GenerateTestCasesInput): Promise<GenerateTestCasesOutput> {
  return generateTestCasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestCasesPrompt',
  input: { schema: GenerateTestCasesInputSchema },
  output: { schema: GenerateTestCasesOutputSchema },
  prompt: `You are a world-class Software Quality Assurance Engineer specializing in testing software for healthcare and medical devices. Your task is to generate a comprehensive set of test cases based on the provided software requirements.

For each requirement, create multiple test cases, including:
- **Positive scenarios:** to verify the requirement works as expected with valid inputs.
- **Negative scenarios:** to verify the system handles invalid inputs and error conditions gracefully.
- **Edge cases:** to test the boundaries and limitations of the system.

Each test case must follow this structured template:
- **id**: A unique ID (e.g., TC-REQ-001-01).
- **title**: A descriptive title.
- **requirementId**: The ID of the source requirement.
- **preconditions**: Conditions that must be true before the test.
- **testSteps**: A list of objects with 'step', 'action', and 'expectedResult'.
- **testData**: Specific data needed for the test.
- **type**: 'Positive', 'Negative', or 'Edge Case'.

Generate the test cases for the following requirements:
{{#each requirements}}
---
Requirement ID: {{id}}
Description: {{description}}
Category: {{category}}
---
{{/each}}
`,
});

const generateTestCasesFlow = ai.defineFlow(
  {
    name: 'generateTestCasesFlow',
    inputSchema: GenerateTestCasesInputSchema,
    outputSchema: GenerateTestCasesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
