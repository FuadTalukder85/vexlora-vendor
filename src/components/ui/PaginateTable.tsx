"use client";

import React, { useState, useEffect } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "./Pagination";

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  headerClassName?: string;
}

export interface PaginateTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  showPageSizeSelector?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  headerContent?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  tableClassName?: string;
  maxHeight?: string;
  minHeight?: string;
}

export function PaginateTable<T>({
  data,
  columns,
  keyExtractor,
  defaultPageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
  showPagination = true,
  showPageSizeSelector = true,
  emptyMessage = "No records found",
  emptyIcon,
  title,
  subtitle,
  action,
  headerContent,
  onRowClick,
  className,
  tableClassName,
  maxHeight,
  minHeight,
}: PaginateTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset page to 1 whenever total data length or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, pageSize]);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Compute paginated slice of data
  const paginatedData = showPagination
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-0",
        minHeight,
        maxHeight,
        className
      )}
    >
      {/* 1. Fixed Title & Action Header Slot */}
      {(title || action) && (
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-30">
          <div>
            {title && typeof title === "string" ? (
              <h3 className="text-base font-bold text-primary">{title}</h3>
            ) : (
              title
            )}
            {subtitle && typeof subtitle === "string" ? (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            ) : (
              subtitle
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* 2. Fixed Search & Filter Header Slot */}
      {headerContent && (
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 shrink-0 z-30">
          {headerContent}
        </div>
      )}

      {/* 3. Table Area with Fixed Header & Scrollable Body */}
      <div className="overflow-auto flex-1 min-h-0 relative">
        <table className={cn("w-full border-collapse text-left min-w-max", tableClassName)}>
          <thead className="sticky top-0 z-20 bg-slate-100 shadow-2xs">
            <tr className="text-[16px] font-bold text-primary capitalize">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "py-3.5 px-5 bg-slate-100 sticky top-0 z-20",
                    alignClasses[col.align || "left"],
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-primary">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row, rowIndex)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    "hover:bg-slate-50/50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col, colIndex) => {
                    let content: React.ReactNode = null;
                    if (col.cell) {
                      content = col.cell(row, rowIndex);
                    } else if (col.accessorKey) {
                      content = String(row[col.accessorKey] ?? "");
                    }

                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          "py-3.5 px-5",
                          alignClasses[col.align || "left"],
                          col.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 px-5 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {emptyIcon || <Inbox className="w-8 h-8 text-slate-300" />}
                    <p className="text-xs font-semibold text-slate-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Fixed Pagination Footer Slot */}
      {showPagination && totalItems > 0 && (
        <div className="shrink-0 bg-white z-30 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={pageSizeOptions}
            showPageSizeSelector={showPageSizeSelector}
          />
        </div>
      )}
    </div>
  );
}
