<p align="center">
  <img src="https://github.com/user-attachments/assets/be0e65d4-dcd8-4133-9841-b08799e087e7" width="350" alt="garzaglue_logo_white">
</p>

<h2 align="center">Build production-grade integrations & tools in natural language.</h2>
<div align="center">
  
[![Y Combinator](https://img.shields.io/badge/Y%20Combinator-W25-orange?style=flat-square)](https://www.ycombinator.com/companies/garzaglue)
[![Client SDK](https://img.shields.io/npm/v/@garzaglue/client?style=flat-square&logo=npm)](https://www.npmjs.com/package/@garzaglue/client)
[![Docker](https://img.shields.io/docker/pulls/garzaglueai/garzaglue?style=flat-square&logo=Docker)](https://hub.docker.com/r/garzaglueai/garzaglue)
[![Weave Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fapp.workweave.ai%2Fapi%2Frepository%2Fbadge%2Forg_0S2o9PLamHvNsTjHbszc38vC%2F914997268&cacheSeconds=3600&labelColor=#EC6341)](https://app.workweave.ai/reports/repository/org_0S2o9PLamHvNsTjHbszc38vC/914997268)

</div>

## What is garzaglue?

- Garza Glue is an AI-powered tool builder that works with any API, database or file storage server
- Abstracts away authentication, documentation handling and data mapping between systems
- Self‑heals tools: When steps fail due to upstream API changes, garzaglue can auto-repair failures to keep your tools running

## What people build with garzaglue

- Lightweight and maintainable data syncing tools across legacy systems
- Migrations of complex SQL procedures to REST API calls in cloud migrations
- Enterprise GPT tools: expose tools that work with custom legacy systems in your enterprise GPT

## Quick Start

### Option 1: Sign up to [garzaglue](https://app.garzaglue.com) and start building immediately

### Option 2: [Self-host](https://docs.garzaglue.com/getting-started/setup#self-hosted) for maximum control and customization

## Interfaces

You can interact with garzaglue via three interfaces, regardless of whether you self-host or use the hosted version:

**Web application**

- The web application is available for self-hosted and garzaglue-hosted setups
- If you decide to use a garzaglue-hosted setup, the web application has features that are not available when self-hosting (e.g. the garzaglue agent)
- When doing local development on your self-hosted setup, you can customize the web application to your needs

**garzaglue SDK**

- The garzaglue SDK offers CRUD functionality for all garzaglue data types and lets you execute tools programmatically
- For more detailed information on SDK functionality, check our [SDK guide](https://docs.garzaglue.com/sdk/overview)

  Install via npm:

  ```bash
    npm install @garzaglue/client
  ```

  Client setup:

  ```javascript
  // Typescript SDK
  import { GarzaGlueClient } from "@garzaglue/client";

  const garzaglue = new GarzaGlueClient({
    apiKey: "your_api_key_here", // Get from app.garzaglue.com
  });
  ```

**MCP Server**

- Look at our [MCP Guide](https://docs.garzaglue.com/mcp/using-the-mcp) for full installation instructions
- The MCP interface gives you discoverability tools and execution capabilities for your pre-built garzaglue tools
- The MCP does not support ad-hoc integration creation or tool building
- Use MCP in production for agentic use cases and internal GPTs to access and execute pre-built tools with full control

## 📖 Documentation

For detailed documentation, visit [docs.garzaglue.com](https://docs.garzaglue.com).

## 🤝 Contributing

We love contributions! Before making contributions, we ask that all users read through our [contribution guide](https://github.com/superglue-ai/superglue/blob/main/CONTRIBUTING.md) and sign the Contributor License Agreement (CLA). When creating new issues or pull requests, please ensure compliance with the contribution guide.

[//]: # "To contribute to the docs, check out the /docs folder."

## License

Garza Glue is FSL licensed. The garzaglue client SDKs are MIT licensed. See [LICENSE](LICENSE) for details.

## Next Steps

- [Join our Discord](https://discord.gg/vUKnuhHtfW)
- [Read our docs](https://docs.garzaglue.com/)
- [Talk to us](https://cal.com/garzaglue/garzaglue-demo)

Text us! <br>
[![Twitter Adina](https://img.shields.io/twitter/follow/adinagoerres?style=flat-square&logo=X)](https://twitter.com/adinagoerres)
[![Twitter Stefan](https://img.shields.io/twitter/follow/sfaistenauer?style=flat-square&logo=X)](https://twitter.com/sfaistenauer)
[![Twitter](https://img.shields.io/twitter/follow/garzaglue_d?style=social)](https://twitter.com/garzaglue_d)
