# VSCode Extension Usage Guide for Claude Desktop

This document provides instructions for setting up and using the Nexus MCP Bridge VSCode extension with Claude Desktop.

## Initial Setup

1. **Install Dependencies**
   ```bash
   cd nexus-mcp-bridge
   chmod +x build.sh
   ./build.sh
   ```

2. **Install the Extension in VSCode**
   - In VSCode, go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
   - Click the "..." menu at the top right
   - Select "Install from VSIX..."
   - Select the `.vsix` file that was generated

3. **Configure Claude Desktop**
   - Open Claude Desktop
   - Locate the configuration file:
     - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Add or modify the MCP servers section:
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
   - Save the file and restart Claude Desktop

## Using the Bridge

1. **Start VSCode**
   - Open your project in VSCode
   - The Nexus MCP Bridge should start automatically (check status bar)
   - If it's not running, click on the "MCP Bridge" in the status bar

2. **Test with Claude Desktop**
   - In Claude Desktop, ask Claude to perform a file operation:
   ```
   Can you tell me what files are in my current project?
   ```

3. **Using with Existing Projects**
   - Open your project in VSCode
   - The extension automatically makes this workspace available to Claude

## Tips for Best Performance

1. **Resource Management**: Close unused extensions to free up memory
2. **Limit Allowed Paths**: In VSCode settings, configure specific paths that Claude can access
3. **Monitor Resources**: If you notice VSCode becoming slow, check resource usage in Activity Monitor or Task Manager

## Troubleshooting

- **Connection Issues**: Make sure the status bar shows "MCP Bridge" is running
- **Permission Errors**: Check the allowed paths in VSCode settings
- **Port Conflicts**: If port 3000 is in use, change it in VSCode settings

## Security Notes

- Files are only accessible when VSCode is running
- Only files within allowed directories can be accessed
- The bridge uses HTTP, so only use it for non-sensitive local development
