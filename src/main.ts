// For more information, see https://crawlee.dev/
import { CheerioCrawler } from "crawlee";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

import { router } from "./routes.js";
import { generateQuestionsForStandards } from "./questionGenerator.js";

const startUrls = ["https://www.education.com/common-core/"];

// Initialize a single PrismaClient instance for the application
const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// Command line arguments for question generation
const args = process.argv.slice(2);
const shouldGenerateQuestions = args.includes('--generate-questions');
const standardsLimitArg = args.find(arg => arg.startsWith('--standards-limit='));
const questionsPerStandardArg = args.find(arg => arg.startsWith('--questions-per-standard='));

// Default values
const standardsLimit = standardsLimitArg 
  ? parseInt(standardsLimitArg.split('=')[1], 10) 
  : 5;
const questionsPerStandard = questionsPerStandardArg 
  ? parseInt(questionsPerStandardArg.split('=')[1], 10) 
  : 3;

async function runCrawler() {
  const crawler = new CheerioCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
    // Comment this option to scrape the full website.
    maxRequestsPerCrawl: 20,
  });

  try {
    await crawler.run(startUrls);
  } catch (error) {
    console.error('Error during crawler execution:', error);
  }
}

// Usage - tsx main.ts --generate-questions --standards-limit=5 --questions-per-standard=3
// --generate-questions is optional
// --standards-limit and --questions-per-standard are optional
// Default values are 5 and 3 respectively
//
async function main() {
  try {
    if (shouldGenerateQuestions) {
      console.log(`Generating questions for ${standardsLimit} standards, ${questionsPerStandard} questions per standard`);
      await generateQuestionsForStandards(standardsLimit, questionsPerStandard);
    } else {
      await runCrawler();
    }
  } catch (error) {
    console.error('Error in main process:', error);
  } finally {
    // Properly disconnect the Prisma client to ensure all transactions are committed
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

// Make sure errors don't get swallowed
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Perform proper shutdown
  prisma.$disconnect().then(() => process.exit(1));
});

// Run the main function
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    return prisma.$disconnect();
  })
  .then(() => {
    console.log('Application shutdown complete.');
  });
