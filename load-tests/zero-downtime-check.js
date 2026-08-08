import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '90s',
  thresholds: {

    http_req_failed: ['rate<0.01'],   
    checks: ['rate>0.99'],             
  },
};

export default function () {

  const res = http.get('http://127.0.0.1:8080/api/health/ready', {
    headers: { 'Host': 'subtrack.local' }
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 1000,
  });

  sleep(0.2);
}
