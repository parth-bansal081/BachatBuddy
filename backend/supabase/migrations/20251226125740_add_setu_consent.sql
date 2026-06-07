alter table "public"."user_profiles" add column "setu_consent_id" text;
alter table "public"."user_profiles" add column "setu_consent_status" text;
alter table "public"."user_profiles" add column "setu_consent_created_at" timestamp with time zone;
