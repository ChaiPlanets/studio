'use server';
/**
 * @fileOverview An AI flow for answering questions about a document.
 *
 * - answerDocumentQuestion - A function that handles the document Q&A process.
 * - DocumentQaInput - The input type for the answerDocumentQuestion function.
 * - DocumentQaOutput - The return type for the answerDocumentQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DocumentQaInputSchema = z.object({
  documentText: z.string().describe('The full text content of the document to be queried.'),
  query: z.string().describe('The user\'s question about the document.'),
});
export type DocumentQaInput = z.infer<typeof DocumentQaInputSchema>;

const DocumentQaOutputSchema = z.object({
  answer: z.string().describe('The generated answer to the user\'s question.'),
});
export type DocumentQaOutput = z.infer<typeof DocumentQaOutputSchema>;

export async function answerDocumentQuestion(input: DocumentQaInput): Promise<DocumentQaOutput> {
  return documentQaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'documentQaPrompt',
  input: { schema: DocumentQaInputSchema },
  output: { schema: DocumentQaOutputSchema },
  prompt: `You are an expert document analysis assistant. Your task is to answer a user's question based *only* on the provided document text.

If the answer is not found in the document, you must state that the information is not available in the provided text. Do not use any external knowledge.

Analyze the following document context to answer the user's query.

--- DOCUMENT CONTEXT ---
{{{documentText}}}
--- END DOCUMENT CONTEXT ---

User's Question: {{{query}}}
`,
});

const documentQaFlow = ai.defineFlow(
  {
    name: 'documentQaFlow',
    inputSchema: DocumentQaInputSchema,
    outputSchema: DocumentQaOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
