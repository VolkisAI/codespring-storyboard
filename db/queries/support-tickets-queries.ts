/**
 * Support Tickets Database Queries
 * Handles all database operations for support ticket management
 * Includes CRUD operations with proper error handling
 */

import { db } from "@/db/db";
import { supportTicketsTable, InsertSupportTicket, SelectSupportTicket } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Create a new support ticket
 * @param data - Support ticket data to insert
 * @returns The created support ticket
 */
export async function createSupportTicket(data: InsertSupportTicket): Promise<SelectSupportTicket> {
  try {
    const [ticket] = await db
      .insert(supportTicketsTable)
      .values(data)
      .returning();
    
    return ticket;
  } catch (error) {
    console.error("Error creating support ticket:", error);
    throw new Error("Failed to create support ticket");
  }
}

/**
 * Get a support ticket by ID
 * @param id - The ticket ID
 * @returns The support ticket or undefined if not found
 */
export async function getSupportTicketById(id: string): Promise<SelectSupportTicket | undefined> {
  try {
    const [ticket] = await db
      .select()
      .from(supportTicketsTable)
      .where(eq(supportTicketsTable.id, id));
    
    return ticket;
  } catch (error) {
    console.error("Error fetching support ticket:", error);
    throw new Error("Failed to fetch support ticket");
  }
}

/**
 * Get all support tickets for a specific user
 * @param userId - The user's Clerk ID
 * @returns Array of support tickets ordered by creation date (newest first)
 */
export async function getSupportTicketsByUserId(userId: string): Promise<SelectSupportTicket[]> {
  try {
    const tickets = await db
      .select()
      .from(supportTicketsTable)
      .where(eq(supportTicketsTable.userId, userId))
      .orderBy(desc(supportTicketsTable.createdAt));
    
    return tickets;
  } catch (error) {
    console.error("Error fetching user support tickets:", error);
    throw new Error("Failed to fetch user support tickets");
  }
}

/**
 * Get all support tickets in the system
 * @returns Array of all support tickets ordered by creation date (newest first)
 */
export async function getAllSupportTickets(): Promise<SelectSupportTicket[]> {
  try {
    const tickets = await db
      .select()
      .from(supportTicketsTable)
      .orderBy(desc(supportTicketsTable.createdAt));
    
    return tickets;
  } catch (error) {
    console.error("Error fetching all support tickets:", error);
    throw new Error("Failed to fetch all support tickets");
  }
}

/**
 * Update a support ticket
 * @param id - The ticket ID
 * @param data - Partial ticket data to update
 * @returns The updated support ticket
 */
export async function updateSupportTicket(
  id: string,
  data: Partial<InsertSupportTicket>
): Promise<SelectSupportTicket> {
  try {
    const [ticket] = await db
      .update(supportTicketsTable)
      .set(data)
      .where(eq(supportTicketsTable.id, id))
      .returning();
    
    return ticket;
  } catch (error) {
    console.error("Error updating support ticket:", error);
    throw new Error("Failed to update support ticket");
  }
}

/**
 * Update support ticket status with resolution details
 * @param id - The ticket ID
 * @param status - New status
 * @param resolvedBy - ID of person resolving (optional)
 * @param resolutionNotes - Notes about resolution (optional)
 * @returns The updated support ticket
 */
export async function updateSupportTicketStatus(
  id: string,
  status: InsertSupportTicket['status'],
  resolvedBy?: string,
  resolutionNotes?: string
): Promise<SelectSupportTicket> {
  try {
    const updateData: Partial<InsertSupportTicket> = { status };
    
    // Auto-set resolution timestamp for resolved statuses
    if (status && ["resolved", "refunded", "canceled", "rejected"].includes(status)) {
      updateData.resolvedAt = new Date();
      if (resolvedBy) updateData.resolvedBy = resolvedBy;
      if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    }
    
    const [ticket] = await db
      .update(supportTicketsTable)
      .set(updateData)
      .where(eq(supportTicketsTable.id, id))
      .returning();
    
    return ticket;
  } catch (error) {
    console.error("Error updating support ticket status:", error);
    throw new Error("Failed to update support ticket status");
  }
}

/**
 * Delete a support ticket
 * @param id - The ticket ID
 */
export async function deleteSupportTicket(id: string): Promise<void> {
  try {
    await db
      .delete(supportTicketsTable)
      .where(eq(supportTicketsTable.id, id));
  } catch (error) {
    console.error("Error deleting support ticket:", error);
    throw new Error("Failed to delete support ticket");
  }
} 