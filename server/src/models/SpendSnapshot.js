import mongoose from 'mongoose';

const spendSnapshotSchema = new mongoose.Schema({
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  month: { type: String, required: true },
  
  totalSpend: { type: Number, required: true, default: 0 },
  
  totalByCategory: { type: Object, default: {} },
  
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

spendSnapshotSchema.index({ userId: 1, month: 1 }, { unique: true });

export default mongoose.model('SpendSnapshot', spendSnapshotSchema);
