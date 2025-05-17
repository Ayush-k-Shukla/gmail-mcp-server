import { authenticate } from '@google-cloud/local-auth';
import fs from 'fs';
import { google } from 'googleapis';
import path from 'path';

const credentialsPath =
  process.env.GMAIL_CREDENTIALS_PATH ||
  path.join('./gmail-server-credentials.json');

export async function authenticateAndSaveCredentials() {
  console.log('Auth flow starting...');
  const localAuth = await authenticate({
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
    ],
    keyfilePath: 'gcp-oauth-keys.json',
  });
  fs.writeFileSync(credentialsPath, JSON.stringify(localAuth.credentials));
}

export async function loadCredentials() {
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
  const auth = new google.auth.OAuth2();
  auth.setCredentials(credentials);
  google.options({ auth });

  console.log('Credentials loaded. Starting server...');
}
