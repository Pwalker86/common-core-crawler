import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient({
  // Adding logging for development purposes
  log: ['warn', 'error'],
});

// Define schema for question format
const QuestionSchema = z.object({
  questionText: z.string(),
  answerText: z.string(),
});

type Question = z.infer<typeof QuestionSchema>;

/**
 * Generate questions for a given standard
 * @param standardCode - The code of the standard
 * @param standardDescription - The description of the standard
 * @param numQuestions - Number of questions to generate
 * @returns Array of validated questions
 */
async function generateQuestionsForStandard(
  standardCode: string,
  standardDescription: string,
  numQuestions: number
): Promise<Question[]> {
  console.log(`Generating ${numQuestions} questions for standard ${standardCode}`);
  
  const prompt = `
  Generate ${numQuestions} unique math questions that align with the following Common Core standard:
  
  Standard Code: ${standardCode}
  Standard Description: ${standardDescription}
  
  Requirements:
  1. Create a mix of equation-based questions and word problems
  2. Ensure each question is meaningfully different from the others
  3. Include detailed answers with step-by-step solutions where appropriate
  4. Make questions grade-appropriate based on the standard
  
  Format each question and answer pair as a valid JSON object with the following structure:
  { "questionText": "...", "answerText": "..." }
  
  Return an array of these JSON objects.
  `;

  try {
    const {text} = await generateText({
      model: openai("o4-mini-2025-04-16"), // You might want to use a more powerful model
      prompt,
    });
    
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Could not extract JSON from response:', text);
      return [];
    }

    // Parse JSON and validate against schema
    try {
      const parsedQuestions = JSON.parse(jsonMatch[0]);
      const validatedQuestions: Question[] = [];
      
      for (const question of parsedQuestions) {
        try {
          const validatedQuestion = QuestionSchema.parse(question);
          validatedQuestions.push(validatedQuestion);
        } catch (validationError) {
          console.error('Question validation error:', validationError);
        }
      }
      
      return validatedQuestions;
    } catch (jsonError) {
      console.error('Error parsing JSON from response:', jsonError);
      return [];
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    return [];
  }
}

/**
 * Generate and store questions for multiple standards
 * @param standardLimit - Number of standards to process
 * @param questionsPerStandard - Number of questions to generate per standard
 */
export async function generateQuestionsForStandards(
  standardLimit: number,
  questionsPerStandard: number
): Promise<void> {
  try {
    // Get standards
    const standards = await prisma.standard.findMany({
      take: standardLimit,
      orderBy: {
        code: 'asc',
      },
    });

    console.log(`Found ${standards.length} standards. Generating questions...`);

    for (const standard of standards) {
      try {
        // Check if questions already exist for this standard
        const existingQuestionCount = await prisma.question.count({
          where: {
            standardCode: standard.code,
          },
        });

        if (existingQuestionCount > 0) {
          console.log(`Standard ${standard.code} already has ${existingQuestionCount} questions. Skipping.`);
          continue;
        }

        // Generate questions for this standard
        const questions = await generateQuestionsForStandard(
          standard.code,
          standard.description,
          questionsPerStandard
        );

        if (questions.length > 0) {
          // Use a transaction to ensure all questions are created or none are
          await prisma.$transaction(async (tx) => {
            for (const question of questions) {
              await tx.question.create({
                data: {
                  questionText: question.questionText,
                  answerText: question.answerText,
                  standardCode: standard.code,
                },
              });
            }
          });
          
          console.log(`Created ${questions.length} questions for standard ${standard.code}`);
        } else {
          console.log(`No valid questions generated for standard ${standard.code}`);
        }
      } catch (standardError) {
        console.error(`Error processing standard ${standard.code}:`, standardError);
        // Continue with next standard even if this one fails
      }
    }
  } catch (error) {
    console.error('Error in question generation process:', error);
  } finally {
    // Ensure we disconnect the Prisma client properly
    await prisma.$disconnect();
  }
}
