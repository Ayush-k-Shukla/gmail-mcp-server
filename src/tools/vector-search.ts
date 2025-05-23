import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { vectorSearchEmails } from '../utils/vector-db.js';

export const VECTOR_SEARCH_EMAILS_TOOL: Tool = {
  name: 'vector-search-emails',
  description:
    'Semantic search for emails using vector embeddings (RAG). Returns the most relevant emails for a query.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The search query' },
      k: {
        type: 'number',
        description: 'Number of top results to return',
        default: 5,
      },
    },
    required: ['query'],
  },
};

export const vectorSearchEmailsHandler = async (
  query: string,
  k: number = 5
) => {
  const results = await vectorSearchEmails(query, k);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(results),
      },
    ],
    isError: false,
  };
};
