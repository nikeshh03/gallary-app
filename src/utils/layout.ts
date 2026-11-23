export function getGridItemSize(
  screenWidth: number,
  numColumns: number = 3,
  gap: number = 2,
): number {
  const totalGaps = (numColumns + 1) * gap;
  return Math.floor((screenWidth - totalGaps) / numColumns);
}

