export type ServerStatus = 'connected' | 'disconnected'

export type ServerSource =
  | 'Claude Code'
  | 'Codex'
  | 'Project'
  | 'Environment'

export interface MCPServerConnection {
  command?: string
  args?: string[]
  url?: string
}

export interface DiscoveredServer {
  id: string
  name: string
  source: ServerSource
  sourceDetail?: string
  status: ServerStatus
  tools: string[]
  connection: MCPServerConnection
  env: Record<string, string>
}
