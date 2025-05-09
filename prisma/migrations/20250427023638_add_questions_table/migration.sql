/*
  Warnings:

  - You are about to drop the column `answer_text` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `question_text` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `standardId` on the `Question` table. All the data in the column will be lost.
  - Added the required column `answerText` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionText` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `standardCode` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionText" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "standardCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Question_standardCode_fkey" FOREIGN KEY ("standardCode") REFERENCES "Standard" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
