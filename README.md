# MCP-Gateway

Local-first MCP (Model Context Protocol) server management dashboard.

Manage your local MCP servers, configure tools, monitor calls, and debug — all from a beautiful local dashboard.

## Features

- **Server Management**: Install, configure, and manage local MCP servers
- **Tool Explorer**: Browse and test tools provided by each MCP server
- **Call Monitoring**: Real-time visualization of tool invocations
- **Debug Mode**: Inspect request/response payloads, timing, and errors
- **Local-First**: All data stays on your machine

## Motivation

Model Context Protocol (MCP) is becoming the standard for AI Agents. Developers need a way to manage local MCP servers, configure tools, and debug calls. Existing solutions (Smithery, MCP Hub) are cloud-first. MCP-Gateway brings the same capability to your local machine.

## Installation

```bash
# Clone the repo
git clone https://github.com/ZSeven-W/mcp-gateway.git
cd mcp-gateway

# Install dependencies
npm install

# Start development
npm run dev
```

## Usage

1. Launch the app
2. Add MCP servers via the UI (or use built-in ones)
3. Browse available tools
4. Monitor and debug tool calls in real-time

## Development

```bash
# Build for production
npm run build

# Package as macOS app
npm run build:mac
```

## Tech Stack

- **Framework**: Electron
- **UI**: React + TypeScript
- **Styling**: Tailwind CSS
- **MCP**: @modelcontextprotocol/sdk

## License

MIT
