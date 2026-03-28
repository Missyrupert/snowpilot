import type { RouteEdge } from '../data/routeGraph';
import { ROUTE_EDGES, getRouteNode } from '../data/routeGraph';

export interface RouteOption {
  nodes: string[];
  edges: RouteEdge[];
  totalWeight: number;
}

export type SortMode = 'fewest' | 'easiest';

type AdjEntry = { to: string; edge: RouteEdge };

function buildAdjacency(): Map<string, AdjEntry[]> {
  const m = new Map<string, AdjEntry[]>();
  const add = (from: string, to: string, edge: RouteEdge) => {
    if (!m.has(from)) m.set(from, []);
    m.get(from)!.push({ to, edge });
  };
  for (const edge of ROUTE_EDGES) {
    add(edge.from, edge.to, edge);
    add(edge.to, edge.from, edge);
  }
  return m;
}

const adjacency = buildAdjacency();

export function findAlternateRoutes(
  fromId: string,
  toId: string,
  sortMode: SortMode = 'fewest',
  opts?: {
    maxRoutes?: number;
    maxDepth?: number;
    maxRawPaths?: number;
  }
): RouteOption[] {
  const maxRoutes = opts?.maxRoutes ?? 8;
  const maxDepth = opts?.maxDepth ?? 22;
  const maxRawPaths = opts?.maxRawPaths ?? 200;

  if (fromId === toId) return [];

  const raw: RouteOption[] = [];
  const visited = new Set<string>();

  function dfs(node: string, pathNodes: string[], pathEdges: RouteEdge[], depth: number) {
    if (raw.length >= maxRawPaths || depth > maxDepth) return;
    if (node === toId) {
      const w = pathEdges.reduce((s, e) => s + (e.weight ?? 1), 0);
      raw.push({ nodes: [...pathNodes, node], edges: [...pathEdges], totalWeight: w });
      return;
    }
    visited.add(node);
    const next = adjacency.get(node) ?? [];
    for (const { to, edge } of next) {
      if (visited.has(to)) continue;
      pathNodes.push(node);
      pathEdges.push(edge);
      dfs(to, pathNodes, pathEdges, depth + 1);
      pathEdges.pop();
      pathNodes.pop();
    }
    visited.delete(node);
  }

  dfs(fromId, [], [], 0);

  if (raw.length === 0) return [];

  const seen = new Set<string>();
  const unique: RouteOption[] = [];

  const sorted = raw.sort((a, b) => {
    if (sortMode === 'fewest') {
      // Primary: fewest crossings. Secondary: lowest weight.
      return a.edges.length - b.edges.length || a.totalWeight - b.totalWeight;
    } else {
      // Primary: lowest weight (easiest/safest). Secondary: fewest crossings.
      return a.totalWeight - b.totalWeight || a.edges.length - b.edges.length;
    }
  });

  for (const r of sorted) {
    const key = r.nodes.join('>');
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(r);
    if (unique.length >= maxRoutes) break;
  }

  return unique;
}

export function formatRouteNodeLine(id: string): string {
  const n = getRouteNode(id);
  if (!n) return id;
  return n.subtitle ? `${n.name} (${n.subtitle})` : n.name;
}
