import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { gmail_v1, google } from 'googleapis';
import { normalizeGmailMessage } from '../utils/format';

const gmail = google.gmail('v1');

export const GET_GMAIL_PROFILE_TOOL: Tool = {
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
  description:
    'Send an email to a given email address (supports attachments and HTML)',
  inputSchema: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient email address' },
      subject: { type: 'string', description: 'Email subject' },
      body: { type: 'string', description: 'Email body' },
      isHtml: {
        type: 'boolean',
        description: 'Send as HTML email',
        default: false,
      },
      attachments: {
        type: 'array',
        description: 'Array of attachments (base64 encoded)',
        items: {
          type: 'object',
          properties: {
            filename: { type: 'string', description: 'Attachment filename' },
            mimeType: { type: 'string', description: 'MIME type' },
            content: { type: 'string', description: 'Base64 encoded content' },
          },
          required: ['filename', 'mimeType', 'content'],
        },
        nullable: true,
      },
    },
    required: ['to', 'subject', 'body'],
  },
};

export const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  isHtml: boolean = false,
  attachments?: Array<{ filename: string; mimeType: string; content: string }>
) => {
  let messageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    isHtml
      ? 'Content-Type: text/html; charset=utf-8'
      : 'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ];
  let raw;
  if (attachments && attachments.length > 0) {
    const boundary = 'boundary_' + Date.now();
    let multipartBody = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset="UTF-8"`,
      'Content-Transfer-Encoding: 7bit',
      '',
      body,
    ];
    for (const att of attachments) {
      multipartBody.push(
        `--${boundary}`,
        `Content-Type: ${att.mimeType}; name="${att.filename}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${att.filename}"`,
        '',
        att.content,
        ''
      );
    }
    multipartBody.push(`--${boundary}--`);
    raw = Buffer.from(multipartBody.join('\r\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } else {
    raw = Buffer.from(messageParts.join('\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
  return {
    content: [{ type: 'text', text: 'Email sent successfully.' }],
    isError: false,
  };
};

export const DELETE_EMAIL_TOOL: Tool = {
  name: 'delete-email',
  description: 'Delete an email by message ID',
  inputSchema: {
    type: 'object',
    properties: {
      messageId: { type: 'string', description: 'ID of the email message' },
    },
    required: ['messageId'],
  },
};

export const deleteEmail = async (messageId: string) => {
  await gmail.users.messages.delete({
    userId: 'me',
    id: messageId,
  });
  return {
    content: [{ type: 'text', text: 'Email deleted successfully.' }],
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
  let summaries: any[] = [];
  for (const msg of messages) {
    const msgRes = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id!,
    });
    const snippet = msgRes.data || '';
    summaries.push(normalizeGmailMessage(snippet));
  }
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(summaries),
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
  let unread: any[] = [];
  for (const msg of messages) {
    const msgRes = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id!,
    });
    const snippet: gmail_v1.Schema$Message = msgRes.data || {};
    unread.push(normalizeGmailMessage(snippet));
  }
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(unread),
      },
    ],
    isError: false,
  };
};

export const GLOBAL_SEARCH_TOOL: Tool = {
  name: 'global-search-emails',
  description:
    'Search emails by subject, sender/recipient, time range, keyword, and label.',
  inputSchema: {
    type: 'object',
    properties: {
      subject: {
        type: 'string',
        description: 'Subject to search for',
        nullable: true,
      },
      sender: {
        type: 'string',
        description: 'Sender email address',
        nullable: true,
      },
      recipient: {
        type: 'string',
        description: 'Recipient email address',
        nullable: true,
      },
      after: {
        type: 'string',
        description: 'Start date (YYYY/MM/DD)',
        nullable: true,
      },
      before: {
        type: 'string',
        description: 'End date (YYYY/MM/DD)',
        nullable: true,
      },
      keyword: {
        type: 'string',
        description: 'Keyword in body/snippet',
        nullable: true,
      },
      label: {
        type: 'string',
        description: 'Gmail label to filter by',
        nullable: true,
      },
      maxResults: {
        type: 'number',
        description: 'Maximum results',
        default: 10,
      },
    },
    required: [],
  },
};

export const globalSearchEmails = async (params: {
  subject?: string;
  sender?: string;
  recipient?: string;
  after?: string;
  before?: string;
  keyword?: string;
  label?: string;
  maxResults?: number;
}) => {
  let q = [];
  if (params.subject) q.push(`subject:${params.subject}`);
  if (params.sender) q.push(`from:${params.sender}`);
  if (params.recipient) q.push(`to:${params.recipient}`);
  if (params.after) q.push(`after:${params.after.replace(/-/g, '/')}`);
  if (params.before) q.push(`before:${params.before.replace(/-/g, '/')}`);
  if (params.keyword) q.push(params.keyword);
  if (params.label) q.push(`label:${params.label}`);
  const query = q.join(' ');
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: params.maxResults || 10,
  });
  const messages = res.data.messages || [];
  let results: any[] = [];
  for (const msg of messages) {
    const msgRes = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id!,
    });
    const snippet = msgRes.data || '';
    results.push(normalizeGmailMessage(snippet));
  }
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

export const LIST_LABELS_TOOL: Tool = {
  name: 'list-gmail-labels',
  description: 'List all Gmail labels for the authenticated user.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const listGmailLabels = async () => {
  const res = await gmail.users.labels.list({ userId: 'me' });
  const labels = res.data.labels || [];
  return {
    content: [
      {
        type: 'text',
        text: labels.length ? JSON.stringify(labels) : 'No labels found.',
      },
    ],
    isError: false,
  };
};

export const CREATE_LABEL_TOOL: Tool = {
  name: 'create-label',
  description: 'Create a new Gmail label',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Label name' },
    },
    required: ['name'],
  },
};

export const createLabel = async (name: string) => {
  const res = await gmail.users.labels.create({
    userId: 'me',
    requestBody: { name },
  });
  return {
    content: [{ type: 'text', text: `Label created: ${res.data.id}` }],
    isError: false,
  };
};

export const DELETE_LABELS_TOOL: Tool = {
  name: 'delete-gmail-label',
  description: 'Delete a gmail label.',
  inputSchema: {
    type: 'object',
    properties: {
      labelId: { type: 'string', description: 'Label name' },
    },
    required: [],
  },
};

export const deleteGmailLabel = async (labelId: string) => {
  const res = await gmail.users.labels.delete({ userId: 'me', id: labelId });
  return {
    content: [
      {
        type: 'text',
        text: 'Label deleted successfully.',
      },
    ],
    isError: false,
  };
};
