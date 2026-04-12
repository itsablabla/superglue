import { useQuery } from "@tanstack/react-query";
import { Tool } from "@garzaglue/shared";
import { queryKeys } from "./query-keys";
import { useEEGarzaGlueClient } from "./use-client";
import { useOrg } from "@/src/app/org-context";

export interface ToolHistoryEntry {
  version: number;
  createdAt: string;
  createdByUserId?: string;
  createdByEmail?: string;
  tool: Tool;
}

export function useToolHistory(toolId: string | undefined) {
  const { orgId } = useOrg();
  const createClient = useEEGarzaGlueClient();

  return useQuery<ToolHistoryEntry[]>({
    queryKey: queryKeys.tools.history(orgId, toolId ?? ""),
    queryFn: async () => {
      const client = createClient();
      return client.listToolHistory(toolId!);
    },
    enabled: !!orgId && !!toolId,
  });
}
