import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

import mongoose from 'mongoose';
import User from '../../server/src/models/User.js';
import Subscription from '../../server/src/models/Subscription.js';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/subtrack';
const seedEmail = 'adityakanojia.ad@gmail.com';

async function addSubs() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected:', new URL(uri).hostname);

    const user = await User.findOne({ email: seedEmail });
    if (!user) {
      console.log('Demo user not found!');
      process.exit(1);
    }

    const newSubs = [
      {
        userId: user._id,
        name: 'Amazon Prime',
        cost: 1499,
        billingCycle: 'yearly',
        category: 'Entertainment',
        nextRenewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: 'active'
      },
      {
        userId: user._id,
        name: 'Figma',
        cost: 1200,
        billingCycle: 'monthly',
        category: 'Software',
        nextRenewalDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        status: 'active'
      },
      {
        userId: user._id,
        name: 'Disney+',
        cost: 899,
        billingCycle: 'yearly',
        category: 'Entertainment',
        nextRenewalDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
        status: 'active'
      },
      {
        userId: user._id,
        name: 'Dropbox',
        cost: 999,
        billingCycle: 'monthly',
        category: 'Productivity',
        nextRenewalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'active'
      }
    ];

    await Subscription.insertMany(newSubs);
    console.log(`Added ${newSubs.length} new subscriptions to ${user.email}`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

addSubs();
