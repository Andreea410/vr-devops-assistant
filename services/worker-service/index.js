const express = require("express");
const client = require("prom-client");

const app = express();
const PORT = 3001;

/**
 * ============================
 * Prometheus metrics setup
 * ============================
 */

client.collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
  name: "worker_http_requests_total",
  help: "Total number of HTTP requests to worker-service",
  labelNames: ["method", "route", "status"],
});

const httpRequestDuration = new client.Histogram({
  name: "worker_http_request_duration_ms",
  help: "Duration of HTTP requests to worker-service",
  labelNames: ["method", "route", "status"],
  buckets: [50, 100, 200, 300, 400, 500, 750, 1000],
});

/**
 * ============================
 * Business endpoint
 * ============================
 */
app.get("/work", async (req, res) => {
  const start = Date.now();

  const delay = Math.random() * 500;
  await new Promise((r) => setTimeout(r, delay));

  res.json({
    service: "worker-service",
    delay_ms: Math.round(delay),
  });

  const duration = Date.now() - start;

  httpRequestsTotal.inc({
    method: req.method,
    route: "/work",
    status: res.statusCode,
  });

  httpRequestDuration.observe(
    {
      method: req.method,
      route: "/work",
      status: res.statusCode,
    },
    duration
  );
});

/**
 * ============================
 * Metrics endpoint
 * ============================
 */
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`Worker service running on port ${PORT}`);
});
