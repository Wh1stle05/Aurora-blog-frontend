import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

const SUPPORTED_PATHS = new Set(['/', '/blog', '/about']);

function normalizePaths(rawPaths = [], slug) {
  const normalized = [];

  for (const path of rawPaths) {
    if (SUPPORTED_PATHS.has(path) && !normalized.includes(path)) {
      normalized.push(path);
    }
  }

  if (typeof slug === 'string' && slug.trim()) {
    normalized.push(`/blog/${slug.trim()}`);
  }

  return normalized;
}

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const secret = process.env.REVALIDATE_SECRET || '';

  if (!secret || payload.secret !== secret) {
    return NextResponse.json(
      { revalidated: false, message: 'Invalid secret' },
      { status: 401 },
    );
  }

  const paths = normalizePaths(payload.paths, payload.slug);
  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({
    revalidated: true,
    paths,
  });
}
