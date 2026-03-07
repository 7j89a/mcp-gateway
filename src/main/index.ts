import { app, BrowserWindow, ipcMain } from 'electron'
import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { homedir } from 'os'
import { join, relative } from 'path'
import type { DiscoveredServer, MCPServerConnection, ServerSource, ServerStatus } from '../shared/types'

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

interface ServerCandidate {
  name: string
  source: ServerSource
  sourceDetail?: string
  connection: MCPServerConnection
  env: Record<string, string>
}

interface MutableCodexServer {
  command?: string
  args?: string[]
  url?: string
  env: Record<string, string>
}

const connectionState = new Map<string, ServerStatus>()
const discoveredCache = new Map<string, DiscoveredServer>()

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function parseArgs(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const parsed = value.map((item) => String(item)).filter((item) => item.length > 0)
    return parsed.length > 0 ? parsed : undefined
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const trimmed = value.trim()

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsedJson = JSON.parse(trimmed) as JsonValue
        return parseArgs(parsedJson)
      } catch {
        // Fall through to space-split parsing.
      }
    }

    return trimmed.split(/\s+/).filter((entry) => entry.length > 0)
  }

  return undefined
}

function parseEnv(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {}
  }

  return Object.entries(value).reduce<Record<string, string>>((acc, [key, entry]) => {
    if (entry !== undefined && entry !== null) {
      acc[key] = String(entry)
    }
    return acc
  }, {})
}

function extractServersFromJson(input: unknown, source: ServerSource, sourceDetail?: string): ServerCandidate[] {
  if (!isRecord(input)) {
    return []
  }

  const serverRoot =
    (isRecord(input.mcpServers) && input.mcpServers) ||
    (isRecord(input.mcp_servers) && input.mcp_servers) ||
    (isRecord(input.servers) && input.servers)

  if (!serverRoot) {
    return []
  }

  return Object.entries(serverRoot).flatMap(([name, config]) => {
    if (!isRecord(config)) {
      return []
    }

    const connection: MCPServerConnection = {
      command: typeof config.command === 'string' ? config.command : undefined,
      args: parseArgs(config.args),
      url: typeof config.url === 'string' ? config.url : undefined
    }

    if (!connection.command && !connection.url) {
      return []
    }

    return [{ name, source, sourceDetail, connection, env: parseEnv(config.env) }]
  })
}

async function readJsonFile(filePath: string): Promise<unknown | null> {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

function parseTomlString(value: string): string {
  const unquoted = value.slice(1, -1)
  return unquoted
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

function splitTomlCsv(value: string): string[] {
  const entries: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]

    if (quote) {
      if (char === quote && value[i - 1] !== '\\') {
        quote = null
      }
      current += char
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      current += char
      continue
    }

    if (char === ',') {
      const trimmed = current.trim()
      if (trimmed.length > 0) {
        entries.push(trimmed)
      }
      current = ''
      continue
    }

    current += char
  }

  const tail = current.trim()
  if (tail.length > 0) {
    entries.push(tail)
  }

  return entries
}

function parseTomlValue(rawValue: string): unknown {
  const value = rawValue.trim()

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return parseTomlString(value)
  }

  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim()
    if (inner.length === 0) {
      return []
    }
    return splitTomlCsv(inner).map((entry) => parseTomlValue(entry))
  }

  if (value.startsWith('{') && value.endsWith('}')) {
    const inner = value.slice(1, -1).trim()
    if (inner.length === 0) {
      return {}
    }

    return splitTomlCsv(inner).reduce<Record<string, string>>((acc, entry) => {
      const keyValue = entry.match(/^([A-Za-z0-9_\-.]+)\s*=\s*(.+)$/)
      if (!keyValue) {
        return acc
      }

      const parsed = parseTomlValue(keyValue[2])
      if (parsed !== undefined && parsed !== null) {
        acc[keyValue[1]] = String(parsed)
      }
      return acc
    }, {})
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  if (!Number.isNaN(Number(value))) {
    return Number(value)
  }

  return value
}

