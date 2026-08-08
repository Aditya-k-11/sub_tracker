import {
  httpRequestsTotal,
  httpRequestDurationSeconds,
  activeConnectionsGauge,
} from '../config/metrics.js';

const metricsMiddleware = (req, res, next) => {
  activeConnectionsGauge.inc();

  const endTimer = httpRequestDurationSeconds.startTimer();

  res.on('finish', () => {

    const routeLabel = req.route?.path || req.path;

    const labels = {
      method: req.method,
      route: routeLabel,
      status_code: res.statusCode,
    };

    httpRequestsTotal.inc(labels);
    endTimer(labels);
    activeConnectionsGauge.dec();
  });

  next();
};

export default metricsMiddleware;
