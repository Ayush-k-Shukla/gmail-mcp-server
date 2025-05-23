import { gmail_v1 } from 'googleapis';

export interface IReadableGmailFormat {
  id: string;
  subject: string;
  snippet: string;
}

export const normalizeGmailMessage = (
  msg: gmail_v1.Schema$Message
): IReadableGmailFormat => {
  const headers = (msg.payload?.headers || []) as Array<{
    name: string;
    value: string;
  }>;
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ||
    '';
  return {
    id: msg.id || '',
    subject: getHeader('Subject'),
    snippet: msg.snippet || '',
  };
};
