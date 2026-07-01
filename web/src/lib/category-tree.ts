import type { CategoryNode } from "@tarifhane/shared";

export function subtreeRecipeCount(node: CategoryNode): number {
  const childCount = node.children.reduce((sum, child) => sum + subtreeRecipeCount(child), 0);
  return node.recipes.length + childCount;
}

export function findCategoryPath(
  nodes: CategoryNode[],
  slug: string,
  path: CategoryNode[] = [],
): CategoryNode[] | null {
  for (const node of nodes) {
    const nextPath = [...path, node];
    if (node.slug === slug) return nextPath;
    const childPath = findCategoryPath(node.children, slug, nextPath);
    if (childPath) return childPath;
  }
  return null;
}

export function getNodeAtPath(tree: CategoryNode[], pathIds: number[]): CategoryNode | null {
  let nodes = tree;
  let current: CategoryNode | null = null;

  for (const id of pathIds) {
    current = nodes.find((node) => node.id === id) ?? null;
    if (!current) return null;
    nodes = current.children;
  }

  return current;
}
