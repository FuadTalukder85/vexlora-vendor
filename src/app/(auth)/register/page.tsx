"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        {isSubmitted ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-primary">Application Submitted!</h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Thank you for applying to sell on Vexlora. Our merchant verification team will review your business credentials within 24 hours.
            </p>
            <Button variant="primary" size="md" onClick={() => router.push("/login")}>
              Return to Login Screen
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-primary tracking-tight">
                Become a Vexlora Merchant
              </h1>
              <p className="text-xs text-slate-500">
                Join thousands of brands selling products to millions of active shoppers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Store / Business Name *"
                placeholder="Apex Electronics"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />

              <Input
                label="Business Email Address *"
                type="email"
                placeholder="contact@apexelectronics.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Contact Phone Number *"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-600 space-y-1">
                <p className="font-bold text-primary">Platform Terms & Commission:</p>
                <p>Standard seller commission tier is 8.5% per delivered sub-order. No monthly listing fees.</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Submit Merchant Application
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
