DO $$ BEGIN
    CREATE TYPE "public"."payout_status" AS ENUM('pending', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."user_role" AS ENUM('couple', 'platform_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'couple' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"couple_names" text NOT NULL,
	"event_date" timestamp,
	"cover_image_url" text,
	"welcome_message" text,
	"theme_id" text DEFAULT 'champagne-navy' NOT NULL,
	"total_numbers" integer DEFAULT 1000 NOT NULL,
	"ticket_price_cents" integer DEFAULT 2000 NOT NULL,
	"padrinho_pin" text DEFAULT '1234' NOT NULL,
	"pix_key_type" text,
	"pix_key" text,
	"sales_status" "sales_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_prizes" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"prize_index" integer NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"amount_cents" integer NOT NULL,
	"fee_deducted_cents" integer DEFAULT 0 NOT NULL,
	"pix_key" text NOT NULL,
	"pix_key_type" text NOT NULL,
	"provider_transfer_id" text,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "draw_results" ADD COLUMN IF NOT EXISTS "event_id" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "event_id" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "fee_cents" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "raffle_numbers" ADD COLUMN IF NOT EXISTS "event_id" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "raffle_numbers" DROP CONSTRAINT IF EXISTS "raffle_numbers_pkey";
--> statement-breakpoint
ALTER TABLE "raffle_numbers" DROP CONSTRAINT IF EXISTS "raffle_numbers_event_id_id_pk";
--> statement-breakpoint
ALTER TABLE "raffle_numbers" ADD CONSTRAINT "raffle_numbers_event_id_id_pk" PRIMARY KEY("event_id","id");
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "event_prizes" ADD CONSTRAINT "event_prizes_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "payouts" ADD CONSTRAINT "payouts_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "draw_results" ADD CONSTRAINT "draw_results_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "raffle_numbers" ADD CONSTRAINT "raffle_numbers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;