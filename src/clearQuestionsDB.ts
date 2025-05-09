import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});


async function clearQuestionData() {
  try {
    // Clear all data from the database
    await prisma.question.deleteMany();
    console.log("Database cleared successfully.");
  } catch (error) {
    console.error("Error clearing the database:", error);
  } finally {
    // Ensure we disconnect the Prisma client properly
    await prisma.$disconnect();
  }
}

clearQuestionData().catch((error) => {
  console.error("Error in clearDatabase function:", error);
  process.exit(1);
});

