import { useEffect, useMemo, useState } from 'react';
import { ROUTE_NODES, isRouteNodeId } from '../data/routeGraph';
import {
  findAlternateRoutes,
  formatRouteNodeLine,
  type RouteOption,
} from '../lib/routeFinder';
import './RoutePlotter.css';

const sortedNodes = [...ROUTE_NODES].sort((a, b) => a.name.localeCompare(b.name));

export interface RoutePlotterProps {
  /** Synced from the main “Where are you?” picker when that region is on the travel graph */
  homeRegionId?: string | null;
  /** When the user picks a **From** that matches a full survival region, align the main picker + detail card */
  onFromAlignRegion?: (regionId: string | null) => void;
}

export function RoutePlotter({ homeRegionId, onFromAlignRegion }: RoutePlotterProps) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (!homeRegionId || !isRouteNodeId(homeRegionId)) return;
    setFromId(homeRegionId);
  }, [homeRegionId]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [fromId, toId]);

  const displayRoutes = useMemo(() => {
    if (!fromId || !toId || fromId === toId) return [];
    return findAlternateRoutes(fromId, toId);
  }, [fromId, toId]);

  const safeIdx =
    displayRoutes.length > 0 ? Math.min(selectedIdx, displayRoutes.length - 1) : 0;
  const activeIdx = displayRoutes.length > 0 ? safeIdx : 0;
  const selectedRoute: RouteOption | undefined = displayRoutes[activeIdx];

  return (
    <section className="route-plotter" aria-labelledby="route-plotter-heading">
      <h2 id="route-plotter-heading" className="route-plotter-title">
        Route plotter
      </h2>
      <p className="route-plotter-hint">
        <strong>From</strong> follows <strong>Where are you?</strong> when that region is in the travel graph; you
        can change it here (e.g. a transition). Pick <strong>To</strong> for the destination. Multiple paths show
        as route tabs ranked by rough travel cost.
      </p>

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
            <option value="">Start here…</option>
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
            <option value="">Destination…</option>
            {sortedNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {fromId && toId && fromId !== toId && displayRoutes.length === 0 && (
        <p className="route-empty" role="status">
          No path in the current graph between these places. Try nearby regions or check the wiki
          map — we can add missing links in <code>routeGraph.ts</code>.
        </p>
      )}

      {displayRoutes.length > 0 && (
        <div className="route-results">
          <p className="route-results-summary" role="status">
            {displayRoutes.length === 1
              ? 'One route through the graph.'
              : `${displayRoutes.length} routes — pick the one that fits your gear and weather.`}
          </p>

          <ul className="route-tabs" role="tablist" aria-label="Route options">
            {displayRoutes.map((_, i) => (
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
                  {displayRoutes.length === 1 ? 'Route' : `Route ${i + 1}`}
                  {i === 0 && displayRoutes.length > 1 ? ' · suggested' : ''}
                </button>
              </li>
            ))}
          </ul>

          {selectedRoute && (
            <div
              className="route-panel"
              role="tabpanel"
              id={`route-panel-${activeIdx}`}
              aria-labelledby={`route-tab-${activeIdx}`}
            >
              <ol className="route-steps">
                {selectedRoute.nodes.map((id: string, step: number) => (
                  <li key={`${id}-${step}`} className="route-step">
                    <span className="route-step-name">{formatRouteNodeLine(id)}</span>
                    {step < selectedRoute.edges.length && (
                      <span className="route-step-crossing">
                        → {selectedRoute.edges[step].label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <p className="route-meta">
                ~{selectedRoute.edges.length} crossing{selectedRoute.edges.length === 1 ? '' : 's'} · score{' '}
                {selectedRoute.totalWeight.toFixed(1)} (lower = fewer / milder segments in this model)
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