function parseCodexTomlServers(content: string): ServerCandidate[] {
  const servers = new Map<string, MutableCodexServer>()
  let sectionServer: string | null = null
  let inEnvSection = false

  const lines = content.split(/\r?\n/)
  for (const rawLine of lines) {
    const lineWithoutComments = rawLine.replace(/\s+#.*$/, '').trim()
    if (!lineWithoutComments) {
      continue
    }

    const sectionMatch = lineWithoutComments.match(/^\[([^\]]+)\]$/)
    if (sectionMatch) {
      const sectionName = sectionMatch[1]
      const envMatch = sectionName.match(/^(?:mcp_servers|mcpServers)\.([^.]+)\.env$/)
      if (envMatch) {
        sectionServer = envMatch[1]
        inEnvSection = true
        if (!servers.has(sectionServer)) {
          servers.set(sectionServer, { env: {} })
        }
        continue
      }

      const serverMatch = sectionName.match(/^(?:mcp_servers|mcpServers)\.([^.]+)$/)
      if (serverMatch) {
        sectionServer = serverMatch[1]
        inEnvSection = false
        if (!servers.has(sectionServer)) {
          servers.set(sectionServer, { env: {} })
        }
        continue
      }

      sectionServer = null
      inEnvSection = false
      continue
    }

    if (!sectionServer) {
      continue
    }

    const keyValueMatch = lineWithoutComments.match(/^([A-Za-z0-9_\-.]+)\s*=\s*(.+)$/)
    if (!keyValueMatch) {
      continue
    }

    const key = keyValueMatch[1]
    const parsedValue = parseTomlValue(keyValueMatch[2])
    const server = servers.get(sectionServer)
    if (!server) {
      continue
    }

    if (inEnvSection) {
      if (parsedValue !== undefined && parsedValue !== null) {
        server.env[key] = String(parsedValue)
      }
      continue
    }

    if (key === 'command' && typeof parsedValue === 'string') {
      server.command = parsedValue
      continue
    }

    if (key === 'url' && typeof parsedValue === 'string') {
      server.url = parsedValue
      continue
    }

    if (key === 'args') {
      server.args = parseArgs(parsedValue)
      continue
    }

    if (key === 'env' && isRecord(parsedValue)) {
      server.env = parseEnv(parsedValue)
    }
  }

  return Array.from(servers.entries()).flatMap(([name, config]) => {
    const connection: MCPServerConnection = {
      command: config.command,
      args: config.args,
      url: config.url
    }

    if (!connection.command && !connection.url) {
      return []
    }

    return [
      {
        name,
        source: 'Codex',
        sourceDetail: '~/.codex/config.toml',
        connection,
        env: config.env
      }
    ]
  })
}

async function readCodexServers(filePath: string): Promise<ServerCandidate[]> {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return parseCodexTomlServers(content)
  } catch {
    return []
  }
}

const PROJECT_SCAN_IGNORES = new Set([
  '.git',
  '.idea',
  '.next',
  '.vscode',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'target'
])

async function findProjectMcpFiles(root: string, depth = 0): Promise<string[]> {
  if (depth > 6) {
    return []
  }

  let entries
  try {
    entries = await fs.readdir(root, { withFileTypes: true })
  } catch {
    return []
  }

  const results: string[] = []
  for (const entry of entries) {
    if (entry.name === 'mcp.json' && entry.isFile()) {
      results.push(join(root, entry.name))
      continue
    }

    if (!entry.isDirectory() || entry.isSymbolicLink()) {
      continue
    }

    if (PROJECT_SCAN_IGNORES.has(entry.name)) {
      continue
    }

    const childPath = join(root, entry.name)
    const childResults = await findProjectMcpFiles(childPath, depth + 1)
    results.push(...childResults)
  }

  return results
}

async function readProjectServers(projectRoot: string): Promise<ServerCandidate[]> {
  const files = await findProjectMcpFiles(projectRoot)
  const discovered = await Promise.all(
    files.map(async (filePath) => {
      const json = await readJsonFile(filePath)
      const detail = relative(projectRoot, filePath) || 'mcp.json'
      return extractServersFromJson(json, 'Project', detail)
    })
  )

  return discovered.flat()
}

