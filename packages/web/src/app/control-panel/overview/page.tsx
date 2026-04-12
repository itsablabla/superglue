"use client";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useTools } from "@/src/queries/tools";
import { useSystems } from "@/src/queries/systems";
import { useApiKeys } from "@/src/queries/api-keys";
import { useSchedules } from "@/src/queries/schedules";
import { useRuns } from "@/src/queries/runs";
import { RunStatus } from "@superglue/shared";
import { AlertCircle, ArrowRight, Bell, Blocks, Clock, Hammer, Key, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_VISIBLE_ITEMS = 5;

export default function ControlPanelOverviewPage() {
  const { tools, isInitiallyLoading: toolsLoading } = useTools();
  const { systems, loading: systemsLoading } = useSystems();
  const { data: apiKeys, isLoading: apiKeysLoading } = useApiKeys();
  const { schedules, isInitiallyLoading: schedulesLoading } = useSchedules();
  const { data: runsData, isLoading: runsLoading } = useRuns({ page: 0, pageSize: 1000 });

  const recentRuns = useMemo(() => {
    if (!runsData?.items) return [];
    const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);
    return runsData.items.filter((r) => new Date(r.metadata?.startedAt ?? "") > cutoff);
  }, [runsData]);

  const failedRuns = useMemo(() => {
    if (!runsData?.items) return [];
    const cutoff = new Date(Date.now() - ONE_DAY_MS);
    return runsData.items.filter(
      (r) => r.status === RunStatus.FAILED && new Date(r.metadata?.startedAt ?? "") > cutoff,
    );
  }, [runsData]);

  const upcomingSchedules = useMemo(
    () =>
      schedules
        .filter((s) => s.enabled)
        .sort((a, b) => new Date(a.nextRunAt).getTime() - new Date(b.nextRunAt).getTime())
        .slice(0, MAX_VISIBLE_ITEMS),
    [schedules],
  );

  const stats = [
    { icon: Blocks, label: "Systems", value: systemsLoading ? "..." : systems.length },
    { icon: Hammer, label: "Tools", value: toolsLoading ? "..." : tools.length },
    { icon: RefreshCw, label: "Tool Runs (7d)", value: runsLoading ? "..." : recentRuns.length },
    { icon: Key, label: "API Keys", value: apiKeysLoading ? "..." : (apiKeys?.length ?? 0) },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Control Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor runs, manage schedules, and configure your workspace.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Usage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">Failed Runs</h2>
            <span className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              Triggered via scheduler, webhook, or API in the last 24 hours
            </span>
          </div>
          <Link href="/notifications">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Bell className="h-3.5 w-3.5" />
              Set Up Notifications
            </Button>
          </Link>
        </div>
        <Card className="p-6">
          {runsLoading ? (
            <p className="text-sm text-muted-foreground text-center">Loading...</p>
          ) : failedRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No failed runs in the last 24 hours
            </p>
          ) : (
            <div className="space-y-2">
              {failedRuns.slice(0, MAX_VISIBLE_ITEMS).map((run) => (
                <div
                  key={run.runId}
                  className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                >
                  <div>
                    <span className="font-medium">{run.toolId}</span>
                    <span className="text-muted-foreground ml-2">
                      {run.error?.slice(0, 100) || "Unknown error"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(run.metadata?.startedAt ?? "").toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/runs"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2"
          >
            Explore all failed runs <ArrowRight className="h-3 w-3" />
          </Link>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Upcoming Schedules</h2>
        <Card className="p-6">
          {schedulesLoading ? (
            <p className="text-sm text-muted-foreground text-center">Loading...</p>
          ) : upcomingSchedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">No active schedules</p>
          ) : (
            <div className="space-y-2">
              {upcomingSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{schedule.toolId}</span>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {schedule.cronExpression}
                    </code>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Next: {new Date(schedule.nextRunAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/control-panel/schedules"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2"
          >
            View all schedules <ArrowRight className="h-3 w-3" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
