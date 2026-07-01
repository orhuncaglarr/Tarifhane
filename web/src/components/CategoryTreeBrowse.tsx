"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CategoryNode } from "@tarifhane/shared";
import {
  findCategoryPath,
  getNodeAtPath,
  subtreeRecipeCount,
} from "@/lib/category-tree";

function pathIdsFromSlug(tree: CategoryNode[], slug: string | undefined): number[] {
  if (!slug) return [];
  const path = findCategoryPath(tree, slug);
  return path?.map((node) => node.id) ?? [];
}

function getAncestors(tree: CategoryNode[], focusPath: number[]): CategoryNode[] {
  const ancestors: CategoryNode[] = [];
  let level = tree;
  for (let i = 0; i < focusPath.length - 1; i++) {
    const node = level.find((entry) => entry.id === focusPath[i]);
    if (!node) break;
    ancestors.push(node);
    level = node.children;
  }
  return ancestors;
}

function TreeBranchList({
  nodes,
  onFocus,
}: {
  nodes: CategoryNode[];
  onFocus: (node: CategoryNode) => void;
}) {
  if (nodes.length === 0) return null;

  return (
    <ul className="tree-viz__list">
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        const count = subtreeRecipeCount(node);

        return (
          <li
            key={node.id}
            className={`tree-viz__item${isLast ? " tree-viz__item--last" : ""}`}
          >
            <button
              type="button"
              className="tree-viz__node"
              onClick={() => onFocus(node)}
              title={`${node.name} (${count} tarif)`}
            >
              <span className="tree-viz__node-dot" aria-hidden="true" />
              <span className="tree-viz__node-label">{node.name}</span>
              {count > 0 && <span className="tree-viz__node-count">{count}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function CategoryTreeBrowse({
  tree,
  initialSlug,
}: {
  tree: CategoryNode[];
  initialSlug?: string;
}) {
  const [focusPath, setFocusPath] = useState<number[]>(() => pathIdsFromSlug(tree, initialSlug));

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#cat-")) return;
    const slug = hash.slice("#cat-".length);
    const nextPath = pathIdsFromSlug(tree, slug);
    if (nextPath.length > 0) {
      setFocusPath(nextPath);
      document.getElementById(`cat-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [tree]);

  const focusNode = useMemo(
    () => (focusPath.length > 0 ? getNodeAtPath(tree, focusPath) : null),
    [tree, focusPath],
  );

  const ancestors = useMemo(() => getAncestors(tree, focusPath), [tree, focusPath]);
  const branchNodes = focusNode ? focusNode.children : tree;

  function focusTo(path: number[]) {
    setFocusPath(path);
    const node = path.length > 0 ? getNodeAtPath(tree, path) : null;
    window.history.replaceState(
      null,
      "",
      node ? `#cat-${node.slug}` : window.location.pathname,
    );
  }

  function focusOn(node: CategoryNode) {
    focusTo([...focusPath, node.id]);
  }

  return (
    <div className="browse-layout">
      <aside className="tree-viz-panel" aria-label="Kategori ağacı">
        <div className="tree-viz">
          {focusPath.length > 0 && (
            <div className="tree-viz__ancestors">
              <button type="button" className="tree-viz__ancestor-root" onClick={() => focusTo([])}>
                Tümü
              </button>
              {ancestors.length > 0 && (
                <ul className="tree-viz__ancestor-list">
                  {ancestors.map((node, index) => (
                    <li
                      key={node.id}
                      className={`tree-viz__ancestor-item${
                        index === ancestors.length - 1 ? " tree-viz__ancestor-item--last" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="tree-viz__ancestor"
                        onClick={() => focusTo(focusPath.slice(0, index + 1))}
                        title={node.name}
                      >
                        <span className="tree-viz__ancestor-label">{node.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {focusNode ? (
            <div className="tree-viz__focus-block">
              <div className="tree-viz__focus-node" aria-current="true">
                <span className="tree-viz__focus-dot" aria-hidden="true" />
                <span className="tree-viz__focus-label">{focusNode.name}</span>
              </div>
              <TreeBranchList nodes={branchNodes} onFocus={focusOn} />
            </div>
          ) : (
            <div className="tree-viz__root-block">
              <TreeBranchList nodes={branchNodes} onFocus={focusOn} />
            </div>
          )}
        </div>
      </aside>

      {focusNode && (
        <section className="browse-content" id={`cat-${focusNode.slug}`}>
          {focusNode.recipes.length > 0 ? (
            <ul className="browse-recipes">
              {focusNode.recipes.map((recipe) => (
                <li key={recipe.id} className="browse-recipe">
                  <Link href={`/tarif/${recipe.slug}`}>
                    <span className="browse-recipe__title">{recipe.title}</span>
                    {recipe.description && (
                      <span className="browse-recipe__desc">{recipe.description}</span>
                    )}
                    <span className="browse-recipe__author">{recipe.author_name}</span>
                  </Link>
                  <span className="like-badge">♥ {recipe.like_count}</span>
                </li>
              ))}
            </ul>
          ) : (
            focusNode.children.length === 0 && (
              <p className="empty-state">Bu kategoride henüz tarif yok.</p>
            )
          )}
        </section>
      )}
    </div>
  );
}
