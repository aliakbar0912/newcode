/**
 * Task 23 repro v2 — forge a valid web-session cookie locally (same HMAC
 * format as src/lib/session) and test whether / or /download invalidates or
 * clears it. No upstream credentials needed: /download renders from session
 * payload + keyless client-config only.
 */
import { createHmac } from "node:crypto";

const SITE = process.env.SITE ?? "http://localhost:3112";
const SECRET = process.env.SESSION_SECRET ?? "repro-secret-t23";

const b64url = (buf) => Buffer.from(buf).toString("base64url");

function forgeCookie(payload) {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `devora_session=${body}.${sig}`;
}

const cookie = forgeCookie({
  sub: "qa-repro-t23",
  email: "qa-repro@devora.test",
  name: "QA Repro",
  token: "fake-device-token-not-used-by-download",
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
});

console.log("forged cookie for", SITE, "secret:", SECRET);

async function check(path) {
  const res = await fetch(`${SITE}${path}`, { headers: { cookie }, redirect: "manual" });
  const html = await res.text();
  const set = res.headers.getSetCookie?.() ?? [];
  const hasDash = html.includes("Dashboard");
  const hasSignOut = /Sign out/.test(html);
  const hasSignIn = /href="\/login"/.test(html);
  const clears = set.some((c) => /^devora_session=;/.test(c.split(";")[0] + ";") && /Max-Age=0/i.test(c));
  console.log(
    `${path} -> ${res.status} | Dashboard:${hasDash} SignOut:${hasSignOut} SignIn-link:${hasSignIn} clearsCookie:${clears}` +
      (set.length ? ` | set-cookie: ${set.map((s) => s.split(";")[0]).join(" | ")}` : "")
  );
  return { res, html };
}

console.log("--- logged-in checks ---");
await check("/");
const dash = await check("/dashboard");
console.log("--- the suspect ---");
await check("/download");
await check("/download");
console.log("--- after /download, dashboard again ---");
const dash2 = await check("/dashboard");
console.log(
  dash2.res.status === 200 && dash2.html.includes("Dashboard")
    ? "SESSION SURVIVED /download on this build"
    : "SESSION APPEARS DEAD after /download — bug reproduced"
);
