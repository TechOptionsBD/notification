// src/utils/instrument.ts
import * as prometheus from 'prom-client';

// Create a custom registry
const registry = new prometheus.Registry();
registry.setDefaultLabels({
  app: 'edge-notification-service',
  version: '1.0.0',
});

// Collect default metrics
prometheus.collectDefaultMetrics({
  register: registry,
  prefix: 'app_',
  gcDurationBuckets: [0.1, 1, 2, 5],
});

// Export the registry
export { registry };

// Optional: Export individual metrics if needed
export const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'app_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // 0.1 to 10 seconds
});
