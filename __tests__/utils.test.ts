import { formatBytes, formatDate } from '../src/utils/format';
import { getGridItemSize } from '../src/utils/layout';

describe('Utility Functions', () => {
  it('formatBytes formats file sizes accurately', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024 * 3.5)).toBe('3.5 MB');
    expect(formatBytes(1024 * 1024 * 1024 * 2)).toBe('2 GB');
  });

  it('getGridItemSize calculates cell width with gaps', () => {
    // Screen width 375, 3 columns, 2px gap (total gaps: (3+1)*2 = 8px) => (375 - 8) / 3 = 122
    const size = getGridItemSize(375, 3, 2);
    expect(size).toBe(122);

    // Screen width 400, 4 columns, 2px gap (total gaps: (4+1)*2 = 10px) => (400 - 10) / 4 = 97.5 => 97
    const size4 = getGridItemSize(400, 4, 2);
    expect(size4).toBe(97);
  });

  it('formatDate produces readable date strings', () => {
    const timestamp = new Date('2026-11-22T10:00:00Z').getTime();
    const formatted = formatDate(timestamp);
    expect(formatted).toContain('2026');
  });
});
