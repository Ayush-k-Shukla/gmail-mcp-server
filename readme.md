# Gmail MCP server (In Progress)

This MCP server integrates with gmail apis to allow listing, send of emails.

## Tools

- **get-gmail-profile**: Get Gmail profile details based on userId

  - `userId`: The user Gmail ID (string, required)

- **send-email**: Send an email to a given email address (supports attachments and HTML)

  - `to`: Recipient email address (string, required)
  - `subject`: Email subject (string, required)
  - `body`: Email body (string, required)
  - `isHtml`: Send as HTML email (boolean, optional, default: false)
  - `attachments`: Array of attachments (base64 encoded, optional)
    - `filename`: Attachment filename (string, required)
    - `mimeType`: MIME type (string, required)
    - `content`: Base64 encoded content (string, required)

- **create-label**: Create a new Gmail label

  - `name`: Label name (string, required)

- **delete-email**: Delete an email by message ID

  - `messageId`: ID of the email message (string, required)

- **summarize-top-k-emails**: Summarize the top k emails in the inbox

  - `k`: Number of top emails to summarize (number, required)

- **get-unread-emails**: Get unread emails from the inbox

  - `maxResults`: Maximum number of unread emails to fetch (number, optional, default: 10)

- **contextual-search-emails**: Search emails by subject, sender/recipient, time range, keyword, and label

  - `subject`: Subject to search for (string, optional)
  - `sender`: Sender email address (string, optional)
  - `recipient`: Recipient email address (string, optional)
  - `after`: Start date (YYYY/MM/DD) (string, optional)
  - `before`: End date (YYYY/MM/DD) (string, optional)
  - `keyword`: Keyword in body/snippet (string, optional)
  - `label`: Gmail label to filter by (string, optional)
  - `maxResults`: Maximum results (number, optional, default: 10)

- **list-gmail-labels**: List all Gmail labels for the authenticated user
  - No parameters required

## Getting started

1. [Create a Google Cloud project](https://console.cloud.google.com/projectcreate)
2. [Enable the Gmail API](https://console.cloud.google.com/workspace-api/products)
3. [Configure an OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
   1. If have workspace account then make it private
   2. Otherwise set some test users (emails against which want to test) to test before app is verified.
4. [Create an OAuth Client ID](https://console.cloud.google.com/apis/credentials/oauthclient) for application type "Web App"
5. Download the JSON file of your client's OAuth keys
6. Rename the key file to `gcp-oauth-keys.json` and place into the root of the repo.

Make sure to build the server with `npm run build`

### Authentication

To authenticate and save credentials:

1. Run the server with the `auth` argument: `node dist/mcp.js auth`
2. This will open an authentication flow in your system browser
   - Note down the token generated is only valid for `1 hr` so relogin if get any error like `Error: No refresh token is set.`.
3. Complete the authentication process
4. Credentials will be saved in the root of this repo with file name `gmail-server-credentials.json`
