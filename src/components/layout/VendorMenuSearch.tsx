"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  LayoutDashboard,
  MessageSquare,
  Package,
  Plus,
  Flame,
  TicketPercent,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Users,
  Bell,
  Settings,
  Store,
  ArrowRight,
  Compass,
} from "lucide-react";
import { useVendorStore } from "@/stores/useVendorStore";
import { cn } from "@/lib/utils";

export interface VendorSearchItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  description: string;
  keywords: string[];
  permission?: string;
  anyPermissions?: string[];
  ownerOnly?: boolean;
}

export const VENDOR_NAV_SEARCH_ITEMS: VendorSearchItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Merchant Hub overview & store performance metrics",
    keywords: ["dashboard", "home", "merchant hub", "overview", "sales", "kpi", "performance"],
  },
  {
    label: "Customer Chat",
    href: "/messages",
    icon: MessageSquare,
    description: "Direct real-time conversations & customer inquiries",
    keywords: ["customer chat", "chat", "messages", "inbox", "support", "conversations"],
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    permission: "product:read",
    description: "Catalog inventory, pricing & active item listings",
    keywords: ["products", "product", "items", "catalog", "inventory", "stock", "listings"],
  },
  {
    label: "Add Product",
    href: "/products/new",
    icon: Plus,
    badge: "Create",
    permission: "product:create",
    description: "Publish and list a new item to your storefront",
    keywords: ["add product", "new product", "create product", "publish product", "list product", "upload item"],
  },
  {
    label: "Flash Deals",
    href: "/deals",
    icon: Flame,
    permission: "product:read",
    description: "Flash sales, limited-time promos & discount campaigns",
    keywords: ["flash deals", "deals", "promotions", "sales", "discounts", "campaigns", "offers"],
  },
  {
    label: "Coupons & Discounts",
    href: "/coupons",
    icon: TicketPercent,
    permission: "coupon:read",
    description: "Store discount vouchers, promo codes & customer incentives",
    keywords: ["coupons", "discounts", "vouchers", "promo codes", "promotions", "marketing", "coupons & discounts"],
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingBag,
    permission: "order:read",
    description: "Manage incoming customer sub-orders & dispatch packages",
    keywords: ["orders", "order", "sub-orders", "fulfillments", "shipping", "deliveries", "sales", "packages"],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    anyPermissions: ["order:read", "product:read"],
    description: "Store sales charts, revenue metrics & traffic analytics",
    keywords: ["analytics", "reports", "revenue", "sales analytics", "metrics", "charts", "graphs", "stats"],
  },
  {
    label: "Payouts & Finance",
    href: "/payouts",
    icon: CreditCard,
    permission: "payout:read",
    description: "Settlement balance, payout requests & banking details",
    keywords: ["payouts", "finance", "withdrawals", "balance", "earnings", "bank details", "money", "settlements"],
  },
  {
    label: "Staff & Team",
    href: "/staff",
    icon: Users,
    permission: "staff:read",
    description: "Team member accounts, roles & staff permissions",
    keywords: ["staff", "team", "members", "employees", "permissions", "roles", "staff & team"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    description: "Store notices, low stock alerts & customer updates",
    keywords: ["notifications", "alerts", "inbox", "notices", "updates", "messages"],
  },
  {
    label: "Store Settings",
    href: "/settings",
    icon: Settings,
    permission: "vendor-profile:read",
    description: "Store branding, logo, shipping preferences & policies",
    keywords: ["settings", "store settings", "branding", "profile", "store profile", "policies", "shipping"],
  },
  {
    label: "Vendor Profile",
    href: "/profile",
    icon: Store,
    description: "Account owner credentials, email & personal security",
    keywords: ["profile", "vendor profile", "account", "owner", "password", "security"],
  },
];

interface VendorMenuSearchProps {
  className?: string;
  placeholder?: string;
}

export const VendorMenuSearch: React.FC<VendorMenuSearchProps> = ({
  className,
  placeholder = "Search products, sub-orders, transactions...",
}) => {
  const router = useRouter();
  const { isOwner, hasPermission, hasAnyPermission } = useVendorStore();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter routes based on active vendor permissions / ownership
  const accessibleItems = useMemo(() => {
    return VENDOR_NAV_SEARCH_ITEMS.filter((item) => {
      if (isOwner) return true;
      if (item.ownerOnly) return isOwner;
      if (!item.permission && !item.anyPermissions) return true;
      if (item.permission && hasPermission(item.permission)) return true;
      if (item.anyPermissions && hasAnyPermission(item.anyPermissions)) return true;
      return false;
    });
  }, [isOwner, hasPermission, hasAnyPermission]);

  // Match accessible items against search query
  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // When empty and focused, show top common navigation items
      return accessibleItems.slice(0, 5);
    }

    return accessibleItems.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchHref = item.href.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(q));
      return matchLabel || matchHref || matchDesc || matchKeywords;
    });
  }, [query, accessibleItems]);

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredSuggestions]);

  // Handle clicking outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: VendorSearchItem) => {
    setIsOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsOpen(true);
      return;
    }

    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filteredSuggestions[selectedIndex];
      if (target) {
        handleSelect(target);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const isQueryTyped = query.trim().length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none z-10" />

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 bg-muted/70 border border-transparent rounded-xl text-xs text-primary placeholder-secondary focus:outline-none focus:bg-white focus:border-border transition-all"
        aria-label="Search vendor portal menu items and pages"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        role="combobox"
      />

      {isQueryTyped && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setIsOpen(true);
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary p-0.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
          title="Clear search"
          aria-label="Clear search query"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Search Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2 border-b border-border/60 bg-muted/30 flex items-center justify-between text-[11px] font-bold text-secondary uppercase tracking-wider">
            <span>{isQueryTyped ? "Matching Menu Items & Routes" : "Quick Store Navigation"}</span>
            <span className="text-[10px] font-semibold text-secondary/80 lowercase">
              {filteredSuggestions.length} {filteredSuggestions.length === 1 ? "page" : "pages"}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5" role="listbox">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={item.href + item.label}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(item);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer group",
                      isSelected
                        ? "bg-primary text-white shadow-xs"
                        : "text-primary hover:bg-muted/70"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-muted text-secondary group-hover:text-primary group-hover:bg-muted/80"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-bold truncate", isSelected ? "text-white" : "text-primary")}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase",
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-highlight/10 text-highlight"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-[10px] font-mono ml-auto shrink-0",
                            isSelected ? "text-white/70" : "text-secondary/70"
                          )}
                        >
                          {item.href}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-[10px] truncate mt-0.5",
                          isSelected ? "text-white/80" : "text-secondary"
                        )}
                      >
                        {item.description}
                      </p>
                    </div>

                    <ArrowRight
                      className={cn(
                        "w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5",
                        isSelected ? "text-white" : "text-secondary/60 group-hover:text-primary"
                      )}
                    />
                  </button>
                );
              })
            ) : (
              <div className="py-6 px-4 text-center space-y-1.5">
                <Compass className="w-6 h-6 mx-auto text-secondary/40" />
                <p className="text-xs font-semibold text-primary">
                  No menu items found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[10px] text-secondary">
                  Try searching for products, orders, coupons, deals, analytics, payouts, settings...
                </p>
              </div>
            )}
          </div>

          <div className="px-3 py-1.5 bg-muted/40 border-t border-border/50 flex items-center justify-between text-[10px] text-secondary">
            <span>Use ↑ ↓ to navigate</span>
            <span>Press Enter ↵ to open</span>
            <span>Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
};
