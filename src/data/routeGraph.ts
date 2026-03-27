/**
 * World travel graph for route options between regions and key transitions.
 * Based on wiki "Directly connected regions", outdoor/indoor transition zones,
 * and common travel corridors — verify in-game for your difficulty/mode.
 * @see https://thelongdark.fandom.com/wiki/Regions
 */

export interface RouteNode {
  id: string;
  name: string;
  /** Shown under the name in the plotter */
  subtitle?: string;
}

export interface RouteEdge {
  from: string;
  to: string;
  /** Short label for the crossing (shown in step list) */
  label: string;
  /** Higher = longer or riskier segment for sorting alternates */
  weight?: number;
  notes?: string;
}

export const ROUTE_NODES: RouteNode[] = [
  { id: 'mystery-lake', name: 'Mystery Lake' },
  { id: 'coastal-highway', name: 'Coastal Highway' },
  { id: 'pleasant-valley', name: 'Pleasant Valley' },
  { id: 'timberwolf-mountain', name: 'Timberwolf Mountain' },
  { id: 'broken-railroad', name: 'Broken Railroad' },
  { id: 'desolation-point', name: 'Desolation Point' },
  { id: 'forlorn-muskeg', name: 'Forlorn Muskeg' },
  { id: 'mountain-town', name: 'Mountain Town' },
  { id: 'hushed-river-valley', name: 'Hushed River Valley' },
  { id: 'bleak-inlet', name: 'Bleak Inlet' },
  { id: 'ash-canyon', name: 'Ash Canyon' },
  { id: 'blackrock', name: 'Blackrock' },
  { id: 'transfer-pass', name: 'Transfer Pass' },
  { id: 'forsaken-airfield', name: 'Forsaken Airfield' },
  { id: 'zone-of-contamination', name: 'Zone of Contamination' },
  { id: 'sundered-pass', name: 'Sundered Pass' },
  {
    id: 'cinder-hills-coal-mine',
    name: 'Cinder Hills Coal Mine',
    subtitle: 'Indoor transition (CH ↔ PV)',
  },
  {
    id: 'winding-river',
    name: 'Winding River / Carter Dam corridor',
    subtitle: 'Transition (ML ↔ PV)',
  },
  {
    id: 'crumbling-highway',
    name: 'Crumbling Highway',
    subtitle: 'Old Island Connector',
  },
  { id: 'the-ravine', name: 'The Ravine', subtitle: 'Raven Falls' },
  {
    id: 'far-range-branch-line',
    name: 'Far Range Branch Line',
    subtitle: 'To Far Territory (from Broken Railroad)',
  },
  { id: 'keepers-pass', name: "Keeper's Pass", subtitle: 'Transition' },
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

/** Undirected logical edges; adjacency is built both ways in routeFinder */
export const ROUTE_EDGES: RouteEdge[] = [
  e('mystery-lake', 'winding-river', 'To Winding River / dam area', 1.2),
  e('winding-river', 'pleasant-valley', 'Into Pleasant Valley', 1.2),
  e('mystery-lake', 'forlorn-muskeg', 'Rail tunnel link', 1),
  e('forlorn-muskeg', 'broken-railroad', 'Rail line east', 1),
  e('mountain-town', 'forlorn-muskeg', 'Rail / marsh approach', 1.1),
  e('pleasant-valley', 'timberwolf-mountain', 'Mountain pass', 1.3),
  e('timberwolf-mountain', 'ash-canyon', 'High alpine link', 1.3),
  e('coastal-highway', 'crumbling-highway', 'Highway collapse / connector', 1),
  e('crumbling-highway', 'the-ravine', 'Through to ravine', 1),
  e('the-ravine', 'mystery-lake', 'Down to Mystery Lake side', 1),
  e('coastal-highway', 'cinder-hills-coal-mine', 'Mine entrance (CH side)', 1.1),
  e('cinder-hills-coal-mine', 'pleasant-valley', 'Mine exit (PV side)', 1.1),
  e('broken-railroad', 'far-range-branch-line', 'Branch line west', 1.2),
  e('far-range-branch-line', 'transfer-pass', 'Into Far Territory', 1.2),
  e('transfer-pass', 'forsaken-airfield', 'Road to airfield', 1),
  e('transfer-pass', 'zone-of-contamination', 'Road to mine basin', 1.1),
  e('transfer-pass', 'sundered-pass', 'Mountain road', 1.1),
  e('forsaken-airfield', 'zone-of-contamination', 'Transition cave', 1.2),
  e('desolation-point', 'crumbling-highway', 'Abandoned Mine No. 3 / connector', 1.2),
  e('bleak-inlet', 'forlorn-muskeg', 'Rail tunnel', 1.2),
  e('hushed-river-valley', 'mountain-town', 'Mountain cave link', 1.3),
  e('blackrock', 'keepers-pass', 'Pass approach', 1.2),
  e('keepers-pass', 'mountain-town', 'Down toward Milton', 1.2),
];

export const ROUTE_NODE_IDS = new Set(ROUTE_NODES.map((n) => n.id));

for (const edge of ROUTE_EDGES) {
  if (!ROUTE_NODE_IDS.has(edge.from) || !ROUTE_NODE_IDS.has(edge.to)) {
    throw new Error(`routeGraph: unknown node in edge ${edge.from} → ${edge.to}`);
  }
}

export function isRouteNodeId(id: string): boolean {
  return ROUTE_NODE_IDS.has(id);
}

export function getRouteNode(id: string): RouteNode | undefined {
  return ROUTE_NODES.find((n) => n.id === id);
}
