"use client";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  useDeleteNotificationChannel,
} from "@/src/queries/notifications";
import { useState } from "react";

export default function NotificationsPage() {
  const { data, isLoading } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const deleteChannel = useDeleteNotificationChannel();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  const slackConfig = data?.channels?.slack;
  const isConnected = slackConfig?.enabled;

  const handleSetupSlack = async () => {
    if (!webhookUrl.trim()) return;
    try {
      await updateSettings.mutateAsync({
        channels: {
          slack: {
            enabled: true,
            authType: "webhook" as const,
            webhookUrl: webhookUrl.trim(),
            rules: [{ id: "default", enabled: true, conditions: { status: "failed" } }],
          },
        },
      });
      setShowSetup(false);
      setWebhookUrl("");
    } catch (e) {
      console.error("Failed to set up Slack:", e);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Slack notifications?")) return;
    await deleteChannel.mutateAsync("slack");
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <p className="text-sm text-muted-foreground text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure alerts for failed tool runs.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-[#4A154B] flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div>
              <h3 className="font-medium">Slack</h3>
              <p className="text-sm text-muted-foreground">
                {isConnected ? "Connected" : "Not configured"}
              </p>
            </div>
          </div>
          {isConnected ? (
            <div className="flex items-center gap-2">
              <Badge variant="default">Connected</Badge>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowSetup(!showSetup)}>Set Up</Button>
          )}
        </div>

        {showSetup && !isConnected && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div>
              <label className="text-sm font-medium">Slack Webhook URL</label>
              <p className="text-xs text-muted-foreground mb-2">
                Create an incoming webhook in your Slack workspace settings.
              </p>
              <Input
                placeholder="https://hooks.slack.com/services/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSetupSlack}
                disabled={!webhookUrl.trim() || updateSettings.isPending}
              >
                {updateSettings.isPending ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setShowSetup(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isConnected && slackConfig && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Active Rules</h4>
            <div className="space-y-1">
              {slackConfig.rules?.map((rule, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant={rule.enabled ? "default" : "secondary"} className="text-xs">
                    {rule.enabled ? "ON" : "OFF"}
                  </Badge>
                  <span className="text-muted-foreground">{rule.conditions.status} runs</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
