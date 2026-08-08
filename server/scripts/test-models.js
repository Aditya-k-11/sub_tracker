import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Subscription from '../src/models/Subscription.js';
import UsageLog from '../src/models/UsageLog.js';
import Notification from '../src/models/Notification.js';
import SpendSnapshot from '../src/models/SpendSnapshot.js';

const testModels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for testing...');

    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'dummyhash123'
    });
    const savedUser = await user.save();
    console.log('\n--- User Created ---');
    console.log(savedUser);

    const subscription = new Subscription({
      userId: savedUser._id,
      name: 'Test Gym',
      cost: 50,
      billingCycle: 'monthly',
      category: 'Fitness',
      nextRenewalDate: new Date(Date.now() + 86400000)
    });
    const savedSubscription = await subscription.save();
    console.log('\n--- Subscription Created ---');
    console.log(savedSubscription);

    const usageLog = new UsageLog({
      subscriptionId: savedSubscription._id,
      note: 'Went for a run'
    });
    const savedUsageLog = await usageLog.save();
    console.log('\n--- UsageLog Created ---');
    console.log(savedUsageLog);

    const notification = new Notification({
      userId: savedUser._id,
      subscriptionId: savedSubscription._id,
      type: 'renewal',
      message: 'Your Gym subscription renews tomorrow.',
      priority: 'normal'
    });
    const savedNotification = await notification.save();
    console.log('\n--- Notification Created ---');
    console.log(savedNotification);

    const spendSnapshot = new SpendSnapshot({
      userId: savedUser._id,
      month: '2026-07',
      totalSpend: 50,
      totalByCategory: { 'Fitness': 50 }
    });
    const savedSpendSnapshot = await spendSnapshot.save();
    console.log('\n--- SpendSnapshot Created ---');
    console.log(savedSpendSnapshot);

    console.log('\n--- Relationship Check ---');
    console.log(`Subscription userId matches User _id: ${savedSubscription.userId.toString() === savedUser._id.toString()}`);
    console.log(`UsageLog subscriptionId matches Subscription _id: ${savedUsageLog.subscriptionId.toString() === savedSubscription._id.toString()}`);

    console.log('\n--- Cleaning up test data ---');
    await User.findByIdAndDelete(savedUser._id);
    await Subscription.findByIdAndDelete(savedSubscription._id);
    await UsageLog.findByIdAndDelete(savedUsageLog._id);
    await Notification.findByIdAndDelete(savedNotification._id);
    await SpendSnapshot.findByIdAndDelete(savedSpendSnapshot._id);
    console.log('Test data deleted.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

testModels();
