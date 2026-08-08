import { connectDB } from '../../server/src/config/db.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../../server/src/models/User.js';
import Subscription from '../../server/src/models/Subscription.js';
import UsageLog from '../../server/src/models/UsageLog.js';
import Notification from '../../server/src/models/Notification.js';
import SpendSnapshot from '../../server/src/models/SpendSnapshot.js';
import { generateNotifications } from '../../server/src/services/renewalScanService.js';
import { upsertCurrentMonthSnapshot } from '../../server/src/services/snapshotService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is not defined in .env");

    await connectDB();

    const seedEmail = 'adityakanojia.ad@gmail.com';

    const existingUser = await User.findOne({ email: seedEmail });
    if (existingUser) {
      const userId = existingUser._id;
      const existingSubs = await Subscription.find({ userId }).select('_id');
      const subIds = existingSubs.map(s => s._id);
      
      const subRes = await Subscription.deleteMany({ userId });
      const usageRes = await UsageLog.deleteMany({ subscriptionId: { $in: subIds } });
      const notifRes = await Notification.deleteMany({ userId });
      const snapRes = await SpendSnapshot.deleteMany({ userId });
      await User.deleteOne({ _id: userId });

      console.log(`Removed previous demo user:
      - ${subRes.deletedCount} Subscriptions
      - ${usageRes.deletedCount} Usage Logs
      - ${notifRes.deletedCount} Notifications
      - ${snapRes.deletedCount} Spend Snapshots`);
    } else {
      console.log("No existing demo user found. Starting fresh.");
    }

    const hashedPassword = await bcrypt.hash('aditya', 10);
    const demoUser = await User.create({
      name: 'Adi',
      email: seedEmail,
      passwordHash: hashedPassword,
      currency: 'INR'
    });
    console.log(`Created demo user with ID: ${demoUser._id}`);

    const userId = demoUser._id;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const backdate = (days) => new Date(now - days * dayMs);
    const futuredate = (days) => new Date(now + days * dayMs);

    const subDefs = [
      {
        userId, name: 'Netflix', cost: 649, currency: 'INR', billingCycle: 'monthly',
        category: 'Entertainment', status: 'active',
        nextRenewalDate: futuredate(25), createdAt: backdate(90)
      },
      {
        userId, name: 'Spotify', cost: 119, currency: 'INR', billingCycle: 'monthly',
        category: 'Entertainment', status: 'active',
        nextRenewalDate: futuredate(2), createdAt: backdate(60) 
      },
      {
        userId, name: 'Notion', cost: 400, currency: 'INR', billingCycle: 'monthly',
        category: 'Productivity', status: 'active',
        nextRenewalDate: futuredate(20), createdAt: backdate(75)
      },
      {
        userId, name: "Gold's Gym", cost: 1500, currency: 'INR', billingCycle: 'monthly',
        category: 'Fitness', status: 'active',
        nextRenewalDate: futuredate(15), createdAt: backdate(50) 
      },
      {
        userId, name: 'Adobe Creative Cloud', cost: 18000, currency: 'INR', billingCycle: 'yearly',
        category: 'Productivity', status: 'active',
        nextRenewalDate: futuredate(200), createdAt: backdate(45)
      },
      {
        userId, name: 'Amazon Prime', cost: 1499, currency: 'INR', billingCycle: 'yearly',
        category: 'Entertainment', status: 'active',
        nextRenewalDate: futuredate(300), createdAt: backdate(120)
      },
      {
        userId, name: 'Claude Pro', cost: 1670, currency: 'INR', billingCycle: 'monthly',
        category: 'Productivity', status: 'active',
        isTrial: true, trialEndDate: futuredate(1), nextRenewalDate: futuredate(1), createdAt: backdate(6) 
      },
      {
        userId, name: 'Old Gym Membership', cost: 999, currency: 'INR', billingCycle: 'monthly',
        category: 'Fitness', status: 'cancelled',
        cancelledAt: backdate(20), nextRenewalDate: backdate(20), createdAt: backdate(100)
      },
      {
        userId, name: 'Disney+ Hotstar', cost: 299, currency: 'INR', billingCycle: 'monthly',
        category: 'Entertainment', status: 'active',
        nextRenewalDate: futuredate(10), createdAt: backdate(40)
      }
    ];

    const subs = await Subscription.insertMany(subDefs);

    const subMap = {};
    subs.forEach(s => { subMap[s.name] = s._id; });

    const usageLogs = [];
    const addLog = (subName, daysAgo, note) => {
      usageLogs.push({ subscriptionId: subMap[subName], usedAt: backdate(daysAgo), note });
    };

    [2, 5, 8, 11, 15, 19].forEach(d => addLog('Netflix', d, 'Watched a movie'));
    
    [1, 2, 4, 5, 7, 8, 10, 11, 13, 14].forEach(d => addLog('Spotify', d, 'Listened to music'));
    
    [5, 12, 18].forEach(d => addLog('Notion', d, 'Organized notes'));

    [10, 25].forEach(d => addLog('Adobe Creative Cloud', d, 'Edited a photo'));
    
    [3, 12, 22, 29].forEach(d => addLog('Amazon Prime', d, 'Watched a series'));
    
    [1, 3].forEach(d => addLog('Claude Pro', d, 'Generated text'));
    
    [25, 30, 45, 60, 75].forEach(d => addLog('Old Gym Membership', d, 'Workout'));
    
    addLog('Disney+ Hotstar', 20, 'Watched a match');

    await UsageLog.insertMany(usageLogs);

    const monthsAgo = (m) => {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      return d.toISOString().substring(0, 7);
    };

    const snapshots = [
      {
        userId,
        month: monthsAgo(3),
        totalSpend: 2800,
        totalByCategory: { Entertainment: 700, Productivity: 1500, Fitness: 600 }
      },
      {
        userId,
        month: monthsAgo(2),
        totalSpend: 3100,
        totalByCategory: { Entertainment: 900, Productivity: 1600, Fitness: 600 }
      },
      {
        userId,
        month: monthsAgo(1),
        totalSpend: 3350,
        totalByCategory: { Entertainment: 1067, Productivity: 2000, Fitness: 283 }
      }
    ];
    await SpendSnapshot.insertMany(snapshots);

    await upsertCurrentMonthSnapshot(userId);

    const notifResult = await generateNotifications();

    console.log(`\n--- SEED COMPLETE ---
User: ${demoUser.email}
Password: aditya
Subscriptions Created: ${subs.length}
Usage Logs Created: ${usageLogs.length}
Spend Snapshots Created: ${snapshots.length + 1}
Notifications: Created ${notifResult.created}, Skipped ${notifResult.skipped}, Total Scanned ${notifResult.total}
`);

    process.exit(0);
  } catch (error) {
    console.error("Seed script failed:", error);
    process.exit(1);
  }
};

seed();
