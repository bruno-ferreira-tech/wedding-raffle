CREATE TYPE "public"."number_status" AS ENUM('disponivel', 'reservado', 'pago');--> statement-breakpoint
CREATE TYPE "public"."order_source" AS ENUM('convidado', 'padrinho');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."sales_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TABLE "draw_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"prize_index" integer NOT NULL,
	"prize_label" text NOT NULL,
	"number_id" integer NOT NULL,
	"buyer_name" text NOT NULL,
	"drawn_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_state" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"sales_status" "sales_status" DEFAULT 'open' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"buyer_name" text NOT NULL,
	"source" "order_source" NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_cents" integer NOT NULL,
	"number_ids" integer[] NOT NULL,
	"provider" text,
	"provider_charge_id" text,
	"pix_copy_paste" text,
	"pix_qr_base64" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "raffle_numbers" (
	"id" integer PRIMARY KEY NOT NULL,
	"status" "number_status" DEFAULT 'disponivel' NOT NULL,
	"order_id" integer,
	"buyer_name" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
