import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 5 },    
    { duration: '3m', target: 50 },   
    { duration: '3m', target: 50 },   
    { duration: '2m', target: 5 },    
    { duration: '3m', target: 5 },    
  ],
};

const BASE_URL = 'http://backend.subtrack.svc.cluster.local:5000';

export function setup() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'demo@subtrack.dev',
    password: 'Demo@1234'
  }), {
    headers: { 
      'Content-Type': 'application/json'
    }
  });

  let token = "";
  try {
    token = JSON.parse(loginRes.body).token;
  } catch(e) {
    console.error("Login failed:", loginRes.body);
  }
  return { token };
}

export default function (data) {
  const res = http.get(`${BASE_URL}/api/analytics/categories`, {
    headers: {
      'Authorization': `Bearer ${data.token}`
    }
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(0.1);
}
