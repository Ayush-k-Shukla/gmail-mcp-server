import { gmail_v1 } from 'googleapis';

export interface IReadableGmailFormat {
  id: string;
  subject: string;
  snippet: string;
  body: string;
  from: string;
  to: string;
  cc: string;
  bcc: string;
  date: string;
  threadId: string;
  labelIds: string[];
}

function getGmailBody(payload?: gmail_v1.Schema$MessagePart): string {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  return '';
}

export const normalizeGmailMessage = (
  msg: gmail_v1.Schema$Message
): IReadableGmailFormat => {
  const headers: gmail_v1.Schema$MessagePartHeader[] =
    msg.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h?.name?.toLowerCase() === name.toLowerCase())?.value ||
    '';

  return {
    id: msg.id || '',
    subject: getHeader('Subject'),
    snippet: msg.snippet || '',
    body: getGmailBody(msg.payload),
    from: getHeader('From'),
    to: getHeader('To'),
    cc: getHeader('Cc'),
    bcc: getHeader('Bcc'),
    date: getHeader('Date'),
    threadId: msg.threadId || '',
    labelIds: msg.labelIds || [],
  };
};
