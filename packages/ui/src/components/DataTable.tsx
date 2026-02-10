'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { staggerContainer, staggerItem } from '../animations';
import { cn } from '../utils';

// --- Types ---

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: string;
  header: string;
  /** Custom cell renderer */
  render?: (row: T, index: number) => React.ReactNode;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Column width (Tailwind class) */
  width?: string;
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom sort comparator */
  sortFn?: (a: T, b: T) => number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** Unique key extractor */
  getRowKey: (row: T) => string | number;
  /** Click handler for row */
  onRowClick?: (row: T) => void;
  /** Loading state */
  loading?: boolean;
  /** Empty state content */
  emptyState?: React.ReactNode;
  /** Enable pagination */
  pageSize?: number;
  /** Stripe alternating rows */
  striped?: boolean;
  /** Compact row height */
  compact?: boolean;
  className?: string;
}

// --- Component ---

function DataTable<T>({
  data,
  columns,
  getRowKey,
  onRowClick,
  loading,
  emptyState,
  pageSize,
  striped = false,
  compact = false,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDirection>(null);
  const [page, setPage] = React.useState(0);

  // --- Sorting ---
  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      if (col.sortFn) {
        return sortDir === 'asc' ? col.sortFn(a, b) : -col.sortFn(a, b);
      }
      const aVal = (a as Record<string, unknown>)[col.key];
      const bVal = (b as Record<string, unknown>)[col.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columns]);

  // --- Pagination ---
  const totalPages = pageSize ? Math.ceil(sortedData.length / pageSize) : 1;
  const paginatedData = pageSize
    ? sortedData.slice(page * pageSize, (page + 1) * pageSize)
    : sortedData;

  const alignClass = (align?: string) =>
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  // --- Sort Icon ---
  const SortIcon = ({ col }: { col: Column<T> }) => {
    if (!col.sortable) return null;
    if (sortKey === col.key && sortDir === 'asc') return <ChevronUp className="h-3.5 w-3.5" />;
    if (sortKey === col.key && sortDir === 'desc') return <ChevronDown className="h-3.5 w-3.5" />;
    return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
  };

  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Header */}
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 font-medium text-neutral-500 dark:text-neutral-400',
                    compact ? 'py-2' : 'py-3',
                    alignClass(col.align),
                    col.width,
                    col.sortable && 'cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors'
                  )}
                  onClick={() => handleSort(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <motion.tbody
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: pageSize || 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4', compact ? 'py-2' : 'py-3')}>
                        <div className="h-4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    {emptyState || (
                      <p className="text-neutral-400 dark:text-neutral-500">No data found</p>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <motion.tr
                    key={getRowKey(row)}
                    variants={staggerItem}
                    layout
                    className={cn(
                      'border-b border-neutral-100 dark:border-neutral-800 last:border-0 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                      striped && index % 2 === 1 && 'bg-neutral-25 dark:bg-neutral-950'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 text-neutral-700 dark:text-neutral-300',
                          compact ? 'py-2' : 'py-3',
                          alignClass(col.align),
                          col.width
                        )}
                      >
                        {col.render
                          ? col.render(row, index)
                          : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageSize && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50/80 px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/50">
          <p className="text-xs text-neutral-500">
            Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sortedData.length)} of {sortedData.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600 disabled:opacity-30 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[4rem] text-center text-xs text-neutral-600 dark:text-neutral-400">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600 disabled:opacity-30 dark:hover:bg-neutral-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DataTable };
