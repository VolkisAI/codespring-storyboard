/**
 * Support Tickets Schema
 * Defines the database structure for support ticket management
 * Includes ticket tracking, status management, and resolution details
 */

import { pgTable, text, uuid, timestamp, date, pgEnum, json } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Define issue type enum
export const issueTypeEnum = pgEnum("issue_type", [
  "forgot-cancel",      // User forgot to cancel subscription
  "no-product",         // Didn't receive the product
  "unacceptable",       // Product quality unacceptable
  "not-described",      // Product not as described
  "unauthorized",       // Unauthorized transaction
  "subscription-cancel" // Request to cancel subscription
]);

// Define ticket status enum
export const ticketStatusEnum = pgEnum("ticket_status", [
  "pending",    // Initial state, awaiting review
  "in-review",  // Being reviewed by support
  "resolved",   // Issue resolved
  "refunded",   // Refund issued
  "canceled",   // Ticket/subscription canceled
  "rejected"    // Request rejected
]);

// Support tickets table
export const supportTicketsTable = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // Clerk user ID
  userEmail: text("user_email").notNull(), // User's email address
  issueType: issueTypeEnum("issue_type").notNull(), // Type of support issue
  purchaseEmails: json("purchase_emails").$type<string[]>().notNull(), // Array of email addresses used for purchases
  transactionDate: date("transaction_date"), // Date of the transaction
  transactionAmount: text("transaction_amount"), // Transaction amount as string
  details: text("details").notNull(), // Detailed description of the issue
  status: ticketStatusEnum("status").default("pending").notNull(), // Current ticket status
  resolutionNotes: text("resolution_notes"), // Notes about resolution
  resolvedBy: text("resolved_by"), // ID of person who resolved
  resolvedAt: timestamp("resolved_at"), // When ticket was resolved
  createdAt: timestamp("created_at").defaultNow().notNull(), // Creation timestamp
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => sql`now()`), // Last update timestamp
});

// Type exports
export type InsertSupportTicket = typeof supportTicketsTable.$inferInsert;
export type SelectSupportTicket = typeof supportTicketsTable.$inferSelect; 