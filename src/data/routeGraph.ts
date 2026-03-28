/**
 * World travel graph for The Long Dark.
 *
 * Sources used to verify every edge:
 *   - thelongdark.fandom.com/wiki/Region (official wiki, "directly connected" data)
 *   - Multiple community guides cross-referencing all transition zones
 *   - Wikipedia summary of region connections
 *
 * Key corrections from previous version:
 *   - Ravine connects ML ↔ CH ↔ Bleak Inlet (not ML ↔ CH via Crumbling Highway)
 *   - Crumbling Highway connects CH ↔ Desolation Point only (not a 3-way hub)
 *   - Bleak Inlet connects to Forlorn Muskeg AND Ravine (not just FM)
 *   - Mountain Town connects directly to Mystery Lake (cave shortcut)
 *   - Hushed River Valley connects ONLY to Mountain Town
 *   - Ash Canyon connects ONLY to Timberwolf Mountain
 *   - Blackrock connects ONLY via Keeper's Pass → Mountain Town
 *   - Far Territory (DLC): all four regions connect through Transfer Pass hub
 *   - Forsaken Airfield, Zone of Contamination, Sundered Pass are a triangle
 */

export interface RouteNode {
  id: string;
  name: string;
  subtitle?: string;
}

export interface RouteEdge {
  from: string;
  to: string;
  label: string;
  weight?: number;
  notes?: string;
}

export const ROUTE_NODES: RouteNode[] = [
  // ── Main regions ───────────────────────────────────────────
  { id: 'mystery-lake',        name: 'Mystery Lake' },
  { id: 'coastal-highway',     name: 'Coastal Highway' },
  { id: 'pleasant-valley',     name: 'Pleasant Valley' },
  { id: 'timberwolf-mountain', name: 'Timberwolf Mountain' },
  { id: 'broken-railroad',     name: 'Broken Railroad' },
  { id: 'desolation-point',    name: 'Desolation Point' },
  { id: 'forlorn-muskeg',      name: 'Forlorn Muskeg' },
  { id: 'mountain-town',       name: 'Mountain Town' },
  { id: 'hushed-river-valley', name: 'Hushed River Valley' },
  { id: 'bleak-inlet',         name: 'Bleak Inlet' },
  { id: 'ash-canyon',          name: 'Ash Canyon' },
  { id: 'blackrock',           name: 'Blackrock' },

  // ── DLC: Tales from the Far Territory ─────────────────────
  { id: 'transfer-pass',          name: 'Transfer Pass',          subtitle: 'Far Territory hub' },
  { id: 'forsaken-airfield',      name: 'Forsaken Airfield',      subtitle: 'DLC' },
  { id: 'zone-of-contamination',  name: 'Zone of Contamination',  subtitle: 'DLC' },
  { id: 'sundered-pass',          name: 'Sundered Pass',          subtitle: 'DLC' },

  // ── Transition zones ───────────────────────────────────────
  { id: 'ravine',                 name: 'The Ravine',             subtitle: 'Transition — ML / CH / Bleak Inlet' },
  { id: 'winding-river',          name: 'Winding River',          subtitle: 'Transition — ML ↔ PV via Carter Dam' },
  { id: 'crumbling-highway',      name: 'Crumbling Highway',      subtitle: 'Transition — CH ↔ Desolation Point' },
  { id: 'cinder-hills-coal-mine', name: 'Cinder Hills Coal Mine', subtitle: 'Transition — CH ↔ PV' },
  { id: 'keepers-pass',           name: "Keeper's Pass",          subtitle: 'Transition — Mountain Town ↔ Blackrock' },
  { id: 'far-range-branch-line',  name: 'Far Range Branch Line',  subtitle: 'Transition — Broken Railroad ↔ Far Territory' },
];

function e(
  from: string,
  to: string,
  label: string,
  weight = 1,
  notes?: string
): RouteEdge {
  return { from, to, label, weight, notes };
}

/**
 * Undirected edges — routeFinder builds adjacency in both directions.
 * Weight guide: 1 = easy/short, 1.5 = moderate, 2 = long/exposed/dangerous.
 */
