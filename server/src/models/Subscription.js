import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  name: { type: String, required: true, trim: true },
  
  cost: { type: Number, required: true, min: 0 },
  
  currency: { type: String, default: 'USD' },
  
  billingCycle: { type: String, enum: ["weekly", "monthly", "yearly"], required: true },
  
  billingCycleInterval: { type: Number, default: 1, min: 1 },
  
  category: { type: String, required: true },
  
  nextRenewalDate: { type: Date, required: true },
  
  status: { type: String, enum: ["active", "paused", "cancelled"], default: "active" },
  
  isTrial: { type: Boolean, default: false },
  
  trialEndDate: { type: Date, default: null },
  
  paymentMethod: { type: String, default: null },
  
  notes: { type: String, default: null, maxlength: 1000 },
  
  sharedWithCount: { type: Number, default: 1, min: 1 },
  
  sharedNote: { type: String, default: null, maxlength: 200 },
  
  // Array intentionally stores BOTH cost and billingCycle because cycle changes also change what cost means
  costHistory: {
    type: [{
      cost: { type: Number, required: true },
      billingCycle: { type: String, required: true },
      changedAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  
  createdAt: { type: Date, default: Date.now },
  
  cancelledAt: { type: Date, default: null }
}, { timestamps: false });

subscriptionSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Subscription', subscriptionSchema);
