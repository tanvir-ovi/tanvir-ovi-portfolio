#!/usr/bin/env node
// Creates the admin password hash for /admin.
//
//   npm run admin:setup                  generates a strong password
//   npm run admin:setup -- "my password" uses the one you give
//
// It writes ADMIN_PASSWORD_HASH to .env.local (for `npm run dev`) and prints
// the line to paste into Vercel > Settings > Environment Variables.
// The password itself is never stored anywhere.
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const N = 32768;
const r = 8;
const p = 1;

function generate() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(20);
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]);
  return [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join("")).join("-");
}

const given = process.argv[2];
if (given && given.length < 12) {
  console.error("Use at least 12 characters.");
  process.exit(1);
}
const password = given || generate();
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 32, { N, r, p, maxmem: 256 * 1024 * 1024 });
const value = `scrypt:${N}:${r}:${p}:${salt.toString("base64")}:${hash.toString("base64")}`;

const envFile = ".env.local";
const lines = existsSync(envFile)
  ? readFileSync(envFile, "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("ADMIN_PASSWORD_HASH="))
  : [];
lines.push(`ADMIN_PASSWORD_HASH=${value}`);
writeFileSync(envFile, lines.join("\n") + "\n");

console.log("\nAdmin password:   " + password + (given ? "" : "   (generated, save it in your password manager)"));
console.log("\nSaved to .env.local for local use. For the live site, add this in");
console.log("Vercel > Project > Settings > Environment Variables (Production), then redeploy:\n");
console.log("ADMIN_PASSWORD_HASH=" + value + "\n");
