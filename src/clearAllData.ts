import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});


async function clearAllData() {
  try {
    // Clear all data from the database
    await prisma.question.deleteMany();
    await prisma.standard.deleteMany();
    console.log("Database cleared successfully.");
  } catch (error) {
    console.error("Error clearing the database:", error);
  } finally {
    // Ensure we disconnect the Prisma client properly
    await prisma.$disconnect();
  }
}

clearAllData().catch((error) => {
  console.error("Error in clearDatabase function:", error);
  process.exit(1);
});
