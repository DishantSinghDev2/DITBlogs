/*
  Warnings:

  - You are about to drop the column `featured` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `readingTime` on the `Post` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,organizationId]` on the table `Newsletter` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_organizationId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "featured",
DROP COLUMN "published",
DROP COLUMN "readingTime";

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "postId" TEXT,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DraftToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DraftToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Draft_authorId_idx" ON "Draft"("authorId");

-- CreateIndex
CREATE INDEX "Draft_postId_idx" ON "Draft"("postId");

-- CreateIndex
CREATE INDEX "_DraftToTag_B_index" ON "_DraftToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_email_organizationId_key" ON "Newsletter"("email", "organizationId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DraftToTag" ADD CONSTRAINT "_DraftToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Draft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DraftToTag" ADD CONSTRAINT "_DraftToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
