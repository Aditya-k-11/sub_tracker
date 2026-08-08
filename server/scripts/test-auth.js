import { execSync } from 'child_process';

const runTests = async () => {
  const BASE_URL = 'http://localhost:5000/api';
  let token = '';

  const email = `testuser_${Date.now()}@example.com`;

  console.log('1. Register with invalid email');
  let res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'notanemail', password: 'password123' })
  });
  console.log(`Status: ${res.status} (expected 400)`);
  console.log(await res.json());

  console.log('\n2. Register with short password');
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password: '123' })
  });
  console.log(`Status: ${res.status} (expected 400)`);
  console.log(await res.json());

  console.log('\n3. Register valid user');
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
  });
  console.log(`Status: ${res.status} (expected 201)`);
  const data = await res.json();
  console.log(data);

  console.log('\n4. Login with non-existent email');
  res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nobody@example.com', password: 'password123' })
  });
  console.log(`Status: ${res.status} (expected 401)`);
  console.log(await res.json());

  console.log('\n5. Trigger unexpected error (stopping MongoDB...)');
  execSync('docker-compose stop mongodb', { stdio: 'inherit', cwd: 'c:/MY WORK/subtrack' });
  
  try {
    res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Error User', email: `err_${Date.now()}@example.com`, password: 'password123' })
    });
    console.log(`Status: ${res.status} (expected 500)`);
    console.log(await res.json());
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }

  console.log('\n6. Restarting MongoDB...');
  execSync('docker-compose start mongodb', { stdio: 'inherit', cwd: 'c:/MY WORK/subtrack' });
  console.log('Done!');
};

runTests().catch(console.error);
