import express from "express";
import fetch from "node-fetch";
import client from "prom-client";

const app = express();
const PORT = 3000;
const WORKER_URL = "http://worker-service:3001/work";

/**
 * ============================
 * Prometheus metrics setup
 * ============================
 */

// Collect default Node.js metrics
client.collectDefaultMetrics();

// Count API requests
const httpRequestsTotal = new client.Counter({
  name: "api_http_requests_total",
  help: "Total number of HTTP requests to api-service",
  labelNames: ["method", "route", "status"],
});

// Measure API request duration
const httpRequestDuration = new client.Histogram({
  name: "api_http_request_duration_ms",
  help: "Duration of HTTP requests to api-service",
  labelNames: ["method", "route", "status"],
  buckets: [50, 100, 200, 300, 400, 500, 750, 1000],
});

/**
 * ============================
 * Business endpoint
 * ============================
 */
app.get("/api", async (req, res) => {
  const start = Date.now();

  const response = await fetch(WORKER_URL);
  const data = await response.json();

  const duration = Date.now() - start;

  res.json({
    service: "api-service",
    worker: data,
    total_time_ms: duration,
  });

  httpRequestsTotal.inc({
    method: req.method,
    route: "/api",
    status: res.statusCode,
  });

  httpRequestDuration.observe(
    {
      method: req.method,
      route: "/api",
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
  console.log(`API service running on port ${PORT}`);
});
