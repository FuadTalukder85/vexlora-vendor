"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Settings,
  Store,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendorStore } from "@/stores/useVendorStore";
import { Badge } from "@/components/ui/Badge";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Analytics", href: "/analytics", icon: TrendingUp },
  { label: "Payouts & Finance", href: "/payouts", icon: CreditCard },
  { label: "Store Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { profile, isSidebarOpen } = useVendorStore();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-200/80 transition-all duration-300 flex flex-col justify-between w-64",
        !isSidebarOpen && "-translate-x-full lg:translate-x-0 lg:w-20"
      )}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-primary/90 transition-colors">
              V<span className="text-highlight">.</span>
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-extrabold text-primary text-lg tracking-tight leading-none">
                  Vexlora
                </span>
                <span className="text-[10px] font-semibold text-secondary tracking-widest uppercase mt-0.5">
                  Merchant Hub
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Store Profile Quick Card */}
        {isSidebarOpen && profile && (
          <div className="mx-4 my-4 p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary truncate">{profile.storeName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="success" className="text-[9px] px-1.5 py-0">
                  {profile.status}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-primary text-white font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-primary"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110 shrink-0",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-primary"
                  )}
                />
                {isSidebarOpen && <span>{item.label}</span>}
                {isActive && isSidebarOpen && (
                  <ChevronRight className="w-4 h-4 ml-auto text-white/70" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions / Sign out link */}
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/login"
          className={cn(
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all",
            !isSidebarOpen && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isSidebarOpen && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
};
