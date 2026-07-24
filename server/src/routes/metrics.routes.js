const router = require('express').Router();
const { getPrometheusMetrics } = require('../middleware/metrics.middleware');

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(getPrometheusMetrics());
});

module.exports = router;
