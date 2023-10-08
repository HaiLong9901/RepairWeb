-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "imageUrl" TEXT,
    "role" INTEGER NOT NULL,
    "gender" BOOLEAN NOT NULL DEFAULT true,
    "status" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_accountName_key" ON "User"("accountName");
