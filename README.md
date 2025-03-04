# Nexus MCP Bridge for VSCode

A lightweight bridge extension that lets Claude Desktop connect to your VSCode workspace via Model Context Protocol (MCP).

## Features

- **Minimal Memory Footprint**: Designed to be lightweight and efficient
- **Automatic Startup**: Can start automatically when VSCode launches
- **Status Bar Integration**: Easily see and control the bridge status
- **File System Access**: Enables Claude to read and write files in your workspace
- **Directory Management**: Create directories and list contents
- **Security Controls**: Configure which paths are accessible

## Why Use This Bridge?

If you're using Claude Desktop with VSCode, this bridge allows you to:

1. **Reduce Memory Usage**: Lightweight and efficient
2. **Stay in VSCode**: No need to context switch between applications
3. **Protect Your System**: Only expose directories you explicitly allow

## Installation

1. Install the extension from the VSIX file
2. Configure your settings (optional)
3. The bridge will start automatically if configured, or you can start it manually

## Setup for Claude Desktop

In Claude Desktop, configure your `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "nexus-bridge": {
      "url": "http://localhost:3000/mcp",
      "disabled": false,
      "alwaysAllow": [
        "get_system_info",
        "read_file",
        "write_file",
        "create_directory",
        "list_directory",
        "get_project_status"
      ]
    }
  }
}
```

## Configuration

You can configure the extension in your VSCode settings:

```json
{
  "nexusMcpBridge.port": 3000,
  "nexusMcpBridge.startOnLaunch": true,
  "nexusMcpBridge.allowedPaths": [
    "/path/to/your/project",
    "/path/to/another/project"
  ]
}
```

## Commands

- **Start Nexus MCP Bridge**: Start the MCP server
- **Stop Nexus MCP Bridge**: Stop the MCP server
- **Toggle Nexus MCP Bridge**: Toggle the server on/off (via status bar)

## About 

A lightweight VSCode extension for connecting with Claude Desktop via MCP.

github.com/wesnermichel

## License

MIT# nexus-mcp-claude-desktop-server
