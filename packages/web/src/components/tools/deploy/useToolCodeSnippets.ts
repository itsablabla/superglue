import { useConfig } from "@/src/app/config-context";
import { useMemo } from "react";
import { safeStringify } from "@garzaglue/shared";

export interface ToolCodeSnippets {
  typescriptCode: string;
  pythonCode: string;
  curlCommand: string;
  mcpConfig: string;
}

export function useToolCodeSnippets(
  toolId: string,
  payload: Record<string, any> = {},
): ToolCodeSnippets {
  const config = useConfig();

  return useMemo(() => {
    const typescriptCode = `const response = await fetch("${config.apiEndpoint}/v1/tools/${toolId}/run", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer <YOUR_API_KEY>"
  },
  body: JSON.stringify({
    inputs: ${safeStringify(payload, 2)}
  })
});

const result = await response.json();
console.log(result.data);`;

    const pythonCode = `import requests

response = requests.post(
    "${config.apiEndpoint}/v1/tools/${toolId}/run",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer <YOUR_API_KEY>"
    },
    json={
        "inputs": ${safeStringify(payload, 2)}
    }
)

result = response.json()
print(result["data"])`;

    const curlCommand = `curl -X POST "${config.apiEndpoint}/v1/tools/${toolId}/run" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -d '${safeStringify({ inputs: payload })}'`;

    const mcpConfig = `{
  "mcpServers": {
    "garzaglue": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "${config.apiEndpoint.includes("https://api.garzaglue") ? "https://mcp.garzaglue.ai" : `${config.apiEndpoint}/mcp`}",
        "--header",
        "Authorization:\${AUTH_HEADER}"
      ],
      "env": {
        "AUTH_HEADER": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}`;

    return {
      typescriptCode,
      pythonCode,
      curlCommand,
      mcpConfig,
    };
  }, [config.apiEndpoint, config.apiEndpoint, toolId, payload]);
}
