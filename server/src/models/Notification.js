import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
  
  type: { type: String, enum: ["renewal", "trial_ending"], required: true },
  
  message: { type: String, required: true },
  
  priority: { type: String, enum: ["normal", "high"], default: "normal" },
  
  isRead: { type: Boolean, default: false },
  
  sentAt: { type: Date, default: Date.now }
}, { timestamps: false });

export default mongoose.model('Notification', notificationSchema);
