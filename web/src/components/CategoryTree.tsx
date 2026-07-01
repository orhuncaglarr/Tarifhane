import Link from "next/link";
import type { CategoryNode } from "@tarifhane/shared";

export default function CategoryTree({
  nodes,
  depth = 0,
}: {
  nodes: CategoryNode[];
  depth?: number;
}) {
  if (nodes.length === 0) return null;

  return (
    <ul className="tree">
      {nodes.map((node) => (
        <CategoryTreeNode key={node.id} node={node} depth={depth} />
      ))}
    </ul>
  );
}

function CategoryTreeNode({ node, depth }: { node: CategoryNode; depth: number }) {
  const hasChildren = node.children.length > 0;
  const hasRecipes = node.recipes.length > 0;

  if (!hasChildren && !hasRecipes) {
    return (
      <li id={`cat-${node.slug}`} className="tree-node">
        <span className="tree-label tree-label--empty">{node.name}</span>
      </li>
    );
  }

  return (
    <li className="tree-node">
      <details id={`cat-${node.slug}`} className="tree-branch" open={depth === 0}>
        <summary className="tree-summary">
          <span className="tree-label">{node.name}</span>
        </summary>
        <div className="tree-children">
          {hasChildren && <CategoryTree nodes={node.children} depth={depth + 1} />}
          {hasRecipes && (
            <ul className="tree tree-recipes">
              {node.recipes.map((recipe) => (
                <li key={recipe.id} className="tree-node tree-recipe">
                  <Link href={`/tarif/${recipe.slug}`}>{recipe.title}</Link>
                  <span className="like-badge">♥ {recipe.like_count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </li>
  );
}
