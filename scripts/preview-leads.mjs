// Local-only review of the full lead flow (form → confirmation) before the real
// endpoint exists. Starts a mock webhook that accepts every request and serves the
// site with delivery enabled on http://localhost:3000. Nothing is stored or sent
// anywhere: the mock only answers 200. Never deploy this build: run `npm run build` again afterwards.
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";

const MOCK_PORT = 3999;
createServer((req, res) => {
  req.resume();
  req.on("end", () => {
    res.writeHead(req.method === "POST" ? 200 : 405, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: req.method === "POST" }));
  });
}).listen(MOCK_PORT);

const env = { ...process.env, LEAD_WEBHOOK_URL: `http://localhost:${MOCK_PORT}/leads`, LEAD_PRIVACY_APPROVED: "true" };
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const shell = process.platform === "win32";

const build = spawnSync(npx, ["next", "build"], { stdio: "inherit", env, shell });
if (build.status !== 0) process.exit(build.status ?? 1);

console.log("\nVista previa del formulario con envío simulado: http://localhost:3000/demo\n");
spawn(npx, ["next", "start", "-p", "3000"], { stdio: "inherit", env, shell });
