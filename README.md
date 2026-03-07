# MCP-Gateway

> Local-first MCP Server management dashboard for AI developers

MCP-Gateway is a desktop application for discovering, managing, and debugging Model Context Protocol (MCP) servers on your local machine. Built for developers who use AI coding assistants like Claude Code, Codex, and others.

![MCP Gateway](./screenshot.png)

## Why MCP Gateway?

If you use AI coding tools, you likely have MCP servers configured — but managing them is scattered across config files and CLI tools. MCP Gateway brings all your MCP servers into one beautiful interface.

## Features

- 🔍 **Auto-Discovery** — Automatically detects MCP servers from:
  - Claude Code (`~/.claude/mcp.json`, `~/.claude/.mcp.json`)
  - Codex (`~/.codex/config.toml`)
  - Project-level `mcp.json` files
  - `MCP_*` environment variables

- 🖥️ **Server Management** — Connect, disconnect, and monitor MCP servers
- 🔧 **Tool Explorer** — Browse tools available on each server
- 📊 **Call Monitoring** — Track tool invocations with request/response payloads
- 🐛 **Debug Mode** — Inspect timing, errors, and full request/response data
- 🔒 **Local-First** — All data stays on your machine

## Installation

### Prerequisites

- Node.js 18+
- macOS / Windows / Linux

### Install

```bash
# Clone the repo
git clone https://github.com/ZSeven-W/mcp-gateway.git
cd mcp-gateway

# Install dependencies
npm install

# Start development
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Package as macOS app
npm run build:mac
```

## Usage

1. Launch the app — MCP servers are auto-discovered
2. Click **Connect** on any server to activate it
3. Browse available tools in the **Tools** tab
4. Monitor all tool calls in the **Logs** tab

## Tech Stack

- **Framework**: Electron
- **UI**: React + TypeScript
- **Styling**: CSS (custom dark theme)
- **MCP SDK**: @modelcontextprotocol/sdk

## Topics

`#mcp` `#model-context-protocol` `#ai-agents` `#developer-tools` `#electron` `#claude-code` `#codex` `#mcp-servers` `#local-first` `#desktop-app`

## Alternatives

- [Smithery](https://smithery.ai/) — Cloud-first MCP management
- [MCP Hub](https://github.com/mcp-hub) — Another cloud option

## License

MIT
