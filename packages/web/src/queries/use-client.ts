import { useCallback } from "react";
import { GarzaGlueClient } from "@garzaglue/shared";
import { EEGarzaGlueClient } from "@/src/lib/ee-garza-glue-client";
import { useConfig } from "@/src/app/config-context";
import { tokenRegistry } from "@/src/lib/token-registry";
import { connectionMonitor } from "@/src/lib/connection-monitor";

export function useGarzaGlueClient() {
  const { apiEndpoint } = useConfig();

  return useCallback(() => {
    return new GarzaGlueClient({
      apiEndpoint,
      apiKey: tokenRegistry.getToken(),
      onInfrastructureError: () => connectionMonitor.onInfrastructureError(apiEndpoint),
    });
  }, [apiEndpoint]);
}

export function useEEGarzaGlueClient() {
  const { apiEndpoint } = useConfig();

  return useCallback(() => {
    return new EEGarzaGlueClient({
      apiEndpoint,
      apiKey: tokenRegistry.getToken(),
      onInfrastructureError: () => connectionMonitor.onInfrastructureError(apiEndpoint),
    });
  }, [apiEndpoint]);
}
