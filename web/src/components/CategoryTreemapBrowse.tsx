"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CategoryNode } from "@tarifhane/shared";
import {
  findCategoryPath,
  getNodeAtPath,
  getTreemapNodes,
  treemapWeight,
} from "@/lib/category-tree";
import { layoutTreemap } from "@/lib/treemap";

const TREEMAP_COLORS = [
  "#d1541f",
  "#e07a3a",
  "#c9962c",
  "#b85c38",
  "#a83f16",
  "#d4a056",
  "#8f4f2a",
  "#e8956a",
  "#6b8f71",
  "#9c6b4f",
];

function pathIdsFromSlug(tree: CategoryNode[], slug: string | undefined): number[] {
  if (!slug) return [];
  const path = findCategoryPath(tree, slug);
  return path?.map((node) => node.id) ?? [];
}

export default function CategoryTreemapBrowse({
  tree,
  initialSlug,
}: {
  tree: CategoryNode[];
  initialSlug?: string;
}) {
  const [pathIds, setPathIds] = useState<number[]>(() => pathIdsFromSlug(tree, initialSlug));

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#cat-")) return;
    const slug = hash.slice("#cat-".length);
    const nextPath = pathIdsFromSlug(tree, slug);
    if (nextPath.length > 0) {
      setPathIds(nextPath);
      document.getElementById(`cat-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [tree]);

  const selectedNode = useMemo(
    () => (pathIds.length > 0 ? getNodeAtPath(tree, pathIds) : null),
    [tree, pathIds],
  );

  const treemapNodes = useMemo(() => getTreemapNodes(tree, pathIds), [tree, pathIds]);

  const treemapCells = useMemo(() => {
    const items = treemapNodes.map((node) => ({
      data: node,
      weight: treemapWeight(node),
    }));
    return layoutTreemap(items, 0, 0, 100, 100);
  }, [treemapNodes]);

  const breadcrumb = useMemo(() => {
    const crumbs: CategoryNode[] = [];
    let nodes = tree;
    for (const id of pathIds) {
      const node = nodes.find((entry) => entry.id === id);
      if (!node) break;
      crumbs.push(node);
      nodes = node.children;
    }
    return crumbs;
  }, [tree, pathIds]);

  function selectNode(node: CategoryNode) {
    setPathIds((current) => [...current, node.id]);
    window.history.replaceState(null, "", `#cat-${node.slug}`);
  }

  function navigateTo(index: number) {
    const nextPath = pathIds.slice(0, index);
    setPathIds(nextPath);
    const slug = index > 0 ? breadcrumb[index - 1]?.slug : undefined;
    window.history.replaceState(null, "", slug ? `#cat-${slug}` : window.location.pathname);
  }

  return (
    <div className="browse-layout">
      <aside className="treemap-panel" aria-label="Kategori haritası">
        <nav className="treemap-breadcrumb" aria-label="Kategori yolu">
          <button type="button" className="treemap-crumb" onClick={() => navigateTo(0)}>
            Tümü
          </button>
          {breadcrumb.map((node, index) => (
            <span key={node.id} className="treemap-crumb-group">
              <span className="treemap-crumb-sep">/</span>
              <button
                type="button"
                className="treemap-crumb"
                onClick={() => navigateTo(index + 1)}
              >
                {node.name}
              </button>
            </span>
          ))}
        </nav>

        <div className="treemap-canvas">
          {treemapCells.length === 0 ? (
            <p className="treemap-empty">Alt kategori yok.</p>
          ) : (
            treemapCells.map((cell, index) => {
              const node = cell.data;
              const color = TREEMAP_COLORS[index % TREEMAP_COLORS.length];
              const count = treemapWeight(node);
              const isSelected = selectedNode?.id === node.id;

              return (
                <button
                  key={node.id}
                  type="button"
                  className={`treemap-cell${isSelected ? " treemap-cell--selected" : ""}`}
                  style={{
                    left: `${cell.x}%`,
                    top: `${cell.y}%`,
                    width: `${cell.width}%`,
                    height: `${cell.height}%`,
                    backgroundColor: color,
                  }}
                  onClick={() => selectNode(node)}
                  title={node.name}
                >
                  <span className="treemap-cell__name">{node.name}</span>
                  <span className="treemap-cell__count">{count} tarif</span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section
        className="browse-content"
        id={selectedNode ? `cat-${selectedNode.slug}` : undefined}
      >
        {!selectedNode ? (
          <div className="browse-intro">
            <h2>Kategori seçin</h2>
            <p>Soldaki haritadan bir kategori seçerek tariflere ulaşın.</p>
          </div>
        ) : (
          <>
            <header className="browse-content__header">
              <h2 className="browse-content__title">{selectedNode.name}</h2>
              {selectedNode.children.length > 0 && (
                <p className="browse-content__meta">
                  {selectedNode.children.length} alt kategori · {treemapWeight(selectedNode)} tarif
                </p>
              )}
            </header>

            {selectedNode.children.length > 0 && (
              <div className="browse-subcats">
                {selectedNode.children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className="browse-subcat"
                    onClick={() => selectNode(child)}
                  >
                    {child.name}
                    <span>{treemapWeight(child)}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedNode.recipes.length > 0 ? (
              <ul className="browse-recipes">
                {selectedNode.recipes.map((recipe) => (
                  <li key={recipe.id} className="browse-recipe">
                    <Link href={`/tarif/${recipe.slug}`}>
                      <span className="browse-recipe__title">{recipe.title}</span>
                      {recipe.description && (
                        <span className="browse-recipe__desc">{recipe.description}</span>
                      )}
                    </Link>
                    <span className="like-badge">♥ {recipe.like_count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              selectedNode.children.length === 0 && (
                <p className="empty-state">Bu kategoride henüz tarif yok.</p>
              )
            )}
          </>
        )}
      </section>
    </div>
  );
}
