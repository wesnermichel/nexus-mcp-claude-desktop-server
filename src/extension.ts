import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
// Import types only from Express for type checking
import type { Request, Response } from 'express';

// Use require for Express to avoid WebPack warnings
const express = require('express');
const cors = require('cors');

/**
 * Interface for MCP Request
 */
interface McpRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params: {
    capability: string;
    arguments?: any;
  };
}

/**
 * MCP Bridge Extension
 */
export async function activate(context: vscode.ExtensionContext) {
  const mcpBridge = new McpBridge();
  
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('nexus-mcp-bridge.start', () => mcpBridge.start()),
    vscode.commands.registerCommand('nexus-mcp-bridge.stop', () => mcpBridge.stop())
  );
  
  // Create status bar item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'nexus-mcp-bridge.toggleBridge';
  context.subscriptions.push(statusBarItem);
  
  // Register toggle command
  context.subscriptions.push(
    vscode.commands.registerCommand('nexus-mcp-bridge.toggleBridge', () => {
      if (mcpBridge.isRunning) {
        mcpBridge.stop();
      } else {
        mcpBridge.start();
      }
    })
  );
  
  // Update UI
  context.subscriptions.push(
    mcpBridge.onDidChangeStatus(() => {
      if (mcpBridge.isRunning) {
        statusBarItem.text = '$(check) MCP Bridge';
        statusBarItem.tooltip = `Nexus MCP Bridge running on port ${mcpBridge.port}`;
      } else {
        statusBarItem.text = '$(x) MCP Bridge';
        statusBarItem.tooltip = 'Nexus MCP Bridge stopped';
      }
    })
  );
  
  // Show status bar item
  statusBarItem.show();
  
  // Start on launch if configured
  const config = vscode.workspace.getConfiguration('nexusMcpBridge');
  if (config.get<boolean>('startOnLaunch')) {
    mcpBridge.start();
  }
}

export function deactivate() {
  // Nothing to do
}

/**
 * MCP Bridge implementation
 */
class McpBridge {
  private _server: any;
  private _port: number;
  private _isRunning: boolean = false;
  private _statusEmitter = new vscode.EventEmitter<void>();
  
  constructor() {
    const config = vscode.workspace.getConfiguration('nexusMcpBridge');
    this._port = config.get<number>('port') || 3000;
  }
  
  /**
   * Event fired when the status changes
   */
  public get onDidChangeStatus(): vscode.Event<void> {
    return this._statusEmitter.event;
  }
  
  /**
   * Whether the server is running
   */
  public get isRunning(): boolean {
    return this._isRunning;
  }
  
  /**
   * The port the server is running on
   */
  public get port(): number {
    return this._port;
  }
  
