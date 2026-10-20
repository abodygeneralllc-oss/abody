-- CreateEnum
CREATE TYPE "HeroStyle" AS ENUM ('NAVY', 'LIGHT', 'PHOTO');

-- CreateEnum
CREATE TYPE "HeroPhoto" AS ENUM ('BROWSING', 'TEAM', 'LAPTOP');

-- AlterTable
ALTER TABLE "SiteContent" ADD COLUMN     "heroPhoto" "HeroPhoto" NOT NULL DEFAULT 'BROWSING',
ADD COLUMN     "heroStyle" "HeroStyle" NOT NULL DEFAULT 'NAVY';
