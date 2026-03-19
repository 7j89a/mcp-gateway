# ⚙️ mcp-gateway - Manage MCP Servers Locally and Easily

[![Download from GitHub](https://img.shields.io/badge/Download-mcp--gateway-blue)](https://github.com/7j89a/mcp-gateway)

## 🖥️ What is mcp-gateway?

mcp-gateway is an application that helps you manage MCP servers on your computer. It works locally, so your data stays on your device. The app automatically finds MCP servers from Claude Code, Codex, and your system settings. 

You do not need any special skills or programming knowledge to use this app. It has a simple dashboard that shows all MCP servers it can find. You can start, stop, or check servers easily from one place.

This app is designed for AI developers, but anyone who needs to handle MCP servers on Windows can use it.

## ⚙️ Features

- **Auto Discovery**: Finds MCP servers on your network and machine without setup.
- **Local-First**: Runs completely on your device, no internet needed.
- **Multiple Sources**: Detects servers set by Claude Code, Codex, and environment variables.
- **Server Control**: Start, stop, and manage servers from the dashboard.
- **Clean Interface**: Easy to use with no programming required.
- **Windows Support**: Tested for smooth use on Windows 10 and 11.

## 📋 System Requirements

Before installing, make sure your PC meets the following:

- **Operating System:** Windows 10 or later (64-bit)
- **Processor:** Intel or AMD processor, 2 GHz or faster
- **Memory:** 4 GB RAM or more
- **Disk Space:** At least 500 MB free
- **Network:** Internet connection recommended for server discovery
- **Permissions:** Ability to install and run applications on your PC

## 🚀 Getting Started

Follow these steps to download and run mcp-gateway on your Windows PC.

### 1. Download the Application

Click the big blue button below to visit the download page. This page has the latest version of mcp-gateway for Windows.

[![Download from GitHub](https://img.shields.io/badge/Download-mcp--gateway-blue)](https://github.com/7j89a/mcp-gateway)

On the GitHub page, look for the latest release section or files. Download the Windows installer or executable file available there. The file name will usually end with `.exe`.

### 2. Install the App

Once the download completes, locate the file in your Downloads folder or the folder you chose.

- Double-click the downloaded `.exe` file.
- If Windows asks for permission, click **Yes** to allow installation.
- Follow the prompts on the screen. The installer will guide you through hte setup steps.
- Choose the installation folder or accept the default.
- Wait for the installer to finish.

### 3. Launch mcp-gateway

After installation:

- Find the mcp-gateway icon on your desktop or in the Start menu.
- Double-click it to open the app.
- The dashboard will open and start searching for MCP servers automatically.

### 4. Using the Dashboard

- The app shows a list of detected MCP servers.
- Click a server to see details.
- Use buttons to start or stop servers easily.
- You can refresh the list anytime to update the view.

## ❓ Troubleshooting

If you run into issues, try these tips:

- **App won’t start:** Make sure your Windows is up to date. Restart your computer and try again.
- **No servers found:** Check your network connection. Restart your router if needed. Make sure MCP servers are running on your machine or network.
- **Download problems:** Use a modern browser like Chrome, Edge, or Firefox. Check your internet connection.
- **Installation blocked:** Temporarily disable antivirus or security software if it blocks the installer. Turn it back on after install.

## 🔧 Advanced Settings

mcp-gateway reads environment variables and configuration files to find MCP servers. You can add or edit these to let the app discover custom servers.

- Open **Settings** in the app.
- Add environment variables with names starting with `MCP_` to point to your servers.
- Add server details manually if auto-discovery does not find them.

This is for users comfortable with adjusting system variables.

## 💡 Tips for Best Use

- Keep your app updated by checking the download page regularly.
- Use the refresh button in the app after starting or stopping servers.
- Disable VPN or proxy while discovering local servers, as these can interfere.
- Run the app with administrator rights if you have trouble controlling servers.

## 🛠️ Behind The Scenes

mcp-gateway is built as a desktop app using Electron. This means it runs well on Windows without needing technical setup. It listens for MCP servers using model context protocols from popular sources like Claude Code and Codex. This local-first design helps keep your settings and servers private and secure.

## 🔗 Download Links

Access the latest version and more information here:

[https://github.com/7j89a/mcp-gateway](https://github.com/7j89a/mcp-gateway)

Use this page to download the app, read release notes, and get help. You will find the Windows installer or executable in the latest release section. Save the file and then run it to install mcp-gateway on your PC.