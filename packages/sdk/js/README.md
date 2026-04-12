# GarzaGlue TypeScript SDK

Auto-generated TypeScript SDK for the GarzaGlue AI API.

## Installation

```bash
npm install @garzaglue/client
```

## Usage

```typescript
import { configure, listTools, runTool, getRun, cancelRun } from "@garzaglue/client";

// Configure once at startup
configure({
  apiKey: "YOUR_API_KEY",
  baseUrl: "https://api.garzaglue.ai/v1", // optional
});

// List tools
const { data: tools } = await listTools({ page: 1, limit: 10 });
console.log(tools.data);

// Run a tool (sync - waits for completion)
const { data: run } = await runTool("your-tool-id", {
  inputs: { query: "latest AI news" },
  options: { async: false },
});
console.log(run.data);

// Run a tool (async - returns immediately)
const { data: asyncRun } = await runTool("your-tool-id", {
  inputs: { query: "latest AI news" },
  options: { async: true },
});

// Poll for completion
let status = asyncRun;
while (status.status === "running") {
  await new Promise((r) => setTimeout(r, 1000));
  const { data } = await getRun(status.runId);
  status = data;
}
if (status.status === "success") {
  console.log(status.data);
} else {
  console.error(status.error);
}

// Cancel a run
await cancelRun("run-id-to-cancel");
```

## Generation

This SDK is auto-generated from the OpenAPI specification using [orval](https://orval.dev/):

```bash
npm run generate
```

## License

MIT - See [LICENSE](./LICENSE) for details.
