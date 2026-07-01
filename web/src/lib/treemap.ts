export type TreemapItem<T> = {
  data: T;
  weight: number;
};

export type TreemapLayout<T> = TreemapItem<T> & {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function layoutTreemap<T>(
  items: TreemapItem<T>[],
  x: number,
  y: number,
  width: number,
  height: number,
): TreemapLayout<T>[] {
  if (items.length === 0) return [];

  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return [];

  const horizontal = width >= height;
  let offset = 0;
  const layouts: TreemapLayout<T>[] = [];

  for (const item of items) {
    const share = item.weight / total;
    if (horizontal) {
      const cellWidth = width * share;
      layouts.push({ ...item, x: x + offset, y, width: cellWidth, height });
      offset += cellWidth;
    } else {
      const cellHeight = height * share;
      layouts.push({ ...item, x, y: y + offset, width, height: cellHeight });
      offset += cellHeight;
    }
  }

  return layouts;
}
