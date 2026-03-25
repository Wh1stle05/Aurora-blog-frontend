import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

import { usePrerenderReady } from './usePrerenderReady.js';

function HookHarness({ ready }) {
  usePrerenderReady(ready);
  return null;
}

describe('usePrerenderReady', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits briefly after ready before dispatching render-event', () => {
    vi.useFakeTimers();
    const dispatchSpy = vi.spyOn(document, 'dispatchEvent');

    render(<HookHarness ready />);

    vi.advanceTimersByTime(250);
    expect(dispatchSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'render-event' }));
  });
});
