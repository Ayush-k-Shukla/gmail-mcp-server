import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';

const gmail = google.gmail('v1');

export const GET__GMAIL_PROFILE_TOOL: Tool = {
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

export const SEND_EMAIL_TOOL: Tool = {
  name: 'send-email',
  description: 'Send an email to a given email address',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient email address' },
      subject: { type: 'string', description: 'Email subject' },
      body: { type: 'string', description: 'Email body' },
    },
    required: ['to', 'subject', 'body'],
  },
};

export const sendEmail = async (to: string, subject: string, body: string) => {
  const message = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    `Subject: ${subject}`,
    '',
    body,
  ].join('\n');
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });
  return {
    content: [{ type: 'text', text: 'Email sent successfully.' }],
    isError: false,
  };
};

export const SUMMARIZE_TOP_K_EMAILS_TOOL: Tool = {
  name: 'summarize-top-k-emails',
  description: 'Summarize the top k emails in the inbox',
  inputSchema: {
    type: 'object',
    properties: {
      k: { type: 'number', description: 'Number of top emails to summarize' },
    },
    required: ['k'],
  },
};

export const summarizeTopKEmails = async (k: number) => {
  const res = await gmail.users.messages.list({ userId: 'me', maxResults: k });
  const messages = res.data.messages || [];
  let summaries: string[] = [];
  for (const msg of messages) {
    const msgRes = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id!,
    });
    const snippet = msgRes.data.snippet || '';
    summaries.push(snippet);
  }
  return {
    content: [
      {
        type: 'text',
        text: summaries.map((s, i) => `Email ${i + 1}: ${s}`).join('\n\n'),
      },
    ],
    isError: false,
  };
};

export const GET_UNREAD_EMAILS_TOOL: Tool = {
  name: 'get-unread-emails',
  description: 'Get unread emails from the inbox',
  inputSchema: {
    type: 'object',
    properties: {
      maxResults: {
        type: 'number',
        description: 'Maximum number of unread emails to fetch',
        default: 10,
      },
    },
    required: [],
  },
};

export const getUnreadEmails = async (maxResults: number = 10) => {
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
    maxResults,
  });
  const messages = res.data.messages || [];
  let unread: string[] = [];
  for (const msg of messages) {
    const msgRes = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id!,
    });
    const snippet = msgRes.data.snippet || '';
    unread.push(snippet);
  }
  return {
    content: [
      {
        type: 'text',
        text: unread.map((s, i) => `Unread Email ${i + 1}: ${s}`).join('\n\n'),
      },
    ],
    isError: false,
  };
};
