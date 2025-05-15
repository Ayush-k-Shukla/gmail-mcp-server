import { Tool } from '@modelcontextprotocol/sdk/types.js';
// import fetch from 'node-fetch';

interface ISinglePostResponse {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const SINGLE_POST_TOOL: Tool = {
  name: 'get-post-by-id',
  description: 'Get post from JSONPlaceholder API by Id',
  inputSchema: {
    type: 'object',
    properties: {
      postId: {
        type: 'string',
        description: 'The Id of the post',
      },
    },
    required: ['postId'],
  },
};

export const getPostById = async (id: string) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );
  const res = (await response.json()) as ISinglePostResponse;

  return {
    content: [{ type: 'text', text: JSON.stringify(res) }],
    isError: false,
  };
};
