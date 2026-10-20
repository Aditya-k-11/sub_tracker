import assert from 'assert';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/User.js';
import Subscription from '../src/models/Subscription.js';
import UsageLog from '../src/models/UsageLog.js';
import { analyzeWastedSpend } from '../src/services/insightsEngine.js';

const runTest = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/subtrack';
  console.log('Connecting to MongoDB for wasted-spend test...');
  await mongoose.connect(mongoUri);

  try {
    const testEmail = `wasted_test_${Date.now()}@example.com`;
    const user = await User.create({
      name: 'Wasted Test User',
      email: testEmail,
      passwordHash: 'dummyhash',
      currency: 'USD'
    });

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const backdate = (days) => new Date(now - days * dayMs);
    const futuredate = (days) => new Date(now + days * dayMs);

    // 1. Subscription with no usage in 60 days -> wasted!
    const sub1 = await Subscription.create({
      userId: user._id,
      name: 'Unused Streaming Service',
      cost: 20.00,
      currency: 'USD',
      billingCycle: 'monthly',
      category: 'Entertainment',
      status: 'active',
      nextRenewalDate: futuredate(10),
      createdAt: backdate(60)
    });

    // 2. Subscription with recent usage 2 days ago -> NOT wasted!
    const sub2 = await Subscription.create({
      userId: user._id,
      name: 'Active Cloud Storage',
      cost: 15.00,
      currency: 'USD',
      billingCycle: 'monthly',
      category: 'Productivity',
      status: 'active',
      nextRenewalDate: futuredate(15),
      createdAt: backdate(90)
    });
    await UsageLog.create({
      subscriptionId: sub2._id,
      usedAt: backdate(2)
    });

    console.log('Running analyzeWastedSpend...');
    const flagged = await analyzeWastedSpend(user._id);

    console.log('Flagged count:', flagged.length);
    assert.strictEqual(flagged.length, 1, 'Expected exactly 1 flagged subscription');
    assert.strictEqual(flagged[0].name, 'Unused Streaming Service');
    assert.strictEqual(flagged[0].monthlyCost, 20.00, 'Expected monthlyCost to be 20.00 (not 0)');

    const potentialMonthlySavings = flagged.reduce((acc, s) => acc + (s.monthlyCost || 0), 0);
    assert.strictEqual(potentialMonthlySavings, 20.00, 'Expected potential savings to equal 20.00');

    console.log('✓ Wasted spend calculation test passed! monthlyCost:', flagged[0].monthlyCost, 'savings:', potentialMonthlySavings);

    // Clean up
    await Subscription.deleteMany({ userId: user._id });
    await UsageLog.deleteMany({ subscriptionId: sub2._id });
    await User.deleteOne({ _id: user._id });
    console.log('Cleaned up test data.');
  } finally {
    await mongoose.disconnect();
  }
};

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
