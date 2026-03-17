-- CreateTable
CREATE TABLE "AdminRole" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("userId")
);

-- Seed initial admin
INSERT INTO "AdminRole" ("userId", "email") VALUES ('ceddf13a-2c95-4169-aff9-dc23c5102386', 'devel.jjub@gmail.com');
