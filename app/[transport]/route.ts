import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import { NextRequest, NextResponse } from 'next/server';

const handler = createMcpHandler(
  async (server) => {
    // Echo tool
    server.tool(
      "echo",
      "description",
      {
        message: z.string(),
      },
      async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      })
    );

    // BMI Calculator tool
    server.tool(
      "calculate-bmi",
      "Calculate Body Mass Index",
      {
        weightKg: z.number(),
        heightM: z.number(),
      },
      async ({ weightKg, heightM }) => {
        const bmi = weightKg / (heightM * heightM);
        return {
          content: [
            { type: "text", text: `Your BMI is ${bmi.toFixed(2)}` },
          ],
        };
      }
    );
  },
  {
    capabilities: {
      tools: {
        echo: {
          description: "Echo a message",
        },
        "calculate-bmi": {
          description:
            "Calculate Body Mass Index from weight (kg) and height (m)",
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
  }
);

// Handle both MCP protocol and simple HTTP requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a simple HTTP request (from frontend)
    if (body.toolName && body.arguments) {
      // Simple HTTP request - calculate BMI directly
      if (body.toolName === "calculate-bmi") {
        const { weightKg, heightM } = body.arguments;
        
        if (typeof weightKg !== 'number' || typeof heightM !== 'number') {
          return NextResponse.json(
            { error: 'Weight and height must be numbers' },
            { status: 400 }
          );
        }
        
        if (weightKg <= 0 || heightM <= 0) {
          return NextResponse.json(
            { error: 'Weight and height must be positive numbers' },
            { status: 400 }
          );
        }
        
        const bmi = weightKg / (heightM * heightM);
        return NextResponse.json({
          success: true,
          result: `Your BMI is ${bmi.toFixed(2)}`
        });
      }
    }
    
    // Otherwise, handle as MCP protocol request
    return handler(request);
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Invalid request'
      },
      { status: 400 }
    );
  }
}

export { handler as GET, handler as DELETE };
