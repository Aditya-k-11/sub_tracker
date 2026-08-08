import { connectDB } from '../../server/src/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../../server/src/models/User.js';
import Subscription from '../../server/src/models/Subscription.js';
import UsageLog from '../../server/src/models/UsageLog.js';
import Notification from '../../server/src/models/Notification.js';
import { generateNotifications } from '../../server/src/services/renewalScanService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

const reset = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is not defined in .env");

    await connectDB();

    const seedEmail = 'demo@subtrack.dev';
    const user = await User.findOne({ email: seedEmail });

    if (!user) {
      console.log("No demo user found. Please run seed.js first.");
      process.exit(1);
    }

    const userId = user._id;

    const notifRes = await Notification.deleteMany({ userId });
    const newNotifs = await generateNotifications();

    const gymSub = await Subscription.findOne({ userId, name: "Gold's Gym" });
    let usageRes = { deletedCount: 0 };
    if (gymSub) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      usageRes = await UsageLog.deleteMany({ 
        subscriptionId: gymSub._id,
        usedAt: { $gte: oneHourAgo }
      });
    }

    console.log(`\n--- LIVE DEMO STATE RESET COMPLETE ---
- Notifications: Deleted ${notifRes.deletedCount} old, Regenerated ${newNotifs.created} fresh (Skipped: ${newNotifs.skipped})
- Usage Logs: Removed ${usageRes.deletedCount} recent live-demo logs from Gold's Gym
You are ready to perform the live demo again!
`);

    process.exit(0);
  } catch (error) {
    console.error("Reset script failed:", error);
    process.exit(1);
  }
};

reset();
