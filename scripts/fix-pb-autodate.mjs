#!/usr/bin/env node
/**
 * One-off repair: add PocketBase's `created`/`updated` autodate system fields to
 * the three website_* collections. Collections created via the API (unlike the
 * PB admin UI) do not get them automatically, so `sort=-created` failed with 400
 * and the admin panel showed "collection is not available in the account service".
 *
 * Idempotent: fields that already exist are left alone.
 *
 * Usage:
 *   PB_URL=https://pocketbase.example.com PB_EMAIL=... PB_PASSWORD='...' node scripts/fix-pb-autodate.mjs
 */

const BASE_URL = (process.env.PB_URL || "").trim().replace(/\/+$/, "");
const EMAIL = (process.env.PB_EMAIL || "").trim();
const PASSWORD = process.env.PB_PASSWORD || "";
const COLLECTIONS = ["website_pricing", "website_support_messages", "website_webhook_events"];

if (!BASE_URL || !EMAIL || !PASSWORD) {
  console.error("Missing PB_URL / PB_EMAIL / PB_PASSWORD");
  process.exit(1);
}

async function call(method, path, { body, token } = {}) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      accept: "application/json",
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: token } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text().catch(() => "");
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}
  return { status: res.status, data };
}

const AUTODATES = [
  { name: "created", type: "autodate", onCreate: true, onUpdate: false },
  { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
];

async function main() {
  const auth = await call("POST", "/api/collections/_superusers/auth-with-password", {
    body: { identity: EMAIL, password: PASSWORD },
  });
  if (auth.status !== 200 || typeof auth.data?.token !== "string") {
    console.error(`superuser sign-in failed (HTTP ${auth.status})`);
    process.exit(1);
  }
  const token = auth.data.token;

  for (const name of COLLECTIONS) {
    const col = await call("GET", `/api/collections/${name}`, { token });
    if (col.status !== 200) {
      console.error(`! ${name}: could not read collection (HTTP ${col.status})`);
      continue;
    }
    const fields = Array.isArray(col.data?.fields) ? col.data.fields : [];
    const has = (n) => fields.some((f) => f?.name === n);
    if (has("created") && has("updated")) {
      console.log(`= ${name}: created/updated already present — left untouched.`);
      continue;
    }
    const merged = [...fields];
    if (!has("created")) merged.push(AUTODATES[0]);
    if (!has("updated")) merged.push(AUTODATES[1]);
    const patch = await call("PATCH", `/api/collections/${name}`, { token, body: { fields: merged } });
    if (patch.status === 200) console.log(`+ ${name}: created/updated autodate fields added.`);
    else console.error(`! ${name}: FAILED (HTTP ${patch.status}) — ${JSON.stringify(patch.data)?.slice(0, 300)}`);
  }

  // Verify the exact list calls the admin API makes.
  for (const name of COLLECTIONS) {
    const sort = name === "website_pricing" ? "sortOrder" : "-created";
    const r = await call("GET", `/api/collections/${name}/records?page=1&perPage=10&sort=${sort}`, { token });
    console.log(`${r.status === 200 ? "+" : "!"} verify ${name} sort=${sort}: HTTP ${r.status}`);
  }
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
