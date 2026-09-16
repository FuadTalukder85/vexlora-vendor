"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertCircle, Store, Mail, Lock, Phone } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useVendorStore } from "@/stores/useVendorStore";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { registerVendor, isLoading } = useVendorStore();

  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await registerVendor({
        storeName,
        email,
        password,
        phone,
        description,
      });

      setIsSubmitted(true);
      toast.success("Merchant application submitted successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit merchant application.";
      setErrorMsg(msg);
      toast.error(msg);
    }
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
          <div className="text-center space-y-4 py-6 animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-primary">Application Submitted!</h2>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Thank you for applying to sell on Vexlora. Your merchant account has been registered and is currently pending administrator verification.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-left text-xs text-slate-600 space-y-1 max-w-sm mx-auto">
              <p><strong className="text-primary">Store Name:</strong> {storeName}</p>
              <p><strong className="text-primary">Business Email:</strong> {email}</p>
              <p><strong className="text-primary">Status:</strong> <span className="text-amber-600 font-bold">Pending Review</span></p>
            </div>
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

            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Store / Business Name *"
                placeholder="Apex Electronics"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                leftIcon={<Store className="w-4 h-4" />}
                required
              />

              <Input
                label="Business Email Address *"
                type="email"
                placeholder="contact@apexelectronics.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Account Password *"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
                minLength={6}
              />

              <Input
                label="Contact Phone Number *"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store Overview / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of your product offerings..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-slate-300 text-slate-800"
                />
              </div>

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
