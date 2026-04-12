"use client";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from "@/src/queries/api-keys";
import { Copy, Key, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function ApiKeysPage() {
  const { data: apiKeys, isLoading } = useApiKeys();
  const createApiKey = useCreateApiKey();
  const deleteApiKey = useDeleteApiKey();
  const [newKey, setNewKey] = useState<string | null>(null);

  const handleCreate = async () => {
    const result = await createApiKey.mutateAsync({});
    if (result?.key) {
      setNewKey(result.key);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;
    await deleteApiKey.mutateAsync(id);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage API keys for programmatic access.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={createApiKey.isPending} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Key
        </Button>
      </div>

      {newKey && (
        <Card className="p-4 border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <p className="text-sm font-medium mb-2">
            New API key created. Copy it now — it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-background px-3 py-2 rounded border flex-1 truncate">
              {newKey}
            </code>
            <Button variant="outline" size="icon" onClick={() => handleCopy(newKey)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground text-center">Loading API keys...</p>
        </Card>
      ) : !apiKeys || apiKeys.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground text-center">
            No API keys. Create one to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <Card key={key.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <code className="text-sm font-medium">
                      {`${key.id.slice(0, 12)}...`}
                    </code>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                      {" · "}{key.mode} mode
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(key.id)}
                  disabled={deleteApiKey.isPending}
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
