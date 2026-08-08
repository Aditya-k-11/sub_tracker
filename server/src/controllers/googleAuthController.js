import { getOAuthClient } from '../config/googleOAuth.js';
import { encryptToken } from '../utils/tokenEncryption.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const initiateGoogleAuth = catchAsync(async (req, res, next) => {
  const oauthClient = getOAuthClient();

  const authUrl = oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent',
    state: req.user.id
  });

  res.status(200).json({ authUrl });
});

export const handleGoogleCallback = catchAsync(async (req, res, next) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    throw new AppError('Missing authorization code or state', 400);
  }

  const oauthClient = getOAuthClient();
  const { tokens } = await oauthClient.getToken(code);

  if (!tokens.refresh_token) {
    throw new AppError(
      'No refresh token received. Please go to your Google Account security settings, revoke access to SubTrack, and try connecting again.',
      400
    );
  }

  const encryptedRefreshToken = encryptToken(tokens.refresh_token);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      googleRefreshToken: encryptedRefreshToken,
      gmailConnected: true,
      gmailConnectedAt: new Date()
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found during OAuth callback', 404);
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/settings?gmail=connected`);
});

export const disconnectGmail = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      googleRefreshToken: null,
      gmailConnected: false,
      gmailConnectedAt: null
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({ message: 'Gmail disconnected successfully' });
});

export const getGmailConnectionStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    connected: user.gmailConnected,
    connectedAt: user.gmailConnectedAt,
    lastScanAt: user.lastEmailScanAt
  });
});
