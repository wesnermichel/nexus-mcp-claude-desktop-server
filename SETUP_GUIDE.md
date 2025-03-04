# Setting Up Nexus MCP Bridge with Claude Desktop

This guide explains how to connect Claude Desktop to the Nexus MCP Bridge VSCode extension.

## Step 1: Install and Run the Nexus MCP Bridge

1. Install the Nexus MCP Bridge extension in VSCode
2. The extension will show in the status bar (bottom right)
3. Make sure it's running (should show "✓ MCP Bridge")
4. If not running, click on the status bar item to start it

## Step 2: Configure Claude Desktop

1. Locate your Claude Desktop configuration file:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Add or update the MCP server configuration:

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

3. Save the file and restart Claude Desktop

## Step 3: Test the Connection

1. In Claude Desktop, ask Claude to perform a file operation:
   ```
   Can you tell me what files are in my current workspace?
   ```

2. Claude should be able to list files in your VSCode workspace

## Troubleshooting

- **Connection Issues**: Make sure the Nexus MCP Bridge is running in VSCode
- **Permission Issues**: Check your allowed paths configuration
- **Port Conflicts**: If port 3000 is in use, change it in the extension settings

## Security Considerations

- Only directories you explicitly allow in settings can be accessed
- The MCP bridge only runs when VSCode is open
- File operations are limited to read/write/list/create
