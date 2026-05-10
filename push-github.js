#!/usr/bin/env node
// Pushes changed files directly to GitHub via the API (no git required)

const fs = require('fs');

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'twswithcrew009-lgtm';
const REPO  = 'trri';
const BRANCH = 'main';

const FILES = [
  'video-stream(4).html',
  'index.html',
  'server.js',
  'autosync.sh',
  'downloads.html',
  'push-github.js'
];

async function getFileSha(filepath) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(filepath)}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `token ${TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if (res.status === 404) return null;
  const data = await res.json();
  return data.sha || null;
}

async function pushFile(filepath) {
  if (!fs.existsSync(filepath)) { console.log(`⚠️  Skipped (not found): ${filepath}`); return; }
  const content = fs.readFileSync(filepath).toString('base64');
  const sha = await getFileSha(filepath);
  const body = { message: `sync: update ${filepath}`, content, branch: BRANCH };
  if (sha) body.sha = sha;

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(filepath)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (res.ok) { console.log(`✅ Pushed: ${filepath}`); }
  else { console.error(`❌ Failed: ${filepath} — ${data.message}`); }
}

async function main() {
  if (!TOKEN) { console.error('❌ GITHUB_TOKEN is not set. Add it to Replit Secrets.'); process.exit(1); }
  console.log(`🚀 Pushing ${FILES.length} files to github.com/${OWNER}/${REPO}...\n`);
  for (const file of FILES) { await pushFile(file); }
  console.log('\n✅ All done!');
}

main().catch(console.error);
