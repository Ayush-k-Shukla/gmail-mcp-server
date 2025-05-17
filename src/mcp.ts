import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { authenticateAndSaveCredentials, loadCredentials } from './auth';
import {
  GET__GMAIL_PROFILE_TOOL,
  GET_UNREAD_EMAILS_TOOL,
  getGmailProfileById,
  getUnreadEmails,
  SEND_EMAIL_TOOL,
  sendEmail,
  SUMMARIZE_TOP_K_EMAILS_TOOL,
  summarizeTopKEmails,
} from './tools/gmail';

// Create an MCP server
const server = new Server(
  { name: 'my-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const ALL_TOOLS: any[] = [
  GET__GMAIL_PROFILE_TOOL,
  SEND_EMAIL_TOOL,
  SUMMARIZE_TOP_K_EMAILS_TOOL,
  GET_UNREAD_EMAILS_TOOL,
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('Received list tools');
  return { tools: ALL_TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const toolName = req.params.name;
  console.error('Received tool call', toolName);

  try {
    switch (toolName) {
      case GET__GMAIL_PROFILE_TOOL.name: {
        const { userId } = req.params.arguments as { userId: string };
        return await getGmailProfileById(userId);
      }
      case SEND_EMAIL_TOOL.name: {
        const { to, subject, body } = req.params.arguments as {
          to: string;
          subject: string;
          body: string;
        };
        return await sendEmail(to, subject, body);
      }
      case SUMMARIZE_TOP_K_EMAILS_TOOL.name: {
        const { k } = req.params.arguments as { k: number };
        return await summarizeTopKEmails(k);
      }
      case GET_UNREAD_EMAILS_TOOL.name: {
        const { maxResults } = req.params.arguments as { maxResults?: number };
        return await getUnreadEmails(maxResults);
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
    await loadCredentials();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('server connected success');
  } catch (error) {
    console.error('err', error);
  }
}

if (process.argv[2] === 'auth') {
  authenticateAndSaveCredentials().catch(console.error);
} else {
  main().catch(console.error);
}
