"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ArrowRight, Clock, AlertCircle, RefreshCw, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useVendorStore } from "@/stores/useVendorStore";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, fetchProfile, user, profile, isLoading } = useVendorStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingView, setPendingView] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPendingView(false);

    try {
      const { profile: resProfile } = await login(email, password);

      if (resProfile?.status === "PENDING") {
        setPendingView(true);
        toast.info("Your application is currently pending admin review.");
      } else if (resProfile?.status === "APPROVED" || resProfile?.status === undefined) {
        toast.success("Signed in successfully!");
        router.push("/");
      } else if (resProfile?.status === "REJECTED" || resProfile?.status === "SUSPENDED") {
        const msg = `Account status: ${resProfile.status}. Please contact support.`;
        setErrorMsg(msg);
        toast.error(msg);
      } else {
        toast.success("Signed in successfully!");
        router.push("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.";
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const handleRefreshStatus = async () => {
    await fetchProfile();
    const currentProfile = useVendorStore.getState().profile;
    if (currentProfile?.status === "APPROVED") {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-primary text-white items-center justify-center font-extrabold text-2xl shadow-md mb-1">
            V<span className="text-highlight">.</span>
          </div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">
            Vexlora Merchant Hub
          </h1>
          <p className="text-xs text-secondary">
            Sign in to manage your storefront, catalog, sub-orders and payouts
          </p>
        </div>

        {/* PENDING APPROVAL SCREEN */}
        {pendingView || (profile && profile.status === "PENDING" && user) ? (
          <div className="text-center space-y-4 py-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                Status: Pending Approval
              </span>
              <h2 className="text-xl font-extrabold text-primary">Application Under Review</h2>
              <p className="text-xs text-primary max-w-sm mx-auto">
                Your merchant application for <strong className="text-primary">{profile?.storeName || "your store"}</strong> is currently being reviewed by our admin verification team.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button variant="primary" size="md" onClick={handleRefreshStatus} isLoading={isLoading}>
                <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Status
              </Button>
              <button
                onClick={() => setPendingView(false)}
                className="text-xs text-secondary hover:text-primary font-semibold py-1"
              >
                Sign in with another account
              </button>
            </div>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@store.com"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-primary">
                  <input type="checkbox" className="rounded border-slate-300 text-primary" defaultChecked />
                  Remember me
                </label>
                <a href="#" className="font-semibold text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                <LogIn className="w-4 h-4" />
                Sign In to Vendor Dashboard
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-secondary">
              Want to become a seller on Vexlora?{" "}
              <Link href="/register" className="font-bold text-highlight hover:underline inline-flex items-center gap-1">
                Apply as Merchant <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
