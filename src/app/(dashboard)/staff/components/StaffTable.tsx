"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Search } from "lucide-react";
import { StaffMember } from "@/types/vendor";
import { Badge } from "@/components/ui/Badge";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatDate } from "@/lib/utils";
import { StaffSkeleton } from "./StaffSkeleton";

interface StaffTableProps {
  staffList: StaffMember[];
  isLoading: boolean;
}

export const StaffTable: React.FC<StaffTableProps> = ({ staffList, isLoading }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone && s.phone.includes(searchTerm))
  );

  const columns: ColumnDef<StaffMember>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-secondary text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Staff Member",
      cell: (s) => (
        <div>
          <p className="font-bold text-primary">{s.name}</p>
          <p className="text-[11px] text-secondary">{s.email}</p>
          {s.phone && <p className="text-[10px] text-secondary font-mono">{s.phone}</p>}
        </div>
      ),
    },
    {
      header: "Delegated Permissions",
      cell: (s) => {
        const count = s.userPermissions?.length || 0;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Badge variant={count > 0 ? "primary" : "neutral"} className="text-[10px]">
                {count} active permissions
              </Badge>
            </div>
            {count > 0 && (
              <p className="text-[10px] text-secondary truncate max-w-xs">
                {s.userPermissions?.map((up) => up.permission.name).slice(0, 3).join(", ")}
                {count > 3 && ` +${count - 3} more`}
              </p>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (s) => (
        <Badge variant={s.status === "ACTIVE" ? "success" : "danger"}>
          {s.status}
        </Badge>
      ),
    },
    {
      header: "Joined",
      cell: (s) => <span className="text-primary text-xs">{formatDate(s.createdAt)}</span>,
    },
    {
      header: "Actions",
      align: "right",
      cell: (s) => (
        <TableActions>
          <TableActionButton
            onClick={() => router.push(`/staff/${s.id}`)}
            title="Manage Permissions"
          >
            <KeyRound className="w-4 h-4 text-primary" />
          </TableActionButton>
        </TableActions>
      ),
    },
  ];

  if (isLoading && staffList.length === 0) {
    return <StaffSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={filteredStaff}
        columns={columns}
        keyExtractor={(s) => s.id}
        defaultPageSize={10}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />
    </div>
  );
};
