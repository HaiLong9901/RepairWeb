-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" SERIAL NOT NULL,
    "assignOrderInterval" INTEGER NOT NULL DEFAULT 5,
    "distanceToAssignOrder" INTEGER NOT NULL DEFAULT 5,
    "switchRepairmanStatusPeriod" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);
