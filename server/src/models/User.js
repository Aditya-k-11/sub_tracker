import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  
  name: { type: String, required: true },
  
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  
  passwordHash: { type: String, required: true },
  
  currency: { type: String, default: "INR" },
  
  createdAt: { type: Date, default: Date.now },

  googleRefreshToken: { type: String, default: null },
  gmailConnected: { type: Boolean, default: false },
  gmailConnectedAt: { type: Date, default: null },
  lastEmailScanAt: { type: Date, default: null },
  
  connectedEmailAccounts: { type: [String], default: [] }
}, { timestamps: false });

export default mongoose.model('User', userSchema);
