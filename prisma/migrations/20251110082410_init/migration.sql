-- CreateTable
CREATE TABLE "ScrapedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT,
    "content" TEXT,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WorkerStatus" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "lastRun" DATETIME NOT NULL,
    "error" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrapedItem_url_key" ON "ScrapedItem"("url");
