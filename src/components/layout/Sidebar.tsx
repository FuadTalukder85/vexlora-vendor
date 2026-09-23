"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  Flame,
  Bell,
  TicketPercent,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendorStore } from "@/stores/useVendorStore";
import { Badge } from "@/components/ui/Badge";

interface VendorNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  anyPermissions?: string[];
  ownerOnly?: boolean;
}

const navItems: VendorNavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package, permission: "product:read" },
  { label: "Flash Deals", href: "/deals", icon: Flame, permission: "product:read" },
  { label: "Coupons & Discounts", href: "/coupons", icon: TicketPercent, permission: "coupon:read" },
  { label: "Orders", href: "/orders", icon: ShoppingBag, permission: "order:read" },
  { label: "Analytics", href: "/analytics", icon: TrendingUp, anyPermissions: ["order:read", "product:read"] },
  { label: "Payouts & Finance", href: "/payouts", icon: CreditCard, permission: "payout:read" },
  { label: "Staff & Team", href: "/staff", icon: Users, permission: "staff:read" },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Store Settings", href: "/settings", icon: Settings, permission: "vendor-profile:read" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isSidebarOpen, logout, isOwner, hasPermission, hasAnyPermission } = useVendorStore();

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await logout();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-border transition-all duration-300 flex flex-col justify-between w-64",
        !isSidebarOpen && "-translate-x-full lg:translate-x-0 lg:w-20"
      )}
    >
      {/* Top Header & Brand */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-16 px-6 border-b border-border flex items-center justify-between">
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
        {isSidebarOpen && (
          profile ? (
            <div className="mx-4 my-4 p-3 rounded-xl bg-muted border border-border/60 flex items-center gap-3">
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
          ) : (
            <div className="mx-4 my-4 p-3 rounded-xl bg-muted border border-border/60 flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-lg bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="h-3.5 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-14" />
              </div>
            </div>
          )
        )}

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1">
          {navItems
            .filter((item) => {
              if (isOwner) return true;
              if (item.ownerOnly) return isOwner;
              if (!item.permission && !item.anyPermissions) return true;
              if (item.permission) return hasPermission(item.permission);
              if (item.anyPermissions) return hasAnyPermission(item.anyPermissions);
              return true;
            })
            .map((item) => {
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
                    : "text-primary hover:bg-muted hover:text-primary"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110 shrink-0",
                    isActive ? "text-white" : "text-secondary group-hover:text-primary"
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

      {/* Bottom User Profile & Logout Widget */}
      <div className="p-3 border-t border-border bg-white">
        <div
          className={cn(
            "flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-muted/70 transition-colors group",
            !isSidebarOpen && "justify-center"
          )}
        >
          {/* Profile Image & Email linking to /profile */}
          <Link
            href="/profile"
            className="flex items-center gap-2.5 min-w-0 flex-1 group-hover:opacity-90 transition-opacity"
            title="View Vendor Profile"
          >
            <div className="w-9 h-9 rounded-full bg-muted border border-border overflow-hidden relative shrink-0">
              {user?.image ? (
                <Image src={user.image} alt={user.name || "Vendor"} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-xs">
                  {user?.name?.charAt(0) || "V"}
                </div>
              )}
            </div>

            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary truncate leading-tight">
                  {user?.name || "Vendor"}
                </p>
                <p className="text-[10px] text-secondary truncate mt-0.5">
                  {user?.email || "vendor@store.com"}
                </p>
              </div>
            )}
          </Link>

          {/* Logout Icon Button on the Right */}
          {isSidebarOpen && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-secondary hover:text-highlight hover:bg-highlight/10 transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
