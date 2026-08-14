const fetch = require('node-fetch');
async function run() {
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'adityakanojia.ad@gmail.com', password: 'aditya' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  
  const insightsRes = await fetch('http://localhost:8080/api/analytics/insights', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const insights = await insightsRes.json();
  console.log(JSON.stringify(insights, null, 2));
}
run();
