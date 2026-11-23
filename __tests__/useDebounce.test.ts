import * as React from 'react';
import { useDebounce } from '../src/hooks/useDebounce';

describe('useDebounce Hook', () => {
  let originalH: any;
  const internals = (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

  beforeEach(() => {
    jest.useFakeTimers();
    originalH = internals?.H;
  });

  afterEach(() => {
    if (internals) {
      internals.H = originalH;
    }
    jest.useRealTimers();
  });

  it('returns initial value and schedules update on delay', () => {
    let state = 'initial';
    const setState = jest.fn((newVal) => {
      state = newVal;
    });

    let effectCleanup: any = null;
    internals.H = {
      useState: () => [state, setState],
      useEffect: (effect: () => any) => {
        effectCleanup = effect();
      },
    };

    const result = useDebounce('hello', 300);
    expect(result).toBe('initial');
    expect(setState).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(setState).toHaveBeenCalledWith('hello');

    if (typeof effectCleanup === 'function') {
      effectCleanup();
    }
  });

  it('cancels pending timeout when value updates before delay', () => {
    let state = 'initial';
    const setState = jest.fn((newVal) => {
      state = newVal;
    });

    let cleanupFn: any = null;
    internals.H = {
      useState: () => [state, setState],
      useEffect: (effect: () => any) => {
        if (typeof cleanupFn === 'function') {
          cleanupFn();
        }
        cleanupFn = effect();
      },
    };

    useDebounce('first', 300);
    jest.advanceTimersByTime(150);

    // Call again before timer expires (simulating re-render with new value)
    useDebounce('second', 300);

    jest.advanceTimersByTime(150);
    // 300ms total, but only 150ms since 'second', so 'first' was canceled
    expect(setState).not.toHaveBeenCalledWith('first');

    jest.advanceTimersByTime(150);
    // 300ms since 'second'
    expect(setState).toHaveBeenCalledWith('second');

    if (typeof cleanupFn === 'function') {
      cleanupFn();
    }
  });
});
