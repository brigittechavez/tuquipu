// Test-only lead receiver: accepts POSTs and answers 200, so the e2e suite can
// validate the real success path (server confirmation → generate_lead) locally.
import { createServer } from "node:http";

const port = Number(process.env.MOCK_WEBHOOK_PORT ?? 3999);

createServer((req, res) => {
  if (req.method === "POST") {
    req.resume();
    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end('{"ok":true}');
    });
    return;
  }
  res.writeHead(200);
  res.end("mock webhook");
}).listen(port, () => console.log(`mock webhook on ${port}`));
