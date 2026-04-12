"use client";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { useSchedules, useDeleteSchedule } from "@/src/queries/schedules";
import { Clock, Trash2 } from "lucide-react";

export default function SchedulesPage() {
  const { schedules, isInitiallyLoading } = useSchedules();
  const deleteSchedule = useDeleteSchedule();

  const handleDelete = async (toolId: string, scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    await deleteSchedule.mutateAsync({ toolId, scheduleId });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Schedules</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage cron schedules for your tools.</p>
      </div>

      {isInitiallyLoading ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground text-center">Loading schedules...</p>
        </Card>
      ) : schedules.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground text-center">
            No schedules configured. Add schedules from a tool&apos;s detail page.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{schedule.toolId}</span>
                      <Badge variant={schedule.enabled ? "default" : "secondary"}>
                        {schedule.enabled ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {schedule.cronExpression}
                      </code>
                      {schedule.timezone && (
                        <span className="text-xs text-muted-foreground">{schedule.timezone}</span>
                      )}
                    </div>
                    {schedule.nextRunAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Next run: {new Date(schedule.nextRunAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(schedule.toolId, schedule.id)}
                  disabled={deleteSchedule.isPending}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
