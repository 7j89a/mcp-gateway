import { useState, useEffect } from 'react'

interface Server {
  id: string
  name: string
  status: 'connected' | 'disconnected'
  tools: string[]
}

declare global {
  interface Window {
    electronAPI: {
      listServers: () => Promise<Server[]>
      connect: (serverId: string) => Promise<{ success: boolean }>
      disconnect: (serverId: string) => Promise<{ success: boolean }>
      callTool: (serverId: string, toolName: string, args: any) => Promise<any>
    }
  }
}

function App() {
  const [servers, setServers] = useState<Server[]>([])
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'servers' | 'tools' | 'logs'>('servers')

  useEffect(() => {
    loadServers()
  }, [])

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
        <h1>� gateway MCP Gateway</h1>
        <p>Local MCP Server Management</p>
      </header>

      <nav className="nav">
        <button 
          className={activeTab === 'servers' ? 'active' : ''} 
          onClick={() => setActiveTab('servers')}
        >
          Servers
        </button>
        <button 
          className={activeTab === 'tools' ? 'active' : ''} 
          onClick={() => setActiveTab('tools')}
        >
          Tools
        </button>
        <button 
          className={activeTab === 'logs' ? 'active' : ''} 
          onClick={() => setActiveTab('logs')}
        >
          Logs
        </button>
      </nav>

      <main className="main">
        {activeTab === 'servers' && (
          <div className="servers-panel">
            <div className="panel-header">
              <h2>MCP Servers</h2>
              <button className="btn-primary">+ Add Server</button>
            </div>
            
            {servers.length === 0 ? (
              <div className="empty-state">
                <p>No MCP servers configured</p>
                <p className="hint">Add a server to get started</p>
              </div>
            ) : (
              <div className="server-list">
                {servers.map(server => (
                  <div 
                    key={server.id} 
                    className={`server-card ${selectedServer === server.id ? 'selected' : ''}`}
                    onClick={() => setSelectedServer(server.id)}
                  >
                    <div className="server-info">
                      <h3>{server.name}</h3>
                      <span className={`status ${server.status}`}>
                        {server.status}
                      </span>
                    </div>
                    <div className="server-tools">
                      {server.tools.length} tools
                    </div>
                    <div className="server-actions">
                      {server.status === 'connected' ? (
                        <button onClick={() => handleDisconnect(server.id)}>Disconnect</button>
                      ) : (
                        <button onClick={() => handleConnect(server.id)}>Connect</button>
                      )}
                    </div>
                  </div>
                ))}
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
