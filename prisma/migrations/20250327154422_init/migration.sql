-- CreateTable
CREATE TABLE "Standard" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
