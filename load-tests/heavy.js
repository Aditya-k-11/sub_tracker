import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 50,
  duration: '60s',
};

export default function () {
  let res = http.get('http://127.0.0.1:8082/api/health/ready', {
    headers: { 'Host': 'subtrack.local' }
  });
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
