import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'

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
ipcMain.handle('mcp:list-servers', async () => {
  // TODO: Implement MCP server discovery
  return []
})

ipcMain.handle('mcp:connect', async (_, serverId: string) => {
  // TODO: Implement MCP server connection
  return { success: true, serverId }
})

ipcMain.handle('mcp:disconnect', async (_, serverId: string) => {
  // TODO: Implement MCP server disconnection
  return { success: true, serverId }
})

ipcMain.handle('mcp:call-tool', async (_, serverId: string, toolName: string, args: any) => {
  // TODO: Implement tool call
  return { result: null }
})
