const express = require("express");
const app = express();

const PORT = 3001;

app.get("/work", async (req, res) => {
  // simulate slow work
  const delay = Math.random() * 500;
  await new Promise(r => setTimeout(r, delay));

  res.json({
    service: "worker-service",
    delay_ms: Math.round(delay)
  });
});

app.listen(PORT, () => {
  console.log(`Worker service running on port ${PORT}`);
});
