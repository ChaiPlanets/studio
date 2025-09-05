
'use server';
/**
 * @fileOverview An AI flow for detecting and redacting Personally Identifiable Information (PII).
 *
 * - redactPii - A function that handles the PII redaction process.
 * - RedactPiiInput - The input type for the redactPii function.
 * - RedactPiiOutput - The return type for the redactPii function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PiiFindingSchema = z.object({
  finding: z.string().describe('The identified PII string.'),
  category: z.enum(['PERSON', 'LOCATION', 'ORGANIZATION', 'CONTACT', 'ID', 'OTHER']).describe('The category of the PII.'),
});

const RedactPiiInputSchema = z.object({
  documentText: z.string().describe('The text content of the document to be analyzed for PII.'),
});
export type RedactPiiInput = z.infer<typeof RedactPiiInputSchema>;

const RedactPiiOutputSchema = z.object({
  findings: z.array(PiiFindingSchema).describe('An array of PII findings.'),
  redactedText: z.string().describe('The document text with all identified PII replaced by placeholders.'),
});
export type RedactPiiOutput = z.infer<typeof RedactPiiOutputSchema>;

export async function redactPii(input: RedactPiiInput): Promise<RedactPiiOutput> {
  return redactPiiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'redactPiiPrompt',
  input: {schema: RedactPiiInputSchema},
  output: {schema: RedactPiiOutputSchema},
  prompt: `You are a highly accurate PII (Personally Identifiable Information) detection and redaction engine. Your task is to analyze the provided text and identify any data that could be used to identify an individual.

Analyze the document and identify all instances of PII. Look for:
- Names of people (PERSON)
- Physical addresses, cities, countries (LOCATION)
- Company or institution names (ORGANIZATION)
- Email addresses, phone numbers (CONTACT)
- Social security numbers, passport numbers, driver's license numbers, patient IDs (ID)
- Any other sensitive personal data (OTHER)

For each piece of PII you find, add it to the 'findings' array with its category.

Then, create a redacted version of the text where each piece of PII is replaced with a placeholder in the format '[REDACTED_{CATEGORY}]'. For example, replace a person's name with '[REDACTED_PERSON]' and an email with '[REDACTED_CONTACT]'.

Return the list of findings and the fully redacted text.

Document Text:
{{{documentText}}}`,
});

const redactPiiFlow = ai.defineFlow(
  {
    name: 'redactPiiFlow',
    inputSchema: RedactPiiInputSchema,
    outputSchema: RedactPiiOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
