import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { toolName, arguments: args } = await request.json();
    
    // Create proper MCP request format
    const mcpRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    };

    // Make request to the MCP server
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(mcpRequest)
    });

    if (!response.ok) {
      throw new Error(`MCP server error: ${response.status}`);
    }

    const mcpResponse = await response.json();
    
    // Extract the result from MCP response
    if (mcpResponse.result && mcpResponse.result.content && mcpResponse.result.content.length > 0) {
      return NextResponse.json({
        success: true,
        result: mcpResponse.result.content[0].text
      });
    } else {
      throw new Error('Invalid MCP response format');
    }
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to communicate with MCP server'
      },
      { status: 500 }
    );
  }
}
