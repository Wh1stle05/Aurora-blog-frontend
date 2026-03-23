import { describe, expect, it } from 'vitest';

import { transformImageUri } from './imageTransform.js';

describe('transformImageUri', () => {
  const post = {
    images: [
      {
        filename: '测试.jpg',
        object_key: 'posts/9405bba3-aa2e-4fb2-ab1b-7a3408e1302a.jpg',
      },
    ],
  };

  it('resolves an encoded relative markdown filename to the uploaded CDN asset', () => {
    const result = transformImageUri(
      './%E6%B5%8B%E8%AF%95.jpg',
      post,
      (value) => `https://cdn.aurorablog.me/${value}`,
    );

    expect(result).toBe('https://cdn.aurorablog.me/posts/9405bba3-aa2e-4fb2-ab1b-7a3408e1302a.jpg');
  });

  it('resolves placeholder-based markdown images to the uploaded CDN asset', () => {
    const result = transformImageUri(
      '{{IMAGE_测试.jpg}}',
      post,
      (value) => `https://cdn.aurorablog.me/${value}`,
    );

    expect(result).toBe('https://cdn.aurorablog.me/posts/9405bba3-aa2e-4fb2-ab1b-7a3408e1302a.jpg');
  });
});
