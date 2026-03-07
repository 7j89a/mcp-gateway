# CLAUDE.md - Project Conventions

## Overview

MCP-Gateway is an Electron-based local dashboard for managing Model Context Protocol (MCP) servers.

## Project Structure

```
mcp-gateway/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # React frontend
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page views
│   │   └── hooks/      # React hooks
│   └── preload/        # Preload scripts
├── package.json
└── electron-builder.yml
```

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run build:mac` - Package as macOS app

## Tech Stack

- Electron
- React + TypeScript
- Tailwind CSS
- @modelcontextprotocol/sdk

## Conventions

- Use functional components with hooks
- Follow existing code style
- Add TypeScript types for new interfaces
