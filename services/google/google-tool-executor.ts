import { ToolExecutionContext, ToolExecutionResult, WorkspaceRole } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { toolRegistryService } from '@/services/tool-engine/tool-registry';
import { resolveGoogleCredentials, sanitizeOutput } from './credentials';

export class GoogleToolExecutorService {
  public async executeTool(
    toolId: string,
    context: ToolExecutionContext,
    input: Record<string, unknown> = {}
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    // 1. Cross-Workspace Protection
    if (input.resourceWorkspaceId && input.resourceWorkspaceId !== context.workspaceId) {
      return {
        success: false,
        toolId,
        provider: 'google',
        executionId: context.executionId,
        error: 'Cross-workspace access blocked: target resource workspace does not match execution workspace context.',
        output: { status: 'BLOCKED_CROSS_WORKSPACE' },
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    }

    // 2. Fetch Tool Definition for Security Checks
    const toolDef = toolRegistryService.getTool(toolId);

    // 3. Role & Permission Verification
    if (toolDef) {
      if (context.userRole === 'VIEWER' && toolDef.dangerLevel !== 'Safe') {
        dbStore.recordPermissionAuditEvent({
          workspaceId: context.workspaceId,
          userId: context.userId,
          eventType: 'ACCESS_DENIED',
          role: (context.userRole as WorkspaceRole) || 'MEMBER',
          permission: toolDef.requiredPermissions[0] || 'google:access',
          resourceType: 'google_resource',
          resourceId: toolId,
          details: 'Role VIEWER insufficient for write operation'
        });

        return {
          success: false,
          toolId,
          provider: 'google',
          executionId: context.executionId,
          error: 'Permission denied: VIEWER role cannot perform non-SAFE operations.',
          output: { status: 'PERMISSION_DENIED' },
          durationMs: Date.now() - startTime,
          retryCount: 0
        };
      }

      // 4. Approval Enforcement for High Risk Operations
      if (toolDef.approvalRequired || toolDef.dangerLevel === 'High') {
        if (!input.approvalGranted && context.userRole !== 'ADMIN' && context.userRole !== 'OWNER') {
          return {
            success: false,
            toolId,
            provider: 'google',
            executionId: context.executionId,
            error: `Administrative approval required for high-risk operation: ${toolId}`,
            metadata: { approvalRequired: true, dangerLevel: toolDef.dangerLevel },
            output: { status: 'APPROVAL_REQUIRED', toolId },
            durationMs: Date.now() - startTime,
            retryCount: 0
          };
        }
      }
    }

    // 5. Credential Resolution
    const creds = resolveGoogleCredentials(
      context.workspaceId,
      context.userId,
      input.inputAccessToken as string,
      input.inputApiKey as string
    );

    if (!creds || (!creds.accessToken && !creds.apiKey)) {
      return {
        success: false,
        toolId,
        provider: 'google',
        executionId: context.executionId,
        error: 'NOT_CONFIGURED: Google OAuth authorization tokens or credentials are not configured for this workspace.',
        output: { status: 'NOT_CONFIGURED', provider: 'google', message: 'Missing Google credentials' },
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    }

    // 6. Real Operation Routing & Execution
    try {
      let rawResult: Record<string, unknown> = {};

      switch (toolId) {
        // --- GOOGLE DRIVE ---
        case 'google_drive_list_files':
          rawResult = await this.driveListFiles(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_drive_get_file':
          rawResult = await this.driveGetFile(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_drive_search':
          rawResult = await this.driveSearch(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_drive_create_file':
          rawResult = await this.driveCreateFile(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_drive_update_file':
          rawResult = await this.driveUpdateFile(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_drive_delete_file':
          rawResult = await this.driveDeleteFile(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_drive_create_folder':
          rawResult = await this.driveCreateFolder(creds.accessToken, creds.apiKey, input);
          break;

        // --- GOOGLE SHEETS ---
        case 'google_sheets_read':
          rawResult = await this.sheetsRead(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_sheets_write':
          rawResult = await this.sheetsWrite(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_sheets_append':
          rawResult = await this.sheetsAppend(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_sheets_create':
          rawResult = await this.sheetsCreate(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_sheets_clear':
          rawResult = await this.sheetsClear(creds.accessToken, creds.apiKey, input);
          break;

        // --- GOOGLE DOCS ---
        case 'google_docs_read':
          rawResult = await this.docsRead(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_docs_create':
          rawResult = await this.docsCreate(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_docs_update':
          rawResult = await this.docsUpdate(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_docs_append':
          rawResult = await this.docsAppend(creds.accessToken, creds.apiKey, input);
          break;

        // --- GMAIL ---
        case 'gmail_search':
          rawResult = await this.gmailSearch(creds.accessToken, input);
          break;

        case 'gmail_get_message':
          rawResult = await this.gmailGetMessage(creds.accessToken, input);
          break;

        case 'gmail_send':
          rawResult = await this.gmailSend(creds.accessToken, input);
          break;

        case 'gmail_modify_labels':
          rawResult = await this.gmailModifyLabels(creds.accessToken, input);
          break;

        case 'gmail_trash_message':
          rawResult = await this.gmailTrashMessage(creds.accessToken, input);
          break;

        // --- GOOGLE CALENDAR ---
        case 'google_calendar_list':
          rawResult = await this.calendarList(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_calendar_get_event':
          rawResult = await this.calendarGetEvent(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_calendar_create_event':
          rawResult = await this.calendarCreateEvent(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_calendar_update_event':
          rawResult = await this.calendarUpdateEvent(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_calendar_delete_event':
          rawResult = await this.calendarDeleteEvent(creds.accessToken, creds.apiKey, input);
          break;

        // --- GOOGLE CLOUD ---
        case 'google_cloud_project_list':
          rawResult = await this.cloudProjectList(creds.accessToken, creds.apiKey, input);
          break;

        case 'google_cloud_project_info':
          rawResult = await this.cloudProjectInfo(creds.accessToken, creds.apiKey, input);
          break;

        default:
          return {
            success: false,
            toolId,
            provider: 'google',
            executionId: context.executionId,
            error: `Unknown Google tool ID: ${toolId}`,
            output: { status: 'UNKNOWN_TOOL' },
            durationMs: Date.now() - startTime,
            retryCount: 0
          };
      }

      // 7. Audit Logging for Non-SAFE Operations
      if (toolDef && toolDef.dangerLevel !== 'Safe') {
        dbStore.recordPermissionAuditEvent({
          workspaceId: context.workspaceId,
          userId: context.userId,
          eventType: 'ACCESS_GRANTED',
          role: (context.userRole as WorkspaceRole) || 'MEMBER',
          permission: toolDef.requiredPermissions[0] || 'google:write',
          resourceType: 'google_resource',
          resourceId: toolId,
          details: `Executed Google operation ${toolId}`
        });
      }

      // 8. Sanitize Output
      const cleanOutput = sanitizeOutput(rawResult);

      return {
        success: true,
        toolId,
        provider: 'google',
        executionId: context.executionId,
        output: cleanOutput as Record<string, unknown>,
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    } catch (error: unknown) {
      return {
        success: false,
        toolId,
        provider: 'google',
        executionId: context.executionId,
        error: error instanceof Error ? error.message : String(error),
        output: { status: 'EXECUTION_ERROR' },
        durationMs: Date.now() - startTime,
        retryCount: 0
      };
    }
  }

  // --- Helper REST Wrappers ---

  private async fetchGoogleApi(
    endpoint: string,
    token?: string,
    apiKey?: string,
    options: RequestInit = {}
  ): Promise<Record<string, unknown>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = endpoint;
    if (apiKey && !token) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}key=${encodeURIComponent(apiKey)}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const contentType = response.headers.get('content-type');
      let data: unknown = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { text: await response.text() };
      }

      if (!response.ok) {
        return {
          status: 'API_ERROR',
          statusCode: response.status,
          error: data
        };
      }

      return {
        status: 'SUCCESS',
        data
      };
    } catch (err: unknown) {
      return {
        status: 'NETWORK_ERROR',
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }

  // --- DRIVE IMPLEMENTATION ---

  private async driveListFiles(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const pageSize = input.pageSize || 10;
    const q = input.query ? `&q=${encodeURIComponent(String(input.query))}` : '';
    const url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}${q}`;
    return this.fetchGoogleApi(url, token, apiKey);
  }

  private async driveGetFile(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const fileId = String(input.fileId || '');
    if (!fileId) throw new Error('google_drive_get_file requires fileId');
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=*`;
    return this.fetchGoogleApi(url, token, apiKey);
  }

  private async driveSearch(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const query = String(input.query || '');
    const mimeType = input.mimeType ? ` and mimeType = '${input.mimeType}'` : '';
    const q = `name contains '${query}'${mimeType}`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`;
    return this.fetchGoogleApi(url, token, apiKey);
  }

  private async driveCreateFile(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const name = String(input.name || 'Untitled');
    const mimeType = String(input.mimeType || 'text/plain');
    const url = 'https://www.googleapis.com/drive/v3/files';
    const body: Record<string, unknown> = { name, mimeType };
    if (input.folderId) body.parents = [String(input.folderId)];

    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  private async driveUpdateFile(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const fileId = String(input.fileId || '');
    if (!fileId) throw new Error('google_drive_update_file requires fileId');
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`;
    const body: Record<string, unknown> = {};
    if (input.name) body.name = input.name;

    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  private async driveDeleteFile(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const fileId = String(input.fileId || '');
    if (!fileId) throw new Error('google_drive_delete_file requires fileId');
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`;
    return this.fetchGoogleApi(url, token, apiKey, { method: 'DELETE' });
  }

  private async driveCreateFolder(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const name = String(input.name || 'New Folder');
    const url = 'https://www.googleapis.com/drive/v3/files';
    const body: Record<string, unknown> = {
      name,
      mimeType: 'application/vnd.google-apps.folder'
    };
    if (input.parentFolderId) body.parents = [String(input.parentFolderId)];

    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  // --- SHEETS IMPLEMENTATION ---

  private async sheetsRead(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const spreadsheetId = String(input.spreadsheetId || '');
    const range = String(input.range || 'A1:Z100');
    if (!spreadsheetId) throw new Error('google_sheets_read requires spreadsheetId');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
    return this.fetchGoogleApi(url, token, apiKey);
  }

  private async sheetsWrite(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const spreadsheetId = String(input.spreadsheetId || '');
    const range = String(input.range || 'A1');
    const values = input.values || [[]];
    if (!spreadsheetId) throw new Error('google_sheets_write requires spreadsheetId');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'PUT',
      body: JSON.stringify({ range, values })
    });
  }

  private async sheetsAppend(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const spreadsheetId = String(input.spreadsheetId || '');
    const range = String(input.range || 'A1');
    const values = input.values || [[]];
    if (!spreadsheetId) throw new Error('google_sheets_append requires spreadsheetId');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'POST',
      body: JSON.stringify({ range, values })
    });
  }

  private async sheetsCreate(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const title = String(input.title || 'New Spreadsheet');
    const url = 'https://sheets.googleapis.com/v4/spreadsheets';
    const body = {
      properties: { title }
    };

    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  private async sheetsClear(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const spreadsheetId = String(input.spreadsheetId || '');
    const range = String(input.range || 'A1:Z100');
    if (!spreadsheetId) throw new Error('google_sheets_clear requires spreadsheetId');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:clear`;

    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  // --- DOCS IMPLEMENTATION ---

  private async docsRead(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const documentId = String(input.documentId || '');
    if (!documentId) throw new Error('google_docs_read requires documentId');
    const url = `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}`;
    return this.fetchGoogleApi(url, token, apiKey);
  }

  private async docsCreate(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const title = String(input.title || 'Untitled Document');
    const url = 'https://docs.googleapis.com/v1/documents';

    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  }

  private async docsUpdate(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const documentId = String(input.documentId || '');
    if (!documentId) throw new Error('google_docs_update requires documentId');
    const url = `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}:batchUpdate`;

    const requests = input.requests || [];
    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'POST',
      body: JSON.stringify({ requests })
    });
  }

  private async docsAppend(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const documentId = String(input.documentId || '');
    const text = String(input.text || '');
    if (!documentId) throw new Error('google_docs_append requires documentId');
    const url = `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}:batchUpdate`;

    const requests = [
      {
        insertText: {
          endOfSegmentLocation: {},
          text
        }
      }
    ];

    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'POST',
      body: JSON.stringify({ requests })
    });
  }

  // --- GMAIL IMPLEMENTATION ---

  private async gmailSearch(token?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const q = input.query ? `&q=${encodeURIComponent(String(input.query))}` : '';
    const maxResults = input.maxResults || 10;
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}${q}`;
    return this.fetchGoogleApi(url, token);
  }

  private async gmailGetMessage(token?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const messageId = String(input.messageId || '');
    if (!messageId) throw new Error('gmail_get_message requires messageId');
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}`;
    return this.fetchGoogleApi(url, token);
  }

  private async gmailSend(token?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const to = String(input.to || '');
    const subject = String(input.subject || '');
    const body = String(input.body || '');
    if (!to) throw new Error('gmail_send requires to recipient');

    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body
    ];
    const rawEmail = Buffer.from(emailLines.join('\r\n')).toString('base64url');

    const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
    return this.fetchGoogleApi(url, token, undefined, {
      method: 'POST',
      body: JSON.stringify({ raw: rawEmail })
    });
  }

  private async gmailModifyLabels(token?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const messageId = String(input.messageId || '');
    if (!messageId) throw new Error('gmail_modify_labels requires messageId');
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/modify`;

    return this.fetchGoogleApi(url, token, undefined, {
      method: 'POST',
      body: JSON.stringify({
        addLabelIds: input.addLabelIds || [],
        removeLabelIds: input.removeLabelIds || []
      })
    });
  }

  private async gmailTrashMessage(token?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const messageId = String(input.messageId || '');
    if (!messageId) throw new Error('gmail_trash_message requires messageId');
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}/trash`;

    return this.fetchGoogleApi(url, token, undefined, { method: 'POST' });
  }

  // --- CALENDAR IMPLEMENTATION ---

  private async calendarList(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const calendarId = String(input.calendarId || 'primary');
    const maxResults = input.maxResults || 10;
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?maxResults=${maxResults}`;
    return this.fetchGoogleApi(url, token, apiKey);
  }

  private async calendarGetEvent(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const calendarId = String(input.calendarId || 'primary');
    const eventId = String(input.eventId || '');
    if (!eventId) throw new Error('google_calendar_get_event requires eventId');
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
    return this.fetchGoogleApi(url, token, apiKey);
  }

  private async calendarCreateEvent(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const calendarId = String(input.calendarId || 'primary');
    const summary = String(input.summary || 'New Event');
    const description = String(input.description || '');
    const start = input.start || { dateTime: new Date().toISOString() };
    const end = input.end || { dateTime: new Date(Date.now() + 3600000).toISOString() };

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'POST',
      body: JSON.stringify({ summary, description, start, end })
    });
  }

  private async calendarUpdateEvent(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const calendarId = String(input.calendarId || 'primary');
    const eventId = String(input.eventId || '');
    if (!eventId) throw new Error('google_calendar_update_event requires eventId');

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
    const body: Record<string, unknown> = {};
    if (input.summary) body.summary = input.summary;
    if (input.description) body.description = input.description;
    if (input.start) body.start = input.start;
    if (input.end) body.end = input.end;

    return this.fetchGoogleApi(url, token, apiKey, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  private async calendarDeleteEvent(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const calendarId = String(input.calendarId || 'primary');
    const eventId = String(input.eventId || '');
    if (!eventId) throw new Error('google_calendar_delete_event requires eventId');

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
    return this.fetchGoogleApi(url, token, apiKey, { method: 'DELETE' });
  }

  // --- GOOGLE CLOUD IMPLEMENTATION ---

  private async cloudProjectList(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const pageSize = input.pageSize || 10;
    const url = `https://cloudresourcemanager.googleapis.com/v1/projects?pageSize=${pageSize}`;
    return this.fetchGoogleApi(url, token, apiKey);
  }

  private async cloudProjectInfo(token?: string, apiKey?: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const projectId = String(input.projectId || '');
    if (!projectId) throw new Error('google_cloud_project_info requires projectId');
    const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}`;
    return this.fetchGoogleApi(url, token, apiKey);
  }
}

export const googleToolExecutorService = new GoogleToolExecutorService();
