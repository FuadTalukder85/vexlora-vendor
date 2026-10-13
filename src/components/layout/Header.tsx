"use client";

import React from "react";
import Link from "next/link";
import { Menu, Bell, Plus } from "lucide-react";
import { useVendorStore } from "@/stores/useVendorStore";
import { VendorUserMenu } from "./VendorUserMenu";
import { VendorMenuSearch } from "./VendorMenuSearch";
import { Button } from "@/components/ui/Button";

export const Header: React.FC = () => {
  const { toggleSidebar } = useVendorStore();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border h-16 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Sidebar Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-muted transition-colors focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <VendorMenuSearch className="hidden sm:block" />
      </div>

      {/* Right: Actions & User Dropdown */}
      <div className="flex items-center gap-3">
        <Link href="/products/new">
          <Button variant="primary" size="sm" className="hidden sm:inline-flex">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl text-secondary hover:text-primary hover:bg-muted transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-highlight ring-2 ring-white"></span>
        </Link>

        <div className="h-6 w-[1px] bg-muted my-auto"></div>

        {/* Vendor Profile Menu */}
        <VendorUserMenu />
      </div>
    </header>
  );
};
