-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question_text" TEXT NOT NULL,
    "answer_text" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Question_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "Standard" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);
