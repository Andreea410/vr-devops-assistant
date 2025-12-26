import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

const WORKER_URL = "http://worker-service:3001/work";

app.get("/api", async (req, res) => {
  const start = Date.now();

  const response = await fetch(WORKER_URL);
  const data = await response.json();

  const totalTime = Date.now() - start;

  res.json({
    service: "api-service",
    worker: data,
    total_time_ms: totalTime
  });
});

app.listen(PORT, () => {
  console.log(`API service running on port ${PORT}`);
});
