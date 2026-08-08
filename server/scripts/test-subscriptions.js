const runTests = async () => {
  const BASE_URL = 'http://localhost:5000/api';

  const email1 = `u1_${Date.now()}@test.com`;
  let res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User 1', email: email1, password: 'password123' })
  });
  const data1 = await res.json();
  const token1 = data1.token;

  const email2 = `u2_${Date.now()}@test.com`;
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User 2', email: email2, password: 'password123' })
  });
  const data2 = await res.json();
  const token2 = data2.token;

  const headers1 = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` };
  const headers2 = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` };

  console.log('--- Creating Subscriptions (User 1) ---');
  const subs = [
    { name: 'Netflix', cost: 15.99, billingCycle: 'monthly', category: 'Entertainment', nextRenewalDate: '2026-08-01T00:00:00.000Z' },
    { name: 'Gym', cost: 50, billingCycle: 'monthly', category: 'Fitness', nextRenewalDate: '2026-08-05T00:00:00.000Z' },
    { name: 'Spotify', cost: 10, billingCycle: 'monthly', category: 'Entertainment', nextRenewalDate: '2026-08-10T00:00:00.000Z' }
  ];
  
  let createdSubs = [];
  for (let s of subs) {
    const r = await fetch(`${BASE_URL}/subscriptions`, { method: 'POST', headers: headers1, body: JSON.stringify(s) });
    console.log(`Created ${s.name}: ${r.status}`);
    const body = await r.json();
    createdSubs.push(body.subscription);
  }

  console.log('\n--- List all subscriptions (User 1) ---');
  res = await fetch(`${BASE_URL}/subscriptions`, { headers: headers1 });
  const allSubs = await res.json();
  console.log(`Count: ${allSubs.count} (expected 3)`);

  console.log('\n--- Filter by Category = Entertainment ---');
  res = await fetch(`${BASE_URL}/subscriptions?category=Entertainment`, { headers: headers1 });
  const entSubs = await res.json();
  console.log(`Count: ${entSubs.count} (expected 2)`);

  console.log('\n--- Filter by Status = active ---');
  res = await fetch(`${BASE_URL}/subscriptions?status=active`, { headers: headers1 });
  const actSubs = await res.json();
  console.log(`Count: ${actSubs.count} (expected 3)`);

  const subId = createdSubs[0]._id; 

  console.log('\n--- Get Subscription By ID ---');
  res = await fetch(`${BASE_URL}/subscriptions/${subId}`, { headers: headers1 });
  console.log(`Status: ${res.status} (expected 200)`);

  console.log('\n--- Get Fake ID ---');
  res = await fetch(`${BASE_URL}/subscriptions/6a62017a3b79c7c28680e07c`, { headers: headers1 });
  console.log(`Status: ${res.status} (expected 404)`);

  console.log('\n--- Update Subscription (PATCH) ---');
  res = await fetch(`${BASE_URL}/subscriptions/${subId}`, {
    method: 'PATCH',
    headers: headers1,
    body: JSON.stringify({ cost: 17.99 })
  });
  console.log(`Status: ${res.status} (expected 200)`);
  const updatedBody = await res.json();
  console.log(`New cost: ${updatedBody.subscription.cost} (expected 17.99)`);

  console.log('\n--- Cancel via PATCH ---');
  const gymId = createdSubs[1]._id;
  res = await fetch(`${BASE_URL}/subscriptions/${gymId}`, {
    method: 'PATCH',
    headers: headers1,
    body: JSON.stringify({ status: 'cancelled' })
  });
  const cancelledBody = await res.json();
  console.log(`Status: ${res.status} (expected 200), CancelledAt present: ${!!cancelledBody.subscription.cancelledAt}`);

  console.log('\n--- Delete (Soft Delete) ---');
  const spotifyId = createdSubs[2]._id;
  res = await fetch(`${BASE_URL}/subscriptions/${spotifyId}`, { method: 'DELETE', headers: headers1 });
  const deletedBody = await res.json();
  console.log(`Status: ${res.status} (expected 200), CancelledAt present: ${!!deletedBody.subscription.cancelledAt}`);

  console.log('\n--- Log Usage Events (3 events) ---');
  await fetch(`${BASE_URL}/subscriptions/${subId}/usage`, { method: 'POST', headers: headers1, body: JSON.stringify({ note: 'Watched a movie' }) });
  await fetch(`${BASE_URL}/subscriptions/${subId}/usage`, { method: 'POST', headers: headers1, body: JSON.stringify({ note: 'Watched a series' }) });
  let rUsage = await fetch(`${BASE_URL}/subscriptions/${subId}/usage`, { method: 'POST', headers: headers1, body: JSON.stringify({ note: 'Documentary' }) });
  const lastUsageDoc = await rUsage.json();
  const usageIdToDelete = lastUsageDoc.usageLog._id;
  
  res = await fetch(`${BASE_URL}/subscriptions/${subId}/usage`, { headers: headers1 });
  let usageBody = await res.json();
  console.log(`Usage count: ${usageBody.count} (expected 3)`);

  console.log('\n--- Get Usage Summary (3 events) ---');
  res = await fetch(`${BASE_URL}/subscriptions/${subId}/usage/summary`, { headers: headers1 });
  let summaryBody = await res.json();
  console.log(`Status: ${res.status} (expected 200)`);
  console.log(`totalUsageCount: ${summaryBody.totalUsageCount} (expected 3)`);
  console.log(`daysSinceLastUse: ${summaryBody.daysSinceLastUse} (expected 0)`);

  console.log('\n--- Delete Usage Log ---');
  res = await fetch(`${BASE_URL}/subscriptions/${subId}/usage/${usageIdToDelete}`, { method: 'DELETE', headers: headers1 });
  console.log(`Status: ${res.status} (expected 200)`);
  
  res = await fetch(`${BASE_URL}/subscriptions/${subId}/usage`, { headers: headers1 });
  usageBody = await res.json();
  console.log(`Usage count after delete: ${usageBody.count} (expected 2)`);

  console.log('\n--- Get Usage Summary (2 events) ---');
  res = await fetch(`${BASE_URL}/subscriptions/${subId}/usage/summary`, { headers: headers1 });
  summaryBody = await res.json();
  console.log(`totalUsageCount: ${summaryBody.totalUsageCount} (expected 2)`);

  console.log('\n--- Get Usage Summary (0 events) ---');
  res = await fetch(`${BASE_URL}/subscriptions/${gymId}/usage/summary`, { headers: headers1 });
  let emptySummary = await res.json();
  console.log(`Status: ${res.status} (expected 200)`);
  console.log(`totalUsageCount: ${emptySummary.totalUsageCount} (expected 0)`);
  console.log(`lastUsedAt: ${emptySummary.lastUsedAt} (expected null)`);
  console.log(`daysSinceLastUse: ${emptySummary.daysSinceLastUse} (expected null)`);

  console.log('\n--- Delete usage log belonging to different sub ---');
  
  const remainingLogId = usageBody.usageLogs[0]._id;
  res = await fetch(`${BASE_URL}/subscriptions/${gymId}/usage/${remainingLogId}`, { method: 'DELETE', headers: headers1 });
  console.log(`Status: ${res.status} (expected 404)`);

  console.log('\n--- Cross-User Authorization Tests ---');
  res = await fetch(`${BASE_URL}/subscriptions/${subId}`, { headers: headers2 });
  console.log(`GET cross-user: ${res.status} (expected 403)`);

  res = await fetch(`${BASE_URL}/subscriptions/${subId}`, { method: 'PATCH', headers: headers2, body: JSON.stringify({ cost: 1 }) });
  console.log(`PATCH cross-user: ${res.status} (expected 403)`);

  res = await fetch(`${BASE_URL}/subscriptions/${subId}`, { method: 'DELETE', headers: headers2 });
  console.log(`DELETE cross-user: ${res.status} (expected 403)`);
  
  res = await fetch(`${BASE_URL}/subscriptions/${subId}/usage`, { method: 'POST', headers: headers2 });
  console.log(`POST usage cross-user: ${res.status} (expected 403)`);

  console.log('\nAll tests complete.');
};

runTests().catch(console.error);
