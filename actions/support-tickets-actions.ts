/**
 * Support Tickets Server Actions
 * Wraps database queries with proper error handling and path revalidation
 * Used by client components to interact with support ticket data
 */

"use server";

import { revalidatePath } from "next/cache";
import {
  createSupportTicket,
  getSupportTicketById,
  getSupportTicketsByUserId,
  getAllSupportTickets,
  updateSupportTicket,
  updateSupportTicketStatus,
  deleteSupportTicket
} from "@/db/queries/support-tickets-queries";
import { InsertSupportTicket, SelectSupportTicket } from "@/db/schema";
import { ActionResult } from "@/types/actions/actions-types";

/**
 * Create a new support ticket
 */
export async function createSupportTicketAction(
  data: InsertSupportTicket
): Promise<ActionResult<SelectSupportTicket>> {
  try {
    const ticket = await createSupportTicket(data);
    revalidatePath("/dashboard/support");
    revalidatePath("/dashboard/admin");
    
    return {
      isSuccess: true,
      message: "Support ticket created successfully",
      data: ticket
    };
  } catch (error) {
    console.error("Error in createSupportTicketAction:", error);
    return {
      isSuccess: false,
      message: "Failed to create support ticket"
    };
  }
}

/**
 * Get a support ticket by ID
 */
export async function getSupportTicketByIdAction(
  id: string
): Promise<ActionResult<SelectSupportTicket | null>> {
  try {
    const ticket = await getSupportTicketById(id);
    
    return {
      isSuccess: true,
      message: "Support ticket fetched successfully",
      data: ticket || null
    };
  } catch (error) {
    console.error("Error in getSupportTicketByIdAction:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch support ticket"
    };
  }
}

/**
 * Get all support tickets for a specific user
 */
export async function getSupportTicketsByUserIdAction(
  userId: string
): Promise<ActionResult<SelectSupportTicket[]>> {
  try {
    const tickets = await getSupportTicketsByUserId(userId);
    
    return {
      isSuccess: true,
      message: "Support tickets fetched successfully",
      data: tickets
    };
  } catch (error) {
    console.error("Error in getSupportTicketsByUserIdAction:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch support tickets"
    };
  }
}

/**
 * Get all support tickets in the system
 */
export async function getAllSupportTicketsAction(): Promise<ActionResult<SelectSupportTicket[]>> {
  try {
    const tickets = await getAllSupportTickets();
    
    return {
      isSuccess: true,
      message: "All support tickets fetched successfully",
      data: tickets
    };
  } catch (error) {
    console.error("Error in getAllSupportTicketsAction:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch all support tickets"
    };
  }
}

/**
 * Update a support ticket
 */
export async function updateSupportTicketAction(
  id: string,
  data: Partial<InsertSupportTicket>
): Promise<ActionResult<SelectSupportTicket>> {
  try {
    const ticket = await updateSupportTicket(id, data);
    revalidatePath("/dashboard/support");
    revalidatePath("/dashboard/admin");
    
    return {
      isSuccess: true,
      message: "Support ticket updated successfully",
      data: ticket
    };
  } catch (error) {
    console.error("Error in updateSupportTicketAction:", error);
    return {
      isSuccess: false,
      message: "Failed to update support ticket"
    };
  }
}

/**
 * Update support ticket status with resolution details
 */
export async function updateSupportTicketStatusAction(
  id: string,
  status: InsertSupportTicket['status'],
  resolvedBy?: string,
  resolutionNotes?: string
): Promise<ActionResult<SelectSupportTicket>> {
  try {
    const ticket = await updateSupportTicketStatus(id, status, resolvedBy, resolutionNotes);
    revalidatePath("/dashboard/support");
    revalidatePath("/dashboard/admin");
    
    return {
      isSuccess: true,
      message: "Support ticket status updated successfully",
      data: ticket
    };
  } catch (error) {
    console.error("Error in updateSupportTicketStatusAction:", error);
    return {
      isSuccess: false,
      message: "Failed to update support ticket status"
    };
  }
}

/**
 * Delete a support ticket
 */
export async function deleteSupportTicketAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    await deleteSupportTicket(id);
    revalidatePath("/dashboard/support");
    revalidatePath("/dashboard/admin");
    
    return {
      isSuccess: true,
      message: "Support ticket deleted successfully"
    };
  } catch (error) {
    console.error("Error in deleteSupportTicketAction:", error);
    return {
      isSuccess: false,
      message: "Failed to delete support ticket"
    };
  }
} 