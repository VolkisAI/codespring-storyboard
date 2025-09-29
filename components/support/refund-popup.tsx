/**
 * Refund Popup Component
 * Handles refund request submissions with proper validation
 * Creates support tickets for refund requests
 */

"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createSupportTicketAction } from "@/actions/support-tickets-actions";
import { InsertSupportTicket } from "@/db/schema";
import { useToast } from "@/components/ui/use-toast";

interface RefundPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RefundPopup({ isOpen, onOpenChange }: RefundPopupProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [issueType, setIssueType] = useState<InsertSupportTicket['issueType']>("forgot-cancel");
  const [purchaseEmails, setPurchaseEmails] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [details, setDetails] = useState("");

  // Issue type options
  const issueOptions = [
    { value: "forgot-cancel", label: "I forgot to cancel my membership" },
    { value: "no-product", label: "I didn't receive the product" },
    { value: "unacceptable", label: "The product quality is unacceptable" },
    { value: "not-described", label: "The product is not as described" },
    { value: "unauthorized", label: "This was an unauthorized transaction" },
  ];

  // Reset form
  const resetForm = () => {
    setIssueType("forgot-cancel");
    setPurchaseEmails("");
    setTransactionDate("");
    setTransactionAmount("");
    setDetails("");
    setShowSuccess(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a refund request",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!purchaseEmails.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one purchase email",
        variant: "destructive",
      });
      return;
    }

    if (!details.trim()) {
      toast({
        title: "Error",
        description: "Please provide details about your refund request",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse emails
      const emailArray = purchaseEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      // Create support ticket
      const ticketData: InsertSupportTicket = {
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress || "",
        issueType,
        purchaseEmails: emailArray,
        transactionDate: transactionDate || undefined,
        transactionAmount: transactionAmount || undefined,
        details,
        status: "pending",
      };

      const result = await createSupportTicketAction(ticketData);

      if (result.isSuccess) {
        setShowSuccess(true);
        toast({
          title: "Success",
          description: "Your refund request has been submitted successfully",
        });
        
        // Close popup after delay
        setTimeout(() => {
          onOpenChange(false);
          resetForm();
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to submit refund request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting refund request:", error);
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
          <DialogTitle>Request a Refund</DialogTitle>
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
              {/* Issue Type */}
              <div className="space-y-3">
                <Label>What&apos;s the reason for your refund request?</Label>
                <RadioGroup value={issueType} onValueChange={(value) => setIssueType(value as InsertSupportTicket['issueType'])}>
                  {issueOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Purchase Emails */}
              <div className="space-y-2">
                <Label htmlFor="purchaseEmails">
                  Email address(es) used for purchase
                  <span className="text-sm text-gray-500 ml-2">(comma-separated if multiple)</span>
                </Label>
                <Input
                  id="purchaseEmails"
                  type="text"
                  placeholder="email1@example.com, email2@example.com"
                  value={purchaseEmails}
                  onChange={(e) => setPurchaseEmails(e.target.value)}
                  required
                />
              </div>

              {/* Transaction Date */}
              <div className="space-y-2">
                <Label htmlFor="transactionDate">
                  Transaction Date
                  <span className="text-sm text-gray-500 ml-2">(optional)</span>
                </Label>
                <Input
                  id="transactionDate"
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                />
              </div>

              {/* Transaction Amount */}
              <div className="space-y-2">
                <Label htmlFor="transactionAmount">
                  Transaction Amount
                  <span className="text-sm text-gray-500 ml-2">(optional)</span>
                </Label>
                <Input
                  id="transactionAmount"
                  type="text"
                  placeholder="$29.99"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                />
              </div>

              {/* Details */}
              <div className="space-y-2">
                <Label htmlFor="details">
                  Please provide more details about your refund request
                </Label>
                <Textarea
                  id="details"
                  placeholder="Explain why you&apos;re requesting a refund..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Info Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Refund requests are typically processed within 3-5 business days. 
                  We&apos;ll email you once your request has been reviewed.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Refund Request"}
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Request Submitted!</h3>
              <p className="text-gray-600">
                Your refund request has been submitted successfully.
                <br />
                We&apos;ll review it and get back to you soon.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
} 