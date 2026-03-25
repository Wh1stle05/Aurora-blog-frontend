import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it } from 'vitest';

import { verifyPrerenderOutput } from './verify-prerender-output.mjs';

const tempDirs = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'aurora-prerender-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('verify-prerender-output', () => {
  it('fails when the root index is missing', async () => {
    const dir = await makeTempDir();

    await expect(verifyPrerenderOutput(dir)).rejects.toThrow(/dist\/index\.html/i);
  });

  it('fails when no prerendered article pages exist', async () => {
    const dir = await makeTempDir();
    await fs.writeFile(path.join(dir, 'index.html'), '<html></html>', 'utf8');

    await expect(verifyPrerenderOutput(dir)).rejects.toThrow(/blog\/.*index\.html/i);
  });

  it('passes when the root index and an article page exist', async () => {
    const dir = await makeTempDir();
    await fs.mkdir(path.join(dir, 'blog', 'example-post'), { recursive: true });
    await fs.writeFile(path.join(dir, 'index.html'), '<html></html>', 'utf8');
    await fs.writeFile(path.join(dir, 'blog', 'example-post', 'index.html'), '<html></html>', 'utf8');

    await expect(verifyPrerenderOutput(dir)).resolves.toEqual({
      rootIndex: path.join(dir, 'index.html'),
      articlePages: [path.join(dir, 'blog', 'example-post', 'index.html')],
    });
  });
});
