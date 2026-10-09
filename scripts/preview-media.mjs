// Local-only review of TEST media (public/assets/product/pruebas).
// Builds and serves the site with MEDIA_PREVIEW=1 on http://localhost:3000.
// Never deploy this build: run `npm run build` again afterwards.
import { spawnSync, spawn } from "node:child_process";

const env = { ...process.env, MEDIA_PREVIEW: "1" };
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

const build = spawnSync(npx, ["next", "build"], { stdio: "inherit", env, shell: process.platform === "win32" });
if (build.status !== 0) process.exit(build.status ?? 1);

console.log("\nVista previa con material de prueba: http://localhost:3000\n");
spawn(npx, ["next", "start", "-p", "3000"], { stdio: "inherit", env, shell: process.platform === "win32" });
