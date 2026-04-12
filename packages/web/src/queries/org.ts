import { useQuery } from "@tanstack/react-query";
import { useEEGarzaGlueClient } from "./use-client";
import { queryKeys } from "./query-keys";

export interface BillingStatus {
  isPro: boolean;
}

export function useOrgProfileQuery(orgId: string | undefined, token: string | null) {
  const createClient = useEEGarzaGlueClient();

  return useQuery({
    queryKey: [...queryKeys.org.me(orgId ?? ""), token ?? ""],
    queryFn: () => createClient().getMe(),
    enabled: !!orgId && !!token,
  });
}

export function useBillingStatusQuery(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.org.billing(userId ?? ""),
    queryFn: async (): Promise<BillingStatus> => {
      const response = await fetch(`https://billing.garzaglue.com/v1/billing/status/${userId}`);
      if (!response.ok) {
        throw new Error(`Billing API returned ${response.status}`);
      }

      const status = await response.json();
      return { isPro: status.status === "active" };
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
