/**
 * Support Page Client Component
 * Interactive UI for support center with ticket management
 * Features refund/cancel popups and animated interface
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, X, HelpCircle, Mail, FileText, Clock, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectSupportTicket } from "@/db/schema";
import RefundPopup from "@/components/support/refund-popup";
import CancelSubscriptionPopup from "@/components/support/cancel-subscription-popup";

interface SupportPageClientProps {
  tickets: SelectSupportTicket[];
}

export default function SupportPageClient({ tickets }: SupportPageClientProps) {
  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  // Handle help support button click
  const handleHelpSupport = () => {
    const subject = encodeURIComponent("Support Request - StoryBoard");
    const body = encodeURIComponent(
      `Hello StoryBoard Support,\n\nI need help with:\n\n[Please describe your issue here]\n\nBest regards`
    );
    window.location.href = `mailto:usestoryboard@gmail.com?subject=${subject}&body=${body}`;
  };

  // Support actions configuration
  const supportActions = [
    {
      id: "refund",
      title: "Request a refund",
      icon: RefreshCw,
      onClick: () => setShowRefundPopup(true),
      className: "hover:border-red-200 hover:bg-red-50"
    },
    {
      id: "cancel",
      title: "Cancel membership",
      icon: X,
      onClick: () => setShowCancelPopup(true),
      className: "hover:border-orange-200 hover:bg-orange-50"
    },
    {
      id: "help",
      title: "Help & Support",
      icon: HelpCircle,
      onClick: handleHelpSupport,
      className: "hover:border-blue-200 hover:bg-blue-50"
    }
  ];

  // Get issue type label
  const getIssueTypeLabel = (issueType: string) => {
    const labels: Record<string, string> = {
      "forgot-cancel": "Forgot to cancel membership",
      "no-product": "Didn't receive the product",
      "unacceptable": "Product unacceptable",
      "not-described": "Product not as described",
      "unauthorized": "Unauthorized transaction",
      "subscription-cancel": "Subscription Cancellation"
    };
    return labels[issueType] || issueType;
  };

  // Get status text
  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      "pending": "Pending",
      "in-review": "In Review",
      "resolved": "Resolved",
      "refunded": "Refunded",
      "rejected": "Rejected",
      "canceled": "Canceled",
      "subscription-cancel": "Subscription Cancellation"
    };
    return statusTexts[status] || status;
  };

  // Get status card color
  const getStatusCardColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200 hover:border-yellow-300";
      case "in-review":
        return "bg-blue-50 border-blue-200 hover:border-blue-300";
      case "resolved":
        return "bg-green-50 border-green-200 hover:border-green-300";
      case "refunded":
        return "bg-emerald-50 border-emerald-200 hover:border-emerald-300";
      case "rejected":
        return "bg-red-50 border-red-200 hover:border-red-300";
      case "canceled":
        return "bg-orange-50 border-orange-200 hover:border-orange-300";
      default:
        return "bg-gray-50 border-gray-200 hover:border-gray-300";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "in-review":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case "resolved":
      case "refunded":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
      case "canceled":
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <>
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold mb-2">Support Center</h1>
          <p className="text-gray-600 mb-8">Manage your account and get help</p>
        </motion.div>

        {/* Main Support Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-8 mb-8 border-2">
            <div className="flex flex-col items-center text-center">
              <Image
                src="/logo.png"
                alt="StoryBoard"
                width={80}
                height={80}
                className="mb-4 object-contain"
              />
              <h2 className="text-2xl font-bold mb-2">StoryBoard</h2>
              <p className="text-gray-600 mb-6">How can we help you today?</p>
              
              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                {supportActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={action.onClick}
                        className={`h-auto py-6 px-4 flex flex-col items-center gap-3 transition-all duration-200 ${action.className}`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="font-medium">{action.title}</span>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Email Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-8 flex items-center gap-2 text-gray-600"
        >
          <Mail className="w-4 h-4" />
          <span>Contact us at:</span>
          <a 
            href="mailto:usestoryboard@gmail.com"
            className="font-medium text-[#C5F547] hover:underline"
          >
            usestoryboard@gmail.com
          </a>
        </motion.div>

        {/* Support Tickets Section */}
        {tickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Support Tickets</h3>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                {tickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`p-4 rounded-lg border transition-all duration-200 ${getStatusCardColor(ticket.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{getIssueTypeLabel(ticket.issueType)}</span>
                          <span className="text-sm text-gray-500">#{ticket.id.slice(0, 8)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.details}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{new Date(ticket.createdAt).toLocaleDateString('en-GB')}</span>
                          {ticket.transactionAmount && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>${ticket.transactionAmount}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <span className="text-sm font-medium">{getStatusText(ticket.status)}</span>
                      </div>
                    </div>
                    
                    {ticket.resolutionNotes && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Resolution:</span> {ticket.resolutionNotes}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {tickets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No support tickets yet</p>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Popups */}
      <RefundPopup 
        isOpen={showRefundPopup}
        onOpenChange={setShowRefundPopup}
      />
      
      <CancelSubscriptionPopup
        isOpen={showCancelPopup}
        onOpenChange={setShowCancelPopup}
      />
    </>
  );
} 