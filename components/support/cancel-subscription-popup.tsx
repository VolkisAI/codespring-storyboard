/**
 * Cancel Subscription Popup Component
 * Handles subscription cancellation requests
 * Creates support tickets for cancellation processing
 */

"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { createSupportTicketAction } from "@/actions/support-tickets-actions";
import { InsertSupportTicket } from "@/db/schema";
import { useToast } from "@/components/ui/use-toast";

interface CancelSubscriptionPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CancelSubscriptionPopup({ isOpen, onOpenChange }: CancelSubscriptionPopupProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [cancellationReason, setCancellationReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmUnderstand, setConfirmUnderstand] = useState(false);

  // Cancellation reason options
  const cancellationReasons = [
    { value: "too-expensive", label: "Too expensive" },
    { value: "not-using", label: "Not using the service" },
    { value: "found-alternative", label: "Found a better alternative" },
    { value: "missing-features", label: "Missing features I need" },
    { value: "technical-issues", label: "Technical issues" },
    { value: "other", label: "Other reason" },
  ];

  // Reset form
  const resetForm = () => {
    setCancellationReason("");
    setFeedback("");
    setConfirmUnderstand(false);
    setShowSuccess(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to cancel your subscription",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!cancellationReason) {
      toast({
        title: "Error",
        description: "Please select a reason for cancellation",
        variant: "destructive",
      });
      return;
    }

    if (!confirmUnderstand) {
      toast({
        title: "Error",
        description: "Please confirm that you understand the cancellation terms",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create cancellation details
      const cancellationDetails = `
Cancellation Reason: ${cancellationReasons.find(r => r.value === cancellationReason)?.label}
${feedback ? `\nAdditional Feedback: ${feedback}` : ''}

User has confirmed they understand:
- Access will be revoked immediately
- No partial refunds for current billing period
- All data may be deleted after cancellation
      `.trim();

      // Create support ticket
      const ticketData: InsertSupportTicket = {
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress || "",
        issueType: "subscription-cancel",
        purchaseEmails: [user.primaryEmailAddress?.emailAddress || ""],
        details: cancellationDetails,
        status: "pending",
      };

      const result = await createSupportTicketAction(ticketData);

      if (result.isSuccess) {
        setShowSuccess(true);
        toast({
          title: "Success",
          description: "Your cancellation request has been submitted",
        });
        
        // Close popup after delay
        setTimeout(() => {
          onOpenChange(false);
          resetForm();
        }, 3000);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit cancellation request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting cancellation request:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cancel Membership</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Warning Alert */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Canceling your membership will:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Immediately revoke your access to all features</li>
                    <li>Not provide a refund for the current billing period</li>
                    <li>Potentially result in loss of your data</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Cancellation Reason */}
              <div className="space-y-3">
                <Label>Why are you canceling your membership?</Label>
                <RadioGroup value={cancellationReason} onValueChange={setCancellationReason}>
                  {cancellationReasons.map((reason) => (
                    <div key={reason.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={reason.value} id={reason.value} />
                      <Label htmlFor={reason.value} className="font-normal cursor-pointer">
                        {reason.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Additional Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">
                  Any additional feedback?
                  <span className="text-sm text-gray-500 ml-2">(optional)</span>
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Let us know how we can improve..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="confirmUnderstand"
                  checked={confirmUnderstand}
                  onCheckedChange={(checked) => setConfirmUnderstand(checked as boolean)}
                />
                <Label htmlFor="confirmUnderstand" className="font-normal text-sm leading-relaxed">
                  I understand that canceling my membership will immediately revoke my access, 
                  I won&apos;t receive a refund for the current billing period, and my data may be deleted.
                </Label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Keep Membership
                </Button>
                <Button 
                  type="submit" 
                  variant="destructive"
                  disabled={isSubmitting || !confirmUnderstand}
                >
                  {isSubmitting ? "Processing..." : "Cancel Membership"}
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Cancellation Request Submitted</h3>
              <p className="text-gray-600">
                Your membership cancellation request has been received.
                <br />
                We&apos;ll process it within 24 hours and send you a confirmation email.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                We&apos;re sorry to see you go. Thank you for being a member!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
} 