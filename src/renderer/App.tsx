import { useEffect, useState } from 'react'
import type { DiscoveredServer } from '../shared/types'

declare global {
  interface Window {
    electronAPI: {
      discoverServers: () => Promise<DiscoveredServer[]>
      listServers: () => Promise<DiscoveredServer[]>
      connect: (serverId: string) => Promise<{ success: boolean; serverId: string }>
      disconnect: (serverId: string) => Promise<{ success: boolean; serverId: string }>
      callTool: (serverId: string, toolName: string, args: unknown) => Promise<unknown>
    }
  }
}

function App() {
  const [servers, setServers] = useState<DiscoveredServer[]>([])
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'servers' | 'tools' | 'logs'>('servers')

  useEffect(() => {
    discoverServers()
  }, [])

  const discoverServers = async () => {
    const discovered = await window.electronAPI.discoverServers()
    setServers(discovered)
  }

  const loadServers = async () => {
    const serverList = await window.electronAPI.listServers()
    setServers(serverList)
  }

  const handleConnect = async (serverId: string) => {
    await window.electronAPI.connect(serverId)
    loadServers()
  }

  const handleDisconnect = async (serverId: string) => {
    await window.electronAPI.disconnect(serverId)
    loadServers()
  }

  return (
    <div className="app">
      <header className="header">
        <h1>MCP Gateway</h1>
        <p>Local MCP Server Management</p>
      </header>

      <nav className="nav">
        <button className={activeTab === 'servers' ? 'active' : ''} onClick={() => setActiveTab('servers')}>
          Servers
        </button>
        <button className={activeTab === 'tools' ? 'active' : ''} onClick={() => setActiveTab('tools')}>
          Tools
        </button>
        <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
          Logs
        </button>
      </nav>

      <main className="main">
        {activeTab === 'servers' && (
          <div className="servers-panel">
            <div className="panel-header">
              <h2>MCP Servers</h2>
              <button className="btn-primary" onClick={discoverServers}>
                Refresh Discovery
              </button>
            </div>

            {servers.length === 0 ? (
              <div className="empty-state">
                <p>No MCP servers discovered</p>
                <p className="hint">Checked Claude Code, Codex, project files, and MCP_* env vars</p>
              </div>
            ) : (
              <div className="server-list">
                {servers.map((server) => {
                  const connectionSummary = server.connection.url
                    ? server.connection.url
                    : [server.connection.command, ...(server.connection.args ?? [])]
                        .filter(Boolean)
                        .join(' ')

                  const envCount = Object.keys(server.env).length

                  return (
                    <div
                      key={server.id}
                      className={`server-card ${selectedServer === server.id ? 'selected' : ''}`}
                      onClick={() => setSelectedServer(server.id)}
                    >
                      <div className="server-info">
                        <h3>{server.name}</h3>
                        <span className={`status ${server.status}`}>{server.status}</span>
                      </div>
                      <div className="server-tools">{server.tools.length} tools</div>
                      <div className="hint">Source: {server.source}</div>
                      {server.sourceDetail ? <div className="hint">Path: {server.sourceDetail}</div> : null}
                      {connectionSummary ? <div className="hint">Connect: {connectionSummary}</div> : null}
                      <div className="hint">Env vars: {envCount}</div>
                      <div className="server-actions">
                        {server.status === 'connected' ? (
                          <button onClick={() => handleDisconnect(server.id)}>Disconnect</button>
                        ) : (
                          <button onClick={() => handleConnect(server.id)}>Connect</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="tools-panel">
            <h2>Available Tools</h2>
            <p className="hint">Select a server to view its tools</p>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-panel">
            <h2>Call Logs</h2>
            <p className="hint">Tool call history will appear here</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
