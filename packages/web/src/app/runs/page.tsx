"use client";

import { useRuns } from "@/src/queries/runs";
import type { Run } from "@superglue/shared";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/general-utils";
import { Activity, ChevronLeft, ChevronRight, Loader2, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOrg } from "@/src/app/org-context";
import { queryKeys } from "@/src/queries/query-keys";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 25;

const STATUS_COLORS: Record<string, string> = {
  running: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  success: "bg-green-500/15 text-green-600 dark:text-green-400",
  completed: "bg-green-500/15 text-green-600 dark:text-green-400",
  failed: "bg-red-500/15 text-red-600 dark:text-red-400",
  aborted: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  cancelled: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
};

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status.toLowerCase()] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        colorClass,
      )}
    >
      {status}
    </span>
  );
}

function formatDuration(ms: number | undefined): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatTime(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function RunsPage() {
  const router = useRouter();
  const { orgId } = useOrg();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isFetching } = useRuns({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const runs = data?.items ?? [];
  const hasMore = data?.hasMore ?? false;
  const total = data?.total;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.runs.all(orgId) });
  };

  const handleRowClick = (toolId: string) => {
    router.push(`/tools/${encodeURIComponent(toolId)}`);
  };

  return (
    <div className="p-4 sm:p-8 max-w-none w-full h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-2 flex-shrink-0">
        <h1 className="text-2xl font-bold">Runs</h1>
        {total !== undefined && (
          <span className="text-sm text-muted-foreground">{total} total</span>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4 flex-shrink-0">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="aborted">Aborted</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tool ID or run ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead className="hidden sm:table-cell">Source</TableHead>
              <TableHead className="hidden md:table-cell">Started</TableHead>
              <TableHead className="hidden sm:table-cell">Duration</TableHead>
              <TableHead className="text-right">
                <button
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 ml-auto"
                  title="Refresh Runs"
                >
                  <RefreshCw
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground",
                      isFetching && "animate-spin",
                    )}
                  />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && runs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-foreground inline-block" />
                </TableCell>
              </TableRow>
            ) : runs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Activity className="h-10 w-10 opacity-50" />
                    <span>No runs found</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              runs.map((run: Run) => (
                <TableRow
                  key={run.runId}
                  className="hover:bg-secondary cursor-pointer"
                  onClick={() => run.toolId && handleRowClick(run.toolId)}
                >
                  <TableCell>
                    <StatusBadge status={run.status} />
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {run.toolId || run.runId}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {run.requestSource || "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {formatTime(run.metadata?.startedAt)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {formatDuration(run.metadata?.durationMs)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground truncate max-w-[200px]">
                    {run.error ? (
                      <span className="text-red-500 text-xs">{run.error.slice(0, 60)}</span>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-3 flex-shrink-0">
        <span className="text-sm text-muted-foreground">Page {page + 1}</span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
