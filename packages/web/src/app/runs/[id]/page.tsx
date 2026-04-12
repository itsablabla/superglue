"use client";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useRuns } from "@/src/queries/runs";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/src/lib/general-utils";

const STATUS_COLORS: Record<string, string> = {
  running: "bg-blue-500/15 text-blue-600",
  success: "bg-green-500/15 text-green-600",
  completed: "bg-green-500/15 text-green-600",
  failed: "bg-red-500/15 text-red-600",
  aborted: "bg-yellow-500/15 text-yellow-600",
};

function formatDuration(ms: number | undefined): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export default function RunDetailPage() {
  const params = useParams();
  const runId = params.id as string;
  const { data, isLoading } = useRuns({ page: 0, pageSize: 1000 });

  const run = data?.items?.find((r) => r.runId === runId);

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-sm text-muted-foreground text-center">Loading run details...</p>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <Link href="/runs">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Runs
          </Button>
        </Link>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground text-center">Run not found: {runId}</p>
        </Card>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[run.status?.toLowerCase()] ?? "bg-muted text-muted-foreground";

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/runs">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{run.toolId || run.runId}</h1>
          <p className="text-xs text-muted-foreground font-mono">{run.runId}</p>
        </div>
        <Badge className={cn("text-sm", statusColor)}>{run.status}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Source</p>
          <p className="text-sm font-medium">{run.requestSource || "—"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Duration</p>
          <p className="text-sm font-medium">{formatDuration(run.metadata?.durationMs)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Started</p>
          <p className="text-sm font-medium">
            {run.metadata?.startedAt ? new Date(run.metadata.startedAt).toLocaleString() : "—"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-sm font-medium">
            {run.metadata?.completedAt ? new Date(run.metadata.completedAt).toLocaleString() : "—"}
          </p>
        </Card>
      </div>

      {run.toolId && (
        <Link href={`/tools/${encodeURIComponent(run.toolId)}`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <ExternalLink className="h-4 w-4" />
            View Tool
          </Button>
        </Link>
      )}

      {run.error && (
        <Card className="p-4 border-red-500/30">
          <h3 className="text-sm font-medium text-red-500 mb-2">Error</h3>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words bg-muted/50 p-3 rounded">
            {run.error}
          </pre>
        </Card>
      )}

      {run.metadata && (
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Metadata</h3>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words bg-muted/50 p-3 rounded max-h-64 overflow-auto">
            {JSON.stringify(run.metadata, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
