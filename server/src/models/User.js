import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  
  name: { type: String, required: true },
  
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  
  passwordHash: { type: String, required: true },
  
  currency: { type: String, default: "INR" },
  
  createdAt: { type: Date, default: Date.now },

  hasCompletedOnboarding: { type: Boolean, default: false },

  googleRefreshToken: { type: String, default: null },
  gmailConnected: { type: Boolean, default: false },
  gmailConnectedAt: { type: Date, default: null },
  lastEmailScanAt: { type: Date, default: null },
  
  connectedEmailAccounts: { type: [String], default: [] },

  notificationPreferences: {
    renewalReminders: { type: Boolean, default: true },
    trialEndingAlerts: { type: Boolean, default: true },
    // Wasted-spend alerts currently don't generate actual Notification records, but this readies the schema
    wastedSpendAlerts: { type: Boolean, default: true }
  }
}, { timestamps: false });

export default mongoose.model('User', userSchema);
