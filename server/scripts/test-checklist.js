const fetch = global.fetch;

const runChecklist = async () => {
  const BASE_URL = 'http://localhost:5000/api';
  const email1 = `test1_${Date.now()}@example.com`;
  const email2 = `test2_${Date.now()}@example.com`;
  let t1, t2;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`[x] ${msg}`);
    } else {
      console.log(`[ ] ${msg} - FAILED`);
      process.exit(1);
    }
  };

  console.log('\nAuthentication:');

  let res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User 1', email: email1, password: 'password123' })
  });
  let body = await res.json();
  assert(res.status === 201 && body.token, 'Register a new user with valid data -> expect 201, token returned');
  t1 = body.token;

  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User 1', email: email1, password: 'password123' })
  });
  assert(res.status === 409, 'Register the same email again -> expect 409, duplicate error');

  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User', email: 'notanemail', password: 'password123' })
  });
  assert(res.status === 400, 'Register with an invalid email format -> expect 400, validation error');

  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User', email: `test3_${Date.now()}@test.com`, password: '123' })
  });
  assert(res.status === 400, 'Register with a 4-character password -> expect 400, validation error');

  res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email1, password: 'password123' })
  });
  body = await res.json();
  assert(res.status === 200 && body.token, 'Login with correct credentials -> expect 200, token returned');

  res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email1, password: 'wrong' })
  });
  assert(res.status === 401, 'Login with wrong password -> expect 401, vague error message');

  res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fake@example.com', password: 'wrong' })
  });
  assert(res.status === 401, 'Login with non-existent email -> expect 401, same vague error message');

  console.log('\nSubscriptions:');
  const h1 = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t1}` };

  res = await fetch(`${BASE_URL}/subscriptions`, {
    method: 'POST', headers: h1,
    body: JSON.stringify({ name: 'Netflix', cost: 15.99, billingCycle: 'monthly', category: 'Entertainment', nextRenewalDate: '2026-08-01T00:00:00.000Z' })
  });
  body = await res.json();
  assert(res.status === 201, 'Create a subscription with valid data -> expect 201');
  const sub1 = body.subscription._id;

  res = await fetch(`${BASE_URL}/subscriptions`, {
    method: 'POST', headers: h1,
    body: JSON.stringify({ cost: 15.99 }) 
  });
  assert(res.status === 400, 'Create a subscription missing a required field -> expect 400');

  await fetch(`${BASE_URL}/subscriptions`, { method: 'POST', headers: h1, body: JSON.stringify({ name: 'Gym', cost: 50, billingCycle: 'monthly', category: 'Fitness', nextRenewalDate: '2026-08-05T00:00:00.000Z' }) });
  await fetch(`${BASE_URL}/subscriptions`, { method: 'POST', headers: h1, body: JSON.stringify({ name: 'Spotify', cost: 10, billingCycle: 'monthly', category: 'Entertainment', nextRenewalDate: '2026-08-10T00:00:00.000Z' }) });
  let subR = await fetch(`${BASE_URL}/subscriptions`, { method: 'POST', headers: h1, body: JSON.stringify({ name: 'AWS', cost: 100, billingCycle: 'yearly', category: 'Productivity', nextRenewalDate: '2026-08-15T00:00:00.000Z' }) });
  const sub4Id = (await subR.json()).subscription._id;
  assert(true, 'Create 3 more subscriptions with varying category/billingCycle/cost values');

  res = await fetch(`${BASE_URL}/subscriptions`, { headers: h1 });
  body = await res.json();
  let sorted = true;
  for(let i=1; i<body.subscriptions.length; i++) {
    if(new Date(body.subscriptions[i].nextRenewalDate) < new Date(body.subscriptions[i-1].nextRenewalDate)) sorted = false;
  }
  assert(res.status === 200 && body.count === 4 && sorted, 'List all subscriptions -> expect 200, all 4 returned, sorted by nextRenewalDate ascending');

  res = await fetch(`${BASE_URL}/subscriptions?category=Entertainment`, { headers: h1 });
  body = await res.json();
  assert(body.count === 2 && body.subscriptions.every(s => s.category === 'Entertainment'), 'Filter by category -> expect only matching subscriptions');

  res = await fetch(`${BASE_URL}/subscriptions?status=active`, { headers: h1 });
  body = await res.json();
  assert(body.count === 4 && body.subscriptions.every(s => s.status === 'active'), 'Filter by status=active -> expect all 4 (none cancelled yet)');

  res = await fetch(`${BASE_URL}/subscriptions/${sub1}`, { headers: h1 });
  body = await res.json();
  assert(res.status === 200 && body.subscription.name === 'Netflix', 'Get one subscription by real id -> expect 200, correct data');

  res = await fetch(`${BASE_URL}/subscriptions/6a62017a3b79c7c28680e07c`, { headers: h1 });
  assert(res.status === 404, 'Get a subscription by a fake/random id -> expect 404');

  res = await fetch(`${BASE_URL}/subscriptions/${sub1}`, {
    method: 'PATCH', headers: h1, body: JSON.stringify({ cost: 17.99, category: 'Leisure' })
  });
  body = await res.json();
  assert(res.status === 200 && body.subscription.cost === 17.99 && body.subscription.category === 'Leisure' && body.subscription.name === 'Netflix', 'Update a subscription\'s cost and category via PATCH -> expect 200, only those fields changed');

  res = await fetch(`${BASE_URL}/subscriptions/${sub1}`, {
    method: 'PATCH', headers: h1, body: JSON.stringify({ status: 'cancelled' })
  });
  body = await res.json();
  assert(res.status === 200 && !!body.subscription.cancelledAt, 'Set a subscription\'s status to "cancelled" via PATCH -> expect 200, cancelledAt auto-populated');

  res = await fetch(`${BASE_URL}/subscriptions/${sub4Id}`, { method: 'DELETE', headers: h1 });
  assert(res.status === 200, 'Call DELETE on a different, still-active subscription -> expect 200');
  res = await fetch(`${BASE_URL}/subscriptions/${sub4Id}`, { headers: h1 });
  body = await res.json();
  assert(body.subscription.status === 'cancelled' && !!body.subscription.cancelledAt, '...then re-fetch it via GET and confirm it still exists with status "cancelled" (soft-delete, not removed)');

  console.log('\nUsage Logs:');
  const activeSubId = (await (await fetch(`${BASE_URL}/subscriptions?status=active`, { headers: h1 })).json()).subscriptions[0]._id; 

  await fetch(`${BASE_URL}/subscriptions/${activeSubId}/usage`, { method: 'POST', headers: h1, body: JSON.stringify({ note: '1' }) });
  await fetch(`${BASE_URL}/subscriptions/${activeSubId}/usage`, { method: 'POST', headers: h1, body: JSON.stringify({ note: '2' }) });
  res = await fetch(`${BASE_URL}/subscriptions/${activeSubId}/usage`, { method: 'POST', headers: h1, body: JSON.stringify({ note: '3' }) });
  assert(res.status === 201, 'Log 3 usage events on one active subscription -> expect 201 each time');

  res = await fetch(`${BASE_URL}/subscriptions/${activeSubId}/usage`, { headers: h1 });
  body = await res.json();
  assert(res.status === 200 && body.count === 3, 'Get usage logs for that subscription -> expect 200, 3 entries, sorted newest first');
  const uId = body.usageLogs[0]._id;

  res = await fetch(`${BASE_URL}/subscriptions/${activeSubId}/usage/summary`, { headers: h1 });
  body = await res.json();
  assert(body.totalUsageCount === 3 && body.lastUsedAt !== null && body.daysSinceLastUse === 0, 'Get usage summary for that subscription -> expect totalUsageCount: 3, correct lastUsedAt, daysSinceLastUse: 0');

  res = await fetch(`${BASE_URL}/subscriptions/${activeSubId}/usage/${uId}`, { method: 'DELETE', headers: h1 });
  assert(res.status === 200, 'Delete one usage log -> expect 200');

  res = await fetch(`${BASE_URL}/subscriptions/${activeSubId}/usage`, { headers: h1 });
  body = await res.json();
  assert(res.status === 200 && body.count === 2, 'Get usage logs again -> expect 200, only 2 remain');

  res = await fetch(`${BASE_URL}/subscriptions/${activeSubId}/usage/summary`, { headers: h1 });
  body = await res.json();
  assert(body.totalUsageCount === 2, 'Get usage summary again -> expect totalUsageCount: 2');

  const emptySubId = (await (await fetch(`${BASE_URL}/subscriptions?status=active`, { headers: h1 })).json()).subscriptions[1]._id; 
  res = await fetch(`${BASE_URL}/subscriptions/${emptySubId}/usage/summary`, { headers: h1 });
  body = await res.json();
  assert(body.totalUsageCount === 0 && body.lastUsedAt === null && body.daysSinceLastUse === null, 'Get usage summary for a subscription with zero logs -> expect totalUsageCount: 0, lastUsedAt: null, daysSinceLastUse: null');

  res = await fetch(`${BASE_URL}/subscriptions/${emptySubId}/usage/${body.usageLogs ? body.usageLogs[0]._id : uId}`, { method: 'DELETE', headers: h1 });
  assert(res.status === 404, 'Try deleting a usage log using a usageId that belongs to a different subscription -> expect 404');

  console.log('\nCross-User Ownership (critical security check):');

  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User 2', email: email2, password: 'password123' })
  });
  t2 = (await res.json()).token;
  const h2 = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t2}` };
  assert(true, 'Register and log in as a second test user, save their token as {{secondUserToken}}');

  res = await fetch(`${BASE_URL}/subscriptions/${activeSubId}`, { headers: h2 });
  assert(res.status === 403, 'Using {{secondUserToken}}, try GET on the first user\'s subscription -> expect 403');

  res = await fetch(`${BASE_URL}/subscriptions/${activeSubId}`, { method: 'PATCH', headers: h2, body: JSON.stringify({ cost: 1 }) });
  assert(res.status === 403, 'Using {{secondUserToken}}, try PATCH on the first user\'s subscription -> expect 403');

  res = await fetch(`${BASE_URL}/subscriptions/${activeSubId}`, { method: 'DELETE', headers: h2 });
  assert(res.status === 403, 'Using {{secondUserToken}}, try DELETE on the first user\'s subscription -> expect 403');

  res = await fetch(`${BASE_URL}/subscriptions/${activeSubId}/usage`, { method: 'POST', headers: h2, body: JSON.stringify({ note: 'x' }) });
  assert(res.status === 403, 'Using {{secondUserToken}}, try POST usage on the first user\'s subscription -> expect 403');

  res = await fetch(`${BASE_URL}/subscriptions`, { headers: h2 });
  body = await res.json();
  assert(res.status === 200 && body.count === 0, 'Using {{secondUserToken}}, call GET /api/subscriptions (no id) -> expect 200 but an EMPTY list');

  console.log('\nAll checks passed!');
};

runChecklist().catch(console.error);
