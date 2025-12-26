import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 5 },   
    { duration: "20s", target: 20 },  // moderate load
    { duration: "20s", target: 50 },  // heavy load
    { duration: "10s", target: 0 },   // cool down
  ],

  thresholds: {
    http_req_failed: ["rate<0.05"],      
    http_req_duration: ["p(95)<800"],    
  },
};

export default function () {
  const res = http.get("http://localhost:3000/api");

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(0.1);
}
