const metrics = {
  totalRequests: 0,
  requestsByMethod: {},
  requestsByStatus: {},
  totalDurationMs: 0,
  wsConnectionsActive: 0,
};

function metricsMiddleware(req, res, next) {
  if (req.path === '/api/v1/metrics') return next();

  const start = Date.now();
  metrics.totalRequests++;
  metrics.requestsByMethod[req.method] = (metrics.requestsByMethod[req.method] || 0) + 1;

  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.totalDurationMs += duration;

    const statusGroup = `${Math.floor(res.statusCode / 100)}xx`;
    metrics.requestsByStatus[statusGroup] = (metrics.requestsByStatus[statusGroup] || 0) + 1;
  });

  next();
}

function getPrometheusMetrics() {
  const avgDurationSeconds = metrics.totalRequests > 0 ? (metrics.totalDurationMs / metrics.totalRequests / 1000).toFixed(4) : 0;
  
  let lines = [
    '# HELP http_requests_total Total number of HTTP requests',
    '# TYPE http_requests_total counter',
    `http_requests_total ${metrics.totalRequests}`,
    '',
    '# HELP http_request_duration_seconds_avg Average HTTP request duration in seconds',
    '# TYPE http_request_duration_seconds_avg gauge',
    `http_request_duration_seconds_avg ${avgDurationSeconds}`,
    '',
    '# HELP websocket_connections_active Active WebSocket client connections',
    '# TYPE websocket_connections_active gauge',
    `websocket_connections_active ${metrics.wsConnectionsActive}`,
    '',
  ];

  for (const [method, count] of Object.entries(metrics.requestsByMethod)) {
    lines.push(`http_requests_by_method_total{method="${method}"} ${count}`);
  }

  for (const [status, count] of Object.entries(metrics.requestsByStatus)) {
    lines.push(`http_requests_by_status_total{status="${status}"} ${count}`);
  }

  return lines.join('\n') + '\n';
}

function setWsConnectionsCount(count) {
  metrics.wsConnectionsActive = count;
}

module.exports = {
  metricsMiddleware,
  getPrometheusMetrics,
  setWsConnectionsCount,
};
