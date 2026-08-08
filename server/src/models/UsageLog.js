import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema({
  
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true, index: true },
  
  usedAt: { type: Date, default: Date.now },
  
  note: { type: String, default: null }
}, { timestamps: false });

export default mongoose.model('UsageLog', usageLogSchema);
