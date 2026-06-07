-- Add external_id to transactions for duplicate detection
alter table "public"."transactions" add column "external_id" text;

-- Add unique constraint to prevent duplicate imports
alter table "public"."transactions" add constraint "transactions_external_id_key" unique ("external_id");

-- Add external_id to accounts too, to map bank accounts
alter table "public"."accounts" add column "external_id" text;
alter table "public"."accounts" add constraint "accounts_external_id_key" unique ("external_id");
