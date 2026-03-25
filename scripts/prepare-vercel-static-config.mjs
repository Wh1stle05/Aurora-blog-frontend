import fs from 'fs/promises';
import path from 'path';

export const VERCEL_STATIC_CONFIG = {
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index.html' },
  ],
};

export async function writeVercelStaticConfig(outputDir = path.resolve('dist')) {
  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'vercel.json');
  await fs.writeFile(outputPath, `${JSON.stringify(VERCEL_STATIC_CONFIG, null, 2)}\n`, 'utf8');
  return outputPath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeVercelStaticConfig()
    .then((outputPath) => {
      console.log(`Wrote ${outputPath}`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
