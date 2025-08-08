import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";

const handler = createMcpHandler(
  async (server) => {
    // Echo tool
    server.tool(
      "echo",
      "description",
      { message: z.string() },
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
        echo: { description: "Echo a message" },
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

export const POST = handler;
export const GET = handler;
export const DELETE = handler;