export const ROUTE_EDGES: RouteEdge[] = [

  // ── Mystery Lake connections ───────────────────────────────
  e('mystery-lake', 'forlorn-muskeg',      'Rail tunnel (ML → FM)',            1),
  e('mystery-lake', 'mountain-town',       'Cave shortcut (ML ↔ Milton)',       1),
  e('mystery-lake', 'winding-river',       'Carter Hydro Dam corridor',         1),
  e('mystery-lake', 'ravine',              'Into The Ravine (ML side)',          1),

  // ── Coastal Highway connections ────────────────────────────
  e('coastal-highway', 'ravine',                 'Ravine (CH side)',                1),
  e('coastal-highway', 'crumbling-highway',      'Old Island Connector entrance',   1),
  e('coastal-highway', 'cinder-hills-coal-mine', 'Coal mine entrance (CH side)',    1.2),

  // ── The Ravine (transition: ML / CH / Bleak Inlet) ─────────
  e('ravine', 'bleak-inlet', 'Raven Falls trestle → Bleak Inlet', 1.2),

  // ── Winding River (transition: ML ↔ PV) ───────────────────
  e('winding-river', 'pleasant-valley', 'PV exit (Winding River)',           1.2),

  // ── Crumbling Highway (transition: CH ↔ Desolation Point) ──
  e('crumbling-highway', 'desolation-point', 'Abandoned Mine No.3 / coast path', 1.2),

  // ── Cinder Hills Coal Mine (transition: CH ↔ PV) ──────────
  e('cinder-hills-coal-mine', 'pleasant-valley', 'Mine exit (PV side)',             1.2),

  // ── Pleasant Valley connections ────────────────────────────
  e('pleasant-valley', 'timberwolf-mountain', 'Mountain pass (PV → TWM)',       1.5),

  // ── Timberwolf Mountain connections ───────────────────────
  e('timberwolf-mountain', 'ash-canyon', 'High alpine rope climb (TWM → AC)', 1.5),

  // ── Forlorn Muskeg connections ─────────────────────────────
  e('forlorn-muskeg', 'broken-railroad', 'Rail line east (FM → BR)',          1),
  e('forlorn-muskeg', 'mountain-town',   'Milton Basin approach',              1.2),
  e('forlorn-muskeg', 'bleak-inlet',     'Rail tunnel (FM ↔ Bleak Inlet)',     1.2),

  // ── Mountain Town connections ──────────────────────────────
  e('mountain-town', 'hushed-river-valley', 'Mountain cave (Milton → HRV)',    1.5),
  e('mountain-town', 'keepers-pass',        'Pass approach (Milton → KP)',      1.2),

  // ── Keeper's Pass (transition: Mountain Town ↔ Blackrock) ──
  e('keepers-pass', 'blackrock', 'Keeper\'s Pass → Blackrock',               1.5),

  // ── Broken Railroad connections ────────────────────────────
  e('broken-railroad', 'far-range-branch-line', 'Branch line to Far Territory', 1.2),

  // ── Far Range Branch Line (transition: BR ↔ Transfer Pass) ─
  e('far-range-branch-line', 'transfer-pass', 'Into Far Territory hub',         1.2),

  // ── Transfer Pass (DLC hub) ────────────────────────────────
  e('transfer-pass', 'forsaken-airfield',     'Road to Forsaken Airfield',      1),
  e('transfer-pass', 'zone-of-contamination', 'Road to Zone of Contamination',  1.2),
  e('transfer-pass', 'sundered-pass',         'Mountain road to Sundered Pass', 1.2),

  // ── Far Territory triangle ─────────────────────────────────
  e('forsaken-airfield',     'zone-of-contamination', 'Transition cave (FA ↔ ZoC)', 1.2),
  e('forsaken-airfield',     'sundered-pass',          'Transition cave (FA ↔ SP)',  1.2),
  e('zone-of-contamination', 'sundered-pass',          'Transition cave (ZoC ↔ SP)', 1.2),
];

// ── Validation ────────────────────────────────────────────────
export const ROUTE_NODE_IDS = new Set(ROUTE_NODES.map((n) => n.id));

for (const edge of ROUTE_EDGES) {
  if (!ROUTE_NODE_IDS.has(edge.from) || !ROUTE_NODE_IDS.has(edge.to)) {
    throw new Error(`routeGraph: unknown node in edge "${edge.from}" → "${edge.to}"`);
  }
}

export function isRouteNodeId(id: string): boolean {
  return ROUTE_NODE_IDS.has(id);
}

export function getRouteNode(id: string): RouteNode | undefined {
  return ROUTE_NODES.find((n) => n.id === id);
}
