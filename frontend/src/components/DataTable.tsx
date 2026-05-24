import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (item: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search records...',
  pagination,
  onRowClick,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Handle local sorting if server-side pagination is not provided
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Process data locally (if server-side controls are not bound)
  const processedData = useMemo(() => {
    let result = [...data];

    // Local Search
    if (searchable && localSearch && !pagination) {
      const query = localSearch.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some(
          (val) => val && String(val).toLowerCase().includes(query)
        )
      );
    }

    // Local Sort
    if (sortField && !pagination) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, localSearch, sortField, sortOrder, searchable, pagination]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search Bar */}
      {searchable && (
        <div className="relative max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      )}

      {/* Table Panel */}
      <div className="glass-panel overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-[#12141A]/80 backdrop-blur-md">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-6 py-4 text-left text-xs font-mono font-bold uppercase tracking-wider text-text-muted select-none ${
                      col.sortable ? 'cursor-pointer hover:text-text-primary transition-colors' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortField === col.key && (
                        sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2130]/50 bg-transparent">
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-sm font-mono text-text-muted">
                    No records found.
                  </td>
                </tr>
              ) : (
                processedData.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`hover:bg-[#1E2130]/20 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } animate-fade-in`}
                    style={{
                      animation: 'fadeIn 0.3s ease-out forwards',
                      animationDelay: `${idx * 30}ms`,
                      opacity: 0 // Start hidden for staggered animation
                    }}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-mono tracking-tight">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-border bg-[#12141A]/50 flex items-center justify-between">
            <span className="text-xs font-mono text-text-muted">
              Showing page <span className="text-text-primary font-bold">{pagination.page}</span> of{' '}
              <span className="text-text-primary font-bold">{pagination.pages}</span> ({pagination.total} total items)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 bg-[#0A0B0F] border border-border rounded-lg text-text-muted hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-1.5 bg-[#0A0B0F] border border-border rounded-lg text-text-muted hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
