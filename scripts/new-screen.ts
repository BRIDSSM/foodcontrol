#!/usr/bin/env tsx
/**
 * Generates a new screen file under `app/` from `templates/screen.tsx.template`.
 *
 * Usage:
 *   npm run new:screen -- <route>
 *
 * Examples:
 *   npm run new:screen -- profile
 *     -> app/profile.tsx
 *
 *   npm run new:screen -- recipes/[id]
 *     -> app/recipes/[id].tsx
 *
 *   npm run new:screen -- (tabs)/settings
 *     -> app/(tabs)/settings.tsx
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fail(message: string): never {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function printUsage(): void {
  console.error('Usage: npm run new:screen -- <route>');
  console.error('');
  console.error('Examples:');
  console.error('  npm run new:screen -- profile');
  console.error('  npm run new:screen -- recipes/[id]');
  console.error('  npm run new:screen -- (tabs)/settings');
}

function toPascalCase(input: string): string {
  return input
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
}

function toTitleCase(input: string): string {
  return input
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

const arg: string | undefined = process.argv[2];

if (!arg) {
  printUsage();
  process.exit(1);
}

const route: string = arg.replace(/^\/+|\/+$/g, '');
const target: string = path.join('app', `${route}.tsx`);
const absTarget: string = path.resolve(target);

if (fs.existsSync(absTarget)) {
  fail(`File already exists: ${target}`);
}

const segments: string[] = route.split('/');
const lastRaw: string = segments[segments.length - 1] ?? '';
const last: string = lastRaw.replace(/[\[\]()]/g, '');

if (!last) {
  fail(`Could not derive component name from route "${route}"`);
}

const componentName: string = `${toPascalCase(last)}Screen`;
const title: string = toTitleCase(last);

const tplPath: string = path.join(__dirname, '..', 'templates', 'screen.tsx.template');
const tpl: string = fs.readFileSync(tplPath, 'utf8');

const out: string = tpl
  .replace(/\{\{COMPONENT_NAME\}\}/g, componentName)
  .replace(/\{\{TITLE\}\}/g, title);

fs.mkdirSync(path.dirname(absTarget), { recursive: true });
fs.writeFileSync(absTarget, out);

console.log(`✔ Created ${target}`);
console.log(`  Component: ${componentName}`);
console.log(`  Route:     /${route.replace(/\(.+?\)\//g, '')}`);
console.log('');
console.log("Next: edit the file and remove the example blocks you don't need.");
