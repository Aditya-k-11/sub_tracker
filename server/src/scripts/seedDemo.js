import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import UsageLog from '../models/UsageLog.js';
import Notification from '../models/Notification.js';
import SpendSnapshot from '../models/SpendSnapshot.js';
import { generateNotifications } from '../services/renewalScanService.js';
import { upsertCurrentMonthSnapshot } from '../services/snapshotService.js';

const seedDemo = async () => {
  try {
    const seedEmail = 'demo@subtrack.dev';
    console.log(`Seeding demo account: ${seedEmail}...`);

    await connectDB();

    const existingUser = await User.findOne({ email: seedEmail });
    if (existingUser) {
      const userId = existingUser._id;
      const existingSubs = await Subscription.find({ userId }).select('_id');
      const subIds = existingSubs.map(s => s._id);

      await Subscription.deleteMany({ userId });
      await UsageLog.deleteMany({ subscriptionId: { $in: subIds } });
      await Notification.deleteMany({ userId });
      await SpendSnapshot.deleteMany({ userId });
      await User.deleteOne({ _id: userId });
      console.log('Cleaned up previous demo user records.');
    }

    const hashedPassword = await bcrypt.hash('Demo@1234', 10);
    const demoUser = await User.create({
      name: 'Demo Account',
      email: seedEmail,
      passwordHash: hashedPassword,
      currency: 'USD',
      monthlyBudget: 250,
      hasCompletedOnboarding: true,
      notificationPreferences: {
        renewalReminders: true,
        trialEndingAlerts: true,
        wastedSpendAlerts: true
      }
    });

    const userId = demoUser._id;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const backdate = (days) => new Date(now - days * dayMs);
    const futuredate = (days) => new Date(now + days * dayMs);

    const subDefs = [
      {
        userId, name: 'Netflix Premium', cost: 22.99, currency: 'USD', billingCycle: 'monthly',
        category: 'Entertainment', status: 'active',
        nextRenewalDate: futuredate(24), createdAt: backdate(90)
      },
      {
        userId, name: 'Spotify Individual', cost: 11.99, currency: 'USD', billingCycle: 'monthly',
        category: 'Entertainment', status: 'active',
        nextRenewalDate: futuredate(2), createdAt: backdate(60)
      },
      {
        userId, name: 'Notion Plus', cost: 10.00, currency: 'USD', billingCycle: 'monthly',
        category: 'Productivity', status: 'active',
        nextRenewalDate: futuredate(18), createdAt: backdate(75)
      },
      {
        userId, name: "Gold's Gym Membership", cost: 59.99, currency: 'USD', billingCycle: 'monthly',
        category: 'Fitness', status: 'active',
        nextRenewalDate: futuredate(14), createdAt: backdate(55) // No usage logged -> Wasted spend!
      },
      {
        userId, name: 'Adobe Creative Cloud', cost: 54.99, currency: 'USD', billingCycle: 'monthly',
        category: 'Productivity', status: 'active',
        nextRenewalDate: futuredate(11), createdAt: backdate(45)
      },
      {
        userId, name: 'Amazon Prime Annual', cost: 139.00, currency: 'USD', billingCycle: 'yearly',
        category: 'Entertainment', status: 'active',
        nextRenewalDate: futuredate(260), createdAt: backdate(105)
      },
      {
        userId, name: 'Claude Pro (Trial)', cost: 20.00, currency: 'USD', billingCycle: 'monthly',
        category: 'Productivity', status: 'active',
        isTrial: true, trialEndDate: futuredate(1), nextRenewalDate: futuredate(1), createdAt: backdate(6)
      },
      {
        userId, name: 'GitHub Copilot', cost: 10.00, currency: 'USD', billingCycle: 'monthly',
        category: 'Development', status: 'active',
        nextRenewalDate: futuredate(16), createdAt: backdate(120)
      },
      {
        userId, name: 'Dropbox Essentials', cost: 19.99, currency: 'USD', billingCycle: 'monthly',
        category: 'Productivity', status: 'active',
        nextRenewalDate: futuredate(5), createdAt: backdate(300)
      },
      {
        userId, name: 'Old Fitness Club', cost: 45.00, currency: 'USD', billingCycle: 'monthly',
        category: 'Fitness', status: 'cancelled',
        cancelledAt: backdate(25), nextRenewalDate: backdate(25), createdAt: backdate(180)
      }
    ];

    const subs = await Subscription.insertMany(subDefs);
    const subMap = {};
    subs.forEach(s => { subMap[s.name] = s._id; });

    const usageLogs = [];
    const addLog = (subName, daysAgo, note) => {
      if (subMap[subName]) {
        usageLogs.push({ subscriptionId: subMap[subName], usedAt: backdate(daysAgo), note });
      }
    };

    [1, 3, 7, 12, 18, 25].forEach(d => addLog('Netflix Premium', d, 'Streaming show'));
    [1, 2, 4, 6, 8, 11, 14, 17].forEach(d => addLog('Spotify Individual', d, 'Daily playlist'));
    [2, 5, 9, 15].forEach(d => addLog('Notion Plus', d, 'Sprint docs'));
    [8, 22].forEach(d => addLog('Adobe Creative Cloud', d, 'Design assets'));
    [2, 6, 14, 21].forEach(d => addLog('Amazon Prime Annual', d, 'Prime Video'));
    [1, 2].forEach(d => addLog('Claude Pro (Trial)', d, 'Code review assist'));
    [1, 2, 3, 4, 5, 8, 12].forEach(d => addLog('GitHub Copilot', d, 'IDE autocompletions'));
    [30, 45, 60].forEach(d => addLog('Old Fitness Club', d, 'Workout'));

    await UsageLog.insertMany(usageLogs);

    const monthsAgo = (m) => {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      return d.toISOString().substring(0, 7);
    };

    const snapshots = [
      {
        userId, month: monthsAgo(3), totalSpend: 145.00,
        totalByCategory: { Entertainment: 35.00, Productivity: 65.00, Development: 10.00, Fitness: 35.00 }
      },
      {
        userId, month: monthsAgo(2), totalSpend: 182.00,
        totalByCategory: { Entertainment: 45.00, Productivity: 77.00, Development: 10.00, Fitness: 50.00 }
      },
      {
        userId, month: monthsAgo(1), totalSpend: 215.00,
        totalByCategory: { Entertainment: 47.00, Productivity: 95.00, Development: 10.00, Fitness: 63.00 }
      }
    ];
    await SpendSnapshot.insertMany(snapshots);
    await upsertCurrentMonthSnapshot(userId);
    await generateNotifications();

    console.log(`✅ Demo seed successfully completed for ${seedEmail}!`);
    process.exit(0);
  } catch (err) {
    console.error('Demo seed error:', err);
    process.exit(1);
  }
};

seedDemo();
