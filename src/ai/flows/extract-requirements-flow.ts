'use server';
/**
 * @fileOverview An AI flow for extracting requirements from a document.
 *
 * - extractRequirements - A function that handles the requirement extraction process.
 * - ExtractRequirementsInput - The input type for the extractRequirements function.
 * - ExtractRequirementsOutput - The return type for the extractRequirements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const RequirementSchema = z.object({
  id: z.string().describe('A unique identifier for the requirement (e.g., REQ-001).'),
  description: z.string().describe('The full text of the requirement statement.'),
  category: z.enum(['Functional', 'Non-Functional', 'Compliance']).describe('The category of the requirement.'),
});

const ExtractRequirementsInputSchema = z.object({
  documentText: z.string().describe('The text content of the document to be analyzed.'),
});
export type ExtractRequirementsInput = z.infer<typeof ExtractRequirementsInputSchema>;

const ExtractRequirementsOutputSchema = z.object({
  requirements: z.array(RequirementSchema).describe('An array of identified requirements.'),
});
export type ExtractRequirementsOutput = z.infer<typeof ExtractRequirementsOutputSchema>;

export async function extractRequirements(input: ExtractRequirementsInput): Promise<ExtractRequirementsOutput> {
  return extractRequirementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractRequirementsPrompt',
  input: {schema: ExtractRequirementsInputSchema},
  output: {schema: ExtractRequirementsOutputSchema},
  prompt: `You are an expert system analyst. Your task is to extract all requirements from the provided document text.

Analyze the document and identify any sentences that specify a requirement. Look for keywords like "shall", "must", "should", and "will".

For each requirement you find, categorize it as one of the following:
- Functional: Describes what the system should do.
- Non-Functional: Describes how the system should perform (e.g., performance, security, reliability).
- Compliance: Describes a requirement related to a standard, law, or regulation.

Return the list of requirements in the specified JSON format.

Document Text:
{{{documentText}}}`,
});

const extractRequirementsFlow = ai.defineFlow(
  {
    name: 'extractRequirementsFlow',
    inputSchema: ExtractRequirementsInputSchema,
    outputSchema: ExtractRequirementsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
