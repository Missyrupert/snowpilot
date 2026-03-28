import { useEffect, useMemo, useState } from 'react';
import { ROUTE_NODES, isRouteNodeId } from '../data/routeGraph';
import {
  findAlternateRoutes,
  formatRouteNodeLine,
  getDirections,
  type RouteOption,
  type SortMode,
} from '../lib/routeFinder';
import './RoutePlotter.css';

const sortedNodes = [...ROUTE_NODES].sort((a, b) => a.name.localeCompare(b.name));

export interface RoutePlotterProps {
  homeRegionId?: string | null;
  onFromAlignRegion?: (regionId: string | null) => void;
}

export function RoutePlotter({ homeRegionId, onFromAlignRegion }: RoutePlotterProps) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sortMode, setSortMode] = useState<SortMode>('fewest');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    if (!homeRegionId || !isRouteNodeId(homeRegionId)) return;
    setFromId(homeRegionId);
  }, [homeRegionId]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [fromId, toId, sortMode]);

  const displayRoutes = useMemo(() => {
    if (!fromId || !toId || fromId === toId) return [];
    return findAlternateRoutes(fromId, toId, sortMode);
  }, [fromId, toId, sortMode]);

  const activeIdx = displayRoutes.length > 0 ? Math.min(selectedIdx, displayRoutes.length - 1) : 0;
  const selectedRoute: RouteOption | undefined = displayRoutes[activeIdx];

  useEffect(() => {
    setExpandedStep(null);
  }, [fromId, toId, sortMode, activeIdx]);

  const toggleStep = (i: number) => {
    if (!selectedRoute || i >= selectedRoute.edges.length) return;
    setExpandedStep((prev) => (prev === i ? null : i));
  };

  const routeSummary = () => {
    if (displayRoutes.length === 0) return null;
    const count = displayRoutes.length;
    const label = sortMode === 'fewest' ? 'fewest crossings first' : 'safest/easiest first';
    if (count === 1) return `1 path found — ${label}.`;
    return `${count} paths found — showing ${label}.`;
  };

  return (
    <section className="route-plotter" aria-labelledby="route-plotter-heading">
      <h2 id="route-plotter-heading" className="route-plotter-title">
        Get from A to B
      </h2>

      <div className="route-plotter-fields">
        <div className="route-field">
          <label htmlFor="route-from">From</label>
          <select
            id="route-from"
            className="route-select"
            value={fromId}
            onChange={(e) => {
              const id = e.target.value;
              setFromId(id);
              if (id) onFromAlignRegion?.(id);
            }}
          >
            <option value="">Where are you?</option>
            {sortedNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
        <div className="route-field">
          <label htmlFor="route-to">To</label>
          <select
            id="route-to"
            className="route-select"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
          >
            <option value="">Where do you want to go?</option>
            {sortedNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {fromId && toId && fromId !== toId && (
        <div className="route-sort-toggle" role="group" aria-label="Sort routes by">
          <span className="route-sort-label">Sort by</span>
          <button
            type="button"
            className={`sort-btn ${sortMode === 'fewest' ? 'sort-btn-active' : ''}`}
            onClick={() => setSortMode('fewest')}
          >
            Quickest (fewest stops)
          </button>
          <button
            type="button"
            className={`sort-btn ${sortMode === 'easiest' ? 'sort-btn-active' : ''}`}
            onClick={() => setSortMode('easiest')}
          >
            Easiest (safest path)
          </button>
        </div>
      )}

      {fromId && toId && fromId !== toId && displayRoutes.length === 0 && (
        <p className="route-empty" role="status">
          No path found between these two places. They may not be directly connected in the world map — try a nearby region as a stepping stone.
        </p>
      )}

      {displayRoutes.length > 0 && (
        <div className="route-results">
          <p className="route-results-summary" role="status">
            {routeSummary()}
          </p>

          {displayRoutes.length > 1 && (
            <ul className="route-tabs" role="tablist" aria-label="Route options">
              {displayRoutes.map((route, i) => (
                <li key={i} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    id={`route-tab-${i}`}
                    aria-selected={activeIdx === i}
                    aria-controls={`route-panel-${i}`}
                    className={`route-tab ${activeIdx === i ? 'route-tab-active' : ''}`}
                    onClick={() => setSelectedIdx(i)}
                  >
                    {i === 0 ? '★ ' : ''}{route.edges.length} {route.edges.length === 1 ? 'stop' : 'stops'}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedRoute && (
            <div
              className="route-panel"
              role="tabpanel"
              id={`route-panel-${activeIdx}`}
              aria-labelledby={`route-tab-${activeIdx}`}
            >
              <ol className="route-steps">
                {selectedRoute.nodes.map((id: string, step: number) => {
                  const hasLeg = step < selectedRoute.edges.length;
                  const nextId = hasLeg ? selectedRoute.nodes[step + 1] : null;
                  const written = nextId ? getDirections(id, nextId) : null;
                  const directionsText =
                    written ??
                    (nextId
                      ? `Head toward ${formatRouteNodeLine(nextId)} and watch for environmental cues marking the transition.`
                      : null);
                  const expanded = expandedStep === step;
                  return (
                    <li
                      key={`${id}-${step}`}
                      className={`route-step${hasLeg ? ' route-step--interactive' : ''}`}
                      onClick={() => toggleStep(step)}
                      onKeyDown={(e) => {
                        if (!hasLeg) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleStep(step);
                        }
                      }}
                      role={hasLeg ? 'button' : undefined}
                      tabIndex={hasLeg ? 0 : undefined}
                      aria-expanded={hasLeg ? expanded : undefined}
                      aria-label={
                        hasLeg
                          ? expanded
                            ? `Step ${step + 1}: ${formatRouteNodeLine(id)}, directions expanded`
                            : `Step ${step + 1}: ${formatRouteNodeLine(id)}, tap for directions`
                          : undefined
                      }
                    >
                      <span className="route-step-name">{formatRouteNodeLine(id)}</span>
                      {expanded && directionsText && (
                        <p className="route-step-directions">{directionsText}</p>
                      )}
                      {hasLeg && (
                        <span className="route-step-crossing">
                          → {selectedRoute.edges[step].label}
                        </span>
                      )}
                      {hasLeg && !expanded && (
                        <span className="route-step-tap-hint">Tap for directions ↓</span>
                      )}
                    </li>
                  );
                })}
              </ol>
              <p className="route-meta">
                {selectedRoute.edges.length} {selectedRoute.edges.length === 1 ? 'crossing' : 'crossings'} · {selectedRoute.nodes.length} {selectedRoute.nodes.length === 1 ? 'region' : 'regions'}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
