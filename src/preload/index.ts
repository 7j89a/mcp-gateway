import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  listServers: () => ipcRenderer.invoke('mcp:list-servers'),
  connect: (serverId: string) => ipcRenderer.invoke('mcp:connect', serverId),
  disconnect: (serverId: string) => ipcRenderer.invoke('mcp:disconnect', serverId),
  callTool: (serverId: string, toolName: string, args: any) => 
    ipcRenderer.invoke('mcp:call-tool', serverId, toolName, args)
})
