-- Add UserId column to Images table
ALTER TABLE "Images" ADD COLUMN IF NOT EXISTS "UserId" TEXT NOT NULL DEFAULT '';
