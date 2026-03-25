import fs from 'fs/promises';
import path from 'path';

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectArticlePages(blogDir) {
  const entries = await fs.readdir(blogDir, { withFileTypes: true });
  const articlePages = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(blogDir, entry.name, 'index.html');
    if (await pathExists(candidate)) {
      articlePages.push(candidate);
    }
  }

  return articlePages.sort();
}

export async function verifyPrerenderOutput(outputDir = path.resolve('dist')) {
  const rootIndex = path.join(outputDir, 'index.html');
  if (!(await pathExists(rootIndex))) {
    throw new Error(`Missing required prerender output: dist/index.html (${rootIndex})`);
  }

  const blogDir = path.join(outputDir, 'blog');
  const articlePages = (await pathExists(blogDir)) ? await collectArticlePages(blogDir) : [];

  if (articlePages.length === 0) {
    throw new Error(`Missing prerendered article pages: expected dist/blog/*/index.html under ${blogDir}`);
  }

  return { rootIndex, articlePages };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  verifyPrerenderOutput()
    .then(({ rootIndex, articlePages }) => {
      console.log(`Verified prerender output: ${rootIndex}`);
      console.log(`Found ${articlePages.length} prerendered article page(s).`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
