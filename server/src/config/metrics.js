import client from 'prom-client';

const register = new client.Registry();

client.collectDefaultMetrics({ register, prefix: 'subtrack_' });

const httpRequestsTotal = new client.Counter({
  name: 'subtrack_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'subtrack_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

const activeConnectionsGauge = new client.Gauge({
  name: 'subtrack_active_connections',
  help: 'Number of currently active HTTP connections being handled',
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(activeConnectionsGauge);

export {
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  activeConnectionsGauge,
};
