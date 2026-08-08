import mongoose from 'mongoose';

const suggestedSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  suggestedName: {
    type: String,
    required: true
  },
  suggestedCategory: {
    type: String,
    default: 'Other'
  },
  suggestedCost: {
    type: Number,
    default: null
  },
  suggestedBillingCycle: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly', null],
    default: null
  },
  confidence: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
  sourceSubject: {
    type: String
  },
  sourceSender: {
    type: String
  },
  sourceDate: {
    type: Date
  },
  sourceMessageId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'dismissed'],
    default: 'pending'
  },
  confirmedSubscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

suggestedSubscriptionSchema.index({ userId: 1, sourceMessageId: 1 }, { unique: true });

const SuggestedSubscription = mongoose.model('SuggestedSubscription', suggestedSubscriptionSchema);

export default SuggestedSubscription;
