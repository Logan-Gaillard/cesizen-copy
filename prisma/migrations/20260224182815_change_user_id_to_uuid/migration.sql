/*
  Warnings:

  - The primary key for the `BreathExercices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Information` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `category` to the `Information` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `Information` table without a default value. This is not possible if the table is not empty.
  - Added the required column `read_time` to the `Information` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BreathExercices" DROP CONSTRAINT "BreathExercices_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Information" DROP CONSTRAINT "Information_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_user_id_fkey";

-- AlterTable
ALTER TABLE "BreathExercices" DROP CONSTRAINT "BreathExercices_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BreathExercices_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BreathExercices_id_seq";

-- AlterTable
ALTER TABLE "Information" DROP CONSTRAINT "Information_pkey",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "image_url" TEXT NOT NULL,
ADD COLUMN     "read_time" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Information_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Information_id_seq";

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Session_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Information" ADD CONSTRAINT "Information_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreathExercices" ADD CONSTRAINT "BreathExercices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
