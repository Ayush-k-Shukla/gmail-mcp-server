import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';

const gmail = google.gmail('v1');

interface IGmailDetails {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const GET__GMAIL_PROFILE: Tool = {
  name: 'get-gmail-profile',
  description: 'Get gmail profile details based on userId',
  inputSchema: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'The user gmail Id',
      },
    },
    required: ['userId'],
  },
};

export const getGmailProfileById = async (userId: string) => {
  const response = await gmail.users.getProfile({ userId: userId });
  console.error(response.data);

  return {
    content: [{ type: 'text', text: JSON.stringify(response.data) }],
    isError: false,
  };
};
