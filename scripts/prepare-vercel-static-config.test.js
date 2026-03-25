import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it } from 'vitest';

import { writeVercelStaticConfig, VERCEL_STATIC_CONFIG } from './prepare-vercel-static-config.mjs';

const tempDirs = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'aurora-vercel-static-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('prepare-vercel-static-config', () => {
  it('writes a filesystem-first vercel config into dist', async () => {
    const dir = await makeTempDir();

    const outputPath = await writeVercelStaticConfig(dir);
    const written = JSON.parse(await fs.readFile(outputPath, 'utf8'));

    expect(outputPath).toBe(path.join(dir, 'vercel.json'));
    expect(written).toEqual(VERCEL_STATIC_CONFIG);
  });
});
