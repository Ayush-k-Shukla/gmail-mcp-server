import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getPostById, SINGLE_POST_TOOL } from './tools/jsonplaceholder';

// Create an MCP server
const server = new Server(
  { name: 'my-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const ALL_TOOLS: any[] = [SINGLE_POST_TOOL];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('Received list tools');
  return { tools: ALL_TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const toolName = req.params.name;
  console.error('Received tool call', toolName);

  try {
    switch (toolName) {
      case SINGLE_POST_TOOL.name: {
        const { postId } = req.params.arguments as { postId: string };
        return await getPostById(postId);
      }
      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${toolName}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('server connected success');
  } catch (error) {
    console.error('err', error);
  }
}

main();
