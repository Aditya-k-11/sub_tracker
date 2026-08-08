import { google } from 'googleapis';
import { getOAuthClient } from '../config/googleOAuth.js';
import { decryptToken } from '../utils/tokenEncryption.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { SUBSCRIPTION_SEARCH_QUERY, MAX_EMAILS_TO_SCAN } from '../config/emailSearchConfig.js';

export const getAuthenticatedGmailClient = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.gmailConnected || !user.googleRefreshToken) {
    throw new AppError("Gmail is not connected for this user", 400);
  }

  const decryptedToken = decryptToken(user.googleRefreshToken);
  const oauthClient = getOAuthClient();
  
  oauthClient.setCredentials({ refresh_token: decryptedToken });

  return google.gmail({ version: 'v1', auth: oauthClient });
};

export const searchSubscriptionEmails = async (userId) => {
  const gmail = await getAuthenticatedGmailClient(userId);

  let messages = [];
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: SUBSCRIPTION_SEARCH_QUERY,
      maxResults: MAX_EMAILS_TO_SCAN
    });
    
    messages = response.data.messages || [];
  } catch (error) {

    if (error.code === 401 || (error.response && error.response.status === 401) || error.message.includes('invalid_grant')) {

      await User.findByIdAndUpdate(userId, {
        gmailConnected: false,
        googleRefreshToken: null,
        gmailConnectedAt: null
      });

      throw new AppError("Gmail access has expired or been revoked — please reconnect", 401);
    }

    throw error;
  }

  if (messages.length === 0) {

    await User.findByIdAndUpdate(userId, { lastEmailScanAt: new Date() });
    
    return [];
  }

  const candidatePromises = messages.map(async (message) => {
    try {
      const msgRes = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date']
      });

      const headers = msgRes.data.payload?.headers || [];
      const getHeader = (name) => {
        const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : null;
      };

      return {
        messageId: message.id,
        subject: getHeader('Subject'),
        sender: getHeader('From'),
        receivedDate: getHeader('Date'),
        snippet: msgRes.data.snippet
      };
    } catch (err) {
      console.error(`Failed to fetch metadata for message ${message.id}:`, err.message);

      return null;
    }
  });

    const candidates = (await Promise.all(candidatePromises)).filter(Boolean);

    await User.findByIdAndUpdate(userId, { lastEmailScanAt: new Date() });

    return candidates;
};

export const getFullEmailContent = async (userId, messageId) => {
  const gmail = await getAuthenticatedGmailClient(userId);

  try {
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    const payload = res.data.payload;
    let bodyData = '';
    let isHtml = false;

    // Helper to decode base64url encoded strings from Gmail API
    const decodeBase64Url = (encodedStr) => {
      if (!encodedStr) return '';
      const base64 = encodedStr.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(base64, 'base64').toString('utf-8');
    };

    const extractBody = (part) => {
      if (part.body && part.body.data) {
        if (part.mimeType === 'text/plain') {
          bodyData = decodeBase64Url(part.body.data);
          isHtml = false;
          return true; 
        } else if (part.mimeType === 'text/html' && !bodyData) {
          
          bodyData = decodeBase64Url(part.body.data);
          isHtml = true;
        }
      }

      if (part.parts) {
        for (const subPart of part.parts) {
          const foundPlainText = extractBody(subPart);
          if (foundPlainText) return true;
        }
      }
      return false;
    };

    extractBody(payload);

    if (isHtml && bodyData) {
      const { convert } = await import('html-to-text');
      bodyData = convert(bodyData, { wordwrap: false });
    }

    return bodyData;
  } catch (error) {
    console.error(`Failed to fetch full content for message ${messageId}:`, error.message);
    throw new AppError("Failed to fetch full email content", 500);
  }
};
