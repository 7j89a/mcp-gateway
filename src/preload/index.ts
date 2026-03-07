import { contextBridge, ipcRenderer } from 'electron'
import type { DiscoveredServer } from '../shared/types'

interface ConnectResult {
  success: boolean
  serverId: string
}

contextBridge.exposeInMainWorld('electronAPI', {
  discoverServers: () => ipcRenderer.invoke('mcp:discover') as Promise<DiscoveredServer[]>,
  listServers: () => ipcRenderer.invoke('mcp:list-servers') as Promise<DiscoveredServer[]>,
  connect: (serverId: string) => ipcRenderer.invoke('mcp:connect', serverId) as Promise<ConnectResult>,
  disconnect: (serverId: string) =>
    ipcRenderer.invoke('mcp:disconnect', serverId) as Promise<ConnectResult>,
  callTool: (serverId: string, toolName: string, args: unknown) =>
    ipcRenderer.invoke('mcp:call-tool', serverId, toolName, args)
})