function parseEnvironmentServers(): ServerCandidate[] {
  const byName = new Map<string, ServerCandidate>()

  const bundledServers = process.env.MCP_SERVERS
  if (bundledServers) {
    try {
      const parsed = JSON.parse(bundledServers) as JsonValue
      extractServersFromJson(parsed, 'Environment', 'MCP_SERVERS').forEach((server) => {
        byName.set(`json:${server.name}`, server)
      })
    } catch {
      // Ignore invalid JSON.
    }
  }

  const entries = Object.entries(process.env)
  for (const [key, rawValue] of entries) {
    if (!key.startsWith('MCP_') || !rawValue) {
      continue
    }

    const directMatch = key.match(/^MCP_([A-Z0-9]+)_(COMMAND|ARGS|URL)$/)
    if (directMatch) {
      const name = directMatch[1].toLowerCase()
      const configKey = directMatch[2]
      const mapKey = `env:${name}`
      const existing = byName.get(mapKey) ?? {
        name,
        source: 'Environment' as const,
        sourceDetail: 'MCP_*',
        connection: {},
        env: {}
      }

      if (configKey === 'COMMAND') {
        existing.connection.command = rawValue
      } else if (configKey === 'URL') {
        existing.connection.url = rawValue
      } else if (configKey === 'ARGS') {
        existing.connection.args = parseArgs(rawValue)
      }

      byName.set(mapKey, existing)
      continue
    }

    const envMatch = key.match(/^MCP_([A-Z0-9]+)_ENV_([A-Z0-9_]+)$/)
    if (!envMatch) {
      continue
    }

    const name = envMatch[1].toLowerCase()
    const envKey = envMatch[2]
    const mapKey = `env:${name}`
    const existing = byName.get(mapKey) ?? {
      name,
      source: 'Environment' as const,
      sourceDetail: 'MCP_*',
      connection: {},
      env: {}
    }

    existing.env[envKey] = rawValue
    byName.set(mapKey, existing)
  }

  return Array.from(byName.values()).filter((server) => {
    return Boolean(server.connection.command || server.connection.url)
  })
}

function buildServerId(candidate: ServerCandidate): string {
  const hashInput = `${candidate.source}|${candidate.sourceDetail ?? ''}|${candidate.name}|${candidate.connection.command ?? ''}|${candidate.connection.url ?? ''}|${(candidate.connection.args ?? []).join(' ')}`
  const shortHash = createHash('sha1').update(hashInput).digest('hex').slice(0, 12)
  return `${candidate.source.toLowerCase().replace(/\s+/g, '-')}:${candidate.name}:${shortHash}`
}

function normalizeServer(candidate: ServerCandidate): DiscoveredServer {
  const id = buildServerId(candidate)

  return {
    id,
    name: candidate.name,
    source: candidate.source,
    sourceDetail: candidate.sourceDetail,
    status: connectionState.get(id) ?? 'disconnected',
    tools: [],
    connection: {
      command: candidate.connection.command,
      args: candidate.connection.args,
      url: candidate.connection.url
    },
    env: candidate.env
  }
}

async function discoverServers(): Promise<DiscoveredServer[]> {
  const home = homedir()
  const claudePath = join(home, '.claude', 'mcp.json')
  const codexPath = join(home, '.codex', 'config.toml')

  const [claudeJson, codexServers, projectServers] = await Promise.all([
    readJsonFile(claudePath),
    readCodexServers(codexPath),
    readProjectServers(process.cwd())
  ])

  const claudeServers = extractServersFromJson(claudeJson, 'Claude Code', '~/.claude/mcp.json')
  const envServers = parseEnvironmentServers()

  const normalized = [...claudeServers, ...codexServers, ...projectServers, ...envServers]
    .map((server) => normalizeServer(server))
    .sort((left, right) => {
      const sourceCompare = left.source.localeCompare(right.source)
      if (sourceCompare !== 0) {
        return sourceCompare
      }
      return left.name.localeCompare(right.name)
    })

  discoveredCache.clear()
  normalized.forEach((server) => {
    discoveredCache.set(server.id, server)
  })

  return normalized
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers for MCP operations
ipcMain.handle('mcp:discover', async () => {
  return discoverServers()
})

ipcMain.handle('mcp:list-servers', async () => {
  return discoverServers()
})

ipcMain.handle('mcp:connect', async (_, serverId: string) => {
  if (!discoveredCache.has(serverId)) {
    await discoverServers()
  }

  if (!discoveredCache.has(serverId)) {
    return { success: false, serverId }
  }

  connectionState.set(serverId, 'connected')
  return { success: true, serverId }
})

ipcMain.handle('mcp:disconnect', async (_, serverId: string) => {
  connectionState.set(serverId, 'disconnected')
  return { success: true, serverId }
})

ipcMain.handle('mcp:call-tool', async (_, _serverId: string, _toolName: string, _args: unknown) => {
  // TODO: Implement tool call
  return { result: null }
})
