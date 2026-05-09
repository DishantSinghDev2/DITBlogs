-- Allow one user to own multiple organizations by dropping the unique constraint on ownerId
DROP INDEX IF EXISTS "Organization_ownerId_key";
