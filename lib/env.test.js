import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

test('public env constants use static Next public env lookups', () => {
  const source = readFileSync(join(process.cwd(), 'lib/env.js'), 'utf8');

  expect(source).toContain('process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY');
  expect(source).toContain('process.env.NEXT_PUBLIC_API_BASE');
  expect(source).toContain('process.env.NEXT_PUBLIC_ASSET_CDN_BASE');
  expect(source).toContain('process.env.NEXT_PUBLIC_SITE_URL');
  expect(source).not.toContain('process.env[key]');
});
