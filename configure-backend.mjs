import fs from 'node:fs/promises';

const localEnv = await fs.readFile('.env.local', 'utf8').catch(() => '');
const fromFile = Object.fromEntries(localEnv.split(/\r?\n/).map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean).map(([, key, value]) => [key, value.replace(/^['"]|['"]$/g, '')]));
const url = process.env.VITE_SUPABASE_URL || fromFile.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || fromFile.VITE_SUPABASE_ANON_KEY;
const turnstileSiteKey = process.env.VITE_TURNSTILE_SITE_KEY || fromFile.VITE_TURNSTILE_SITE_KEY || '';
if (!url || !anonKey || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local or the environment before generating backend-config.js.');
}
const config = { url, anonKey, turnstileSiteKey };
await fs.writeFile('backend-config.js', `window.SECOND_SHELF_CONFIG = ${JSON.stringify(config)};\n`);
console.log('Generated backend-config.js. The anon key is public and RLS must remain enabled.');