  /**
   * Start the MCP bridge server
   */
  public async start(): Promise<void> {
    if (this._isRunning) {
      vscode.window.showInformationMessage('Nexus MCP Bridge is already running');
      return;
    }
    
    try {
      const app = express();
      
      // Allow cross-origin requests
      app.use(cors());
      
      // Parse JSON body
      app.use(express.json());
      
      // Handle MCP requests
      app.post('/mcp', async (req: Request, res: Response) => {
        try {
          const request = req.body as McpRequest;
          
          // Execute the capability
          const result = await this.executeCapability(
            request.params.capability,
            request.params.arguments || {}
          );
          
          // Return the result
          res.json({
            jsonrpc: '2.0',
            id: request.id,
            result
          });
        } catch (error: any) {
          // Return the error
          res.json({
            jsonrpc: '2.0',
            id: req.body.id,
            error: {
              code: error.code || -32603,
              message: error.message || 'Internal error'
            }
          });
        }
      });
      
      // Handle health check
      app.get('/health', (_req: Request, res: Response) => {
        res.json({
          status: 'ok',
          version: '0.1.0',
          workspaceFolder: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || null
        });
      });
      
      // Start the server
      this._server = app.listen(this._port, () => {
        this._isRunning = true;
        this._statusEmitter.fire();
        vscode.window.showInformationMessage(`Nexus MCP Bridge started on port ${this._port}`);
      });
      
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to start Nexus MCP Bridge: ${error.message}`);
    }
  }
  
  /**
   * Stop the MCP bridge server
   */
  public stop(): void {
    if (!this._isRunning) {
      vscode.window.showInformationMessage('Nexus MCP Bridge is not running');
      return;
    }
    
    if (this._server) {
      this._server.close();
      this._server = null;
      this._isRunning = false;
      this._statusEmitter.fire();
      vscode.window.showInformationMessage('Nexus MCP Bridge stopped');
    }
  }
  
  /**
   * Execute an MCP capability
   */
  private async executeCapability(capability: string, args: any): Promise<any> {
    switch (capability) {
      case 'get_system_info':
        return this.getSystemInfo();
        
      case 'read_file':
        return this.readFile(args);
        
      case 'write_file':
        return this.writeFile(args);
        
      case 'list_directory':
        return this.listDirectory(args);
        
      case 'create_directory':
        return this.createDirectory(args);
        
      case 'get_project_status':
        return this.getProjectStatus();
        
      default:
        throw {
          code: -32601,
          message: `Capability not found: ${capability}`
        };
    }
  }
  
  /**
   * Get system information
   */
  private getSystemInfo(_args?: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            name: 'Nexus MCP Bridge',
            version: '0.1.0',
            vscode: vscode.version,
            workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || null
          }, null, 2)
        }
      ]
    };
  }
  
  /**
   * Get project status information
   */
  private getProjectStatus(_args?: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            name: 'MCP Bridge Project',
            status: 'active',
            collaborators: ['wesnermichel'],
            workspacePath: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || null
          }, null, 2)
        }
      ]
    };
  }
  
  /**
   * Read a file
   */
  private async readFile(args: { filepath: string }): Promise<any> {
    if (!args.filepath) {
      throw {
        code: -32602,
        message: 'Missing filepath parameter'
      };
    }
    
    try {
      // Resolve the file path relative to the workspace
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      let filepath = args.filepath;
      
      if (workspaceRoot && !path.isAbsolute(filepath)) {
        filepath = path.join(workspaceRoot, filepath);
      }
      
      // Verify the path is allowed
      this.verifyPathAccess(filepath);
      
      const content = await fs.readFile(filepath, 'utf8');
      
      return {
        content: [
          {
            type: 'text',
            text: content
          }
        ]
      };
      
    } catch (error: any) {
      throw {
        code: -32603,
        message: `Failed to read file: ${error.message}`
      };
    }
  }
  
  /**
   * Write to a file
   */
  private async writeFile(args: { filepath: string; content: string }): Promise<any> {
    if (!args.filepath || args.content === undefined) {
      throw {
        code: -32602,
        message: 'Missing required parameters'
      };
    }
    
    try {
      // Resolve the file path relative to the workspace
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      let filepath = args.filepath;
      
      if (workspaceRoot && !path.isAbsolute(filepath)) {
        filepath = path.join(workspaceRoot, filepath);
      }
      
      // Verify the path is allowed
      this.verifyPathAccess(filepath);
      
      // Create the directory path if it doesn't exist
      const dirname = path.dirname(filepath);
      await fs.mkdir(dirname, { recursive: true });
      
      await fs.writeFile(filepath, args.content, 'utf8');
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully wrote to ${filepath}`
          }
        ]
      };
      
    } catch (error: any) {
      throw {
        code: -32603,
        message: `Failed to write file: ${error.message}`
      };
    }
  }
  
  /**
   * List directory contents
   */
  private async listDirectory(args: { path: string }): Promise<any> {
    if (!args.path) {
      throw {
        code: -32602,
        message: 'Missing path parameter'
      };
    }
    
    try {
      // Resolve the directory path relative to the workspace
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      let dirpath = args.path;
      
      if (workspaceRoot && !path.isAbsolute(dirpath)) {
        dirpath = path.join(workspaceRoot, dirpath);
      }
      
      // Verify the path is allowed
      this.verifyPathAccess(dirpath);
      
      const files = await fs.readdir(dirpath, { withFileTypes: true });
      
      const result = files.map(file => {
        return file.isDirectory() ? `[DIR] ${file.name}` : `[FILE] ${file.name}`;
      }).join('\n');
      
      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
      
    } catch (error: any) {
      throw {
        code: -32603,
        message: `Failed to list directory: ${error.message}`
      };
    }
  }
  
  /**
   * Create a directory
   */
  private async createDirectory(args: { dirpath: string }): Promise<any> {
    if (!args.dirpath) {
      throw {
        code: -32602,
        message: 'Missing dirpath parameter'
      };
    }
    
    try {
      // Resolve the directory path relative to the workspace
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      let dirpath = args.dirpath;
      
      if (workspaceRoot && !path.isAbsolute(dirpath)) {
        dirpath = path.join(workspaceRoot, dirpath);
      }
      
      // Verify the path is allowed
      this.verifyPathAccess(dirpath);
      
      await fs.mkdir(dirpath, { recursive: true });
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully created directory: ${dirpath}`
          }
        ]
      };
      
    } catch (error: any) {
      throw {
        code: -32603,
        message: `Failed to create directory: ${error.message}`
      };
    }
  }
  
  /**
   * Verify that a path is allowed to be accessed
   */
  private verifyPathAccess(filepath: string): void {
    const config = vscode.workspace.getConfiguration('nexusMcpBridge');
    const allowedPaths = config.get<string[]>('allowedPaths') || [];
    
    // If no allowed paths are configured, use the workspace root
    if (allowedPaths.length === 0) {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (workspaceRoot) {
        allowedPaths.push(workspaceRoot);
      }
    }
    
    
    // Check if the path is allowed
    const isAllowed = allowedPaths.some(allowedPath => {
      return filepath.startsWith(allowedPath);
    });
    
    if (!isAllowed) {
      throw new Error(`Access to path '${filepath}' is not allowed. Allowed paths: ${allowedPaths.join(', ')}`);
    }
  }
}