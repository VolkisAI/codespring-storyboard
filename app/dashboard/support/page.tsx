/**
 * Support Page Server Component
 * Handles authentication and fetches user's support tickets
 * Passes data to client component for interactive UI
 */

import { currentUser } from "@clerk/nextjs/server";
import { getSupportTicketsByUserIdAction } from "@/actions/support-tickets-actions";
import SupportPageClient from "./support-page-client";

export default async function SupportPage() {
  // Get current user from Clerk
  const user = await currentUser();

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Please log in to access support.</p>
      </div>
    );
  }

  // Fetch user's support tickets
  const ticketsResult = await getSupportTicketsByUserIdAction(user.id);
  
  // Handle error states by returning empty array
  const tickets = ticketsResult.isSuccess && ticketsResult.data ? ticketsResult.data : [];

  // Pass tickets to client component
  return <SupportPageClient tickets={tickets} />;
} 