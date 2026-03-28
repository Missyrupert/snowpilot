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

const DIRECTIONS: Record<string, string> = {
  'mystery-lake→forlorn-muskeg':
    'Follow the rail tracks south-west from the Camp Office area. The tunnel entrance is near the frozen lake shore — look for the break in the treeline where tracks descend.',
  'forlorn-muskeg→mystery-lake':
    'Head north-east along the rail tracks. The tunnel mouth is visible across the bog — stay on the tracks to avoid weak ice.',
  'mystery-lake→mountain-town':
    'Find the cave entrance on the south face of the ridge above Mystery Lake. The path climbs steeply — follow the rope line up the rock face into Milton.',
  'mountain-town→mystery-lake':
    'Head north from Milton Park. The rope climb is at the top of the park hill. Descend into Mystery Lake on the other side.',
  'mystery-lake→winding-river':
    'Head east toward Carter Hydro Dam. Enter the dam building and follow the interior walkway through. Exit the far side into Winding River.',
  'winding-river→mystery-lake':
    'Follow the river corridor west. Enter Carter Dam from the east side and pass through the building. Exit west into Mystery Lake.',
  'winding-river→pleasant-valley':
    'Follow the river canyon south. The path winds through a gorge — stay low and follow the frozen stream bed. Exit climbs into Pleasant Valley farmland.',
  'pleasant-valley→winding-river':
    'Head north-east from the farmstead toward the canyon entrance. Drop down into Winding River via the cave and frozen streambed.',
  'mystery-lake→ravine':
    'Head east past the Camp Office toward the rail trestle. The Ravine entrance is below the broken rail bridge — rope down or take the path down the embankment.',
  'ravine→mystery-lake':
    'Climb back up the embankment or rope on the Mystery Lake side. Head west along the rail tracks.',
  'coastal-highway→ravine':
    'Head east along the highway past the log sort. The Ravine transition entrance is at the far east end — follow the tracks into the valley.',
  'ravine→coastal-highway':
    'Head west along the valley floor and rail tracks. Climb out at the Coastal Highway end near the log sort area.',
  'ravine→bleak-inlet':
    'Cross the Raven Falls rail trestle — a narrow bridge high above the gorge. Take it slow, especially in wind. Bleak Inlet opens out on the far side.',
  'bleak-inlet→ravine':
    'Head inland from the cannery toward the trestle bridge. Cross it carefully and descend into The Ravine.',
  'coastal-highway→crumbling-highway':
    'Head south along the coast past the fishing cabins. The Old Island Connector road branches off the main highway — follow it south.',
  'crumbling-highway→coastal-highway':
    'Head north along the connector road back to the main Coastal Highway.',
  'crumbling-highway→desolation-point':
    'Follow the road south through the collapsed section. Abandoned Mine No.3 provides a sheltered indoor passage through the rock face into Desolation Point.',
  'desolation-point→crumbling-highway':
    'Find Abandoned Mine No.3 on the north side of Desolation Point. Pass through the mine to emerge into Crumbling Highway.',
  'coastal-highway→cinder-hills-coal-mine':
    'Head inland from the Quonset Garage area. The coal mine entrance is up the hill — a tunnel cuts through the ridge into Pleasant Valley.',
  'cinder-hills-coal-mine→pleasant-valley':
    'Follow the mine tunnel east. Exit into Pleasant Valley on the far side of the ridge, near the Signal Hill area.',
  'pleasant-valley→cinder-hills-coal-mine':
    'Head west toward the ridge from Pleasant Valley. The mine entrance is on the east face of the ridge.',
  'cinder-hills-coal-mine→coastal-highway':
    'Follow the mine west and exit onto the Coastal Highway hillside.',
  'pleasant-valley→timberwolf-mountain':
    "Head south from Pleasant Valley toward the mountain base. The pass is marked by a rope climb — ascend to reach Timberwolf Mountain's lower slopes.",
  'timberwolf-mountain→pleasant-valley':
    'Descend from the mountain via the rope routes on the north face. The pass drops back into Pleasant Valley.',
  'timberwolf-mountain→ash-canyon':
    "From the upper plateau near the summit, look for the rope anchors heading east down a cliff face. The descent leads into Ash Canyon's upper reaches.",
  'ash-canyon→timberwolf-mountain':
    "Climb the rope on the western cliff of Ash Canyon. The ascent is steep — bring stamina food. Emerges onto Timberwolf Mountain's upper plateau.",
  'forlorn-muskeg→broken-railroad':
    'Follow the rail tracks east through the bog. Stay on tracks or snow islands to avoid weak ice. Broken Railroad is at the end of the line.',
  'broken-railroad→forlorn-muskeg':
    'Follow the tracks west from the Maintenance Yard. The bog opens up as you enter Forlorn Muskeg — stay on the rails.',
  'forlorn-muskeg→mountain-town':
    'Head south through the muskeg toward the Milton Basin cave. The cave system connects through to the outskirts of Mountain Town.',
  'mountain-town→forlorn-muskeg':
    'Head north from Milton outskirts toward the basin. Find the cave entrance and pass through into Forlorn Muskeg.',
  'forlorn-muskeg→bleak-inlet':
    'Find the rail tunnel on the northern edge of Forlorn Muskeg. The tunnel runs under the ridge directly into Bleak Inlet.',
  'bleak-inlet→forlorn-muskeg':
    'Head south from the cannery area to the rail tunnel entrance. Pass through into Forlorn Muskeg.',
  'mountain-town→hushed-river-valley':
    'Head south-west from Milton toward the cave entrance in the cliffs. The cave passage leads into the remote Hushed River Valley — there are no buildings there.',
  'hushed-river-valley→mountain-town':
    'Head north-east through the valley toward the cave exit. The passage climbs back up into Mountain Town.',
  'mountain-town→keepers-pass':
    "Head north from Milton toward the rocky pass. Follow the road as it climbs into Keeper's Pass — watch the rope bridge in high winds.",
  'keepers-pass→mountain-town':
    'Cross back over the rope bridge heading south. The road descends into Mountain Town.',
  'keepers-pass→blackrock':
    'Head north through the pass. The ice cave section connects through to the Blackrock region. Follow the carved path.',
  'blackrock→keepers-pass':
    'Head south from Blackrock toward the pass entrance. Navigate through the ice cave section back into Keeper\'s Pass.',
  'broken-railroad→far-range-branch-line':
    "Head west from the Maintenance Yard along the branch rail line. It's a long exposed walk — the Far Range Branch Line eventually opens up ahead.",
  'far-range-branch-line→broken-railroad':
    'Follow the tracks east back toward Broken Railroad and the Maintenance Yard.',
  'far-range-branch-line→transfer-pass':
    'Follow the branch line through the mountain tunnels. The tunnels are the key — exits are inside them, not at surface level. Transfer Pass hub is at the end.',
  'transfer-pass→far-range-branch-line':
    'Head east from Transfer Pass along the rail line back into the tunnels toward Broken Railroad.',
  'transfer-pass→forsaken-airfield':
    'Take the road north from Transfer Pass. The airfield is on open ground ahead — visible from the road.',
  'forsaken-airfield→transfer-pass':
    'Head south from the airfield along the road back to Transfer Pass hub.',
  'transfer-pass→zone-of-contamination':
    'Take the road east from Transfer Pass toward the open-pit mine basin.',
  'zone-of-contamination→transfer-pass':
    'Head west from the mine back along the road to Transfer Pass.',
  'transfer-pass→sundered-pass':
    'Take the mountain road south-east from Transfer Pass. The road climbs into Sundered Pass.',
  'sundered-pass→transfer-pass':
    'Descend the mountain road north-west back to Transfer Pass hub.',
  'forsaken-airfield→zone-of-contamination':
    'Find the transition cave on the south side of the airfield. It connects directly through to the Zone of Contamination.',
  'zone-of-contamination→forsaken-airfield':
    'Find the cave entrance on the north edge of the mine basin. It connects back to the Forsaken Airfield.',
  'forsaken-airfield→sundered-pass':
    'Find the transition cave on the east side of Forsaken Airfield. It opens into Sundered Pass.',
  'sundered-pass→forsaken-airfield':
    'Head west through the transition cave to reach Forsaken Airfield.',
  'zone-of-contamination→sundered-pass':
    'Find the transition cave connecting the mine basin to Sundered Pass on its south edge.',
  'sundered-pass→zone-of-contamination':
    'Head north through the transition cave from Sundered Pass into the Zone of Contamination.',
};

export function getDirections(fromId: string, toId: string): string | null {
  return DIRECTIONS[`${fromId}→${toId}`] ?? null;
}
