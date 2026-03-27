import { useState } from 'react';
import { REGIONS, UNIVERSAL_RULES, type Region } from './data/regionData';
import { MapViewer } from './components/MapViewer';
import { RoutePlotter } from './components/RoutePlotter';
import './App.css';

const grouped = {
  main: REGIONS.filter((r) => r.group === 'main'),
  dlc: REGIONS.filter((r) => r.group === 'dlc'),
  transition: REGIONS.filter((r) => r.group === 'transition'),
};

export function App() {
  const [selected, setSelected] = useState<Region | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelected(id ? REGIONS.find((r) => r.id === id) ?? null : null);
    setMapOpen(false);
  };

  return (
    <main className="app">
      <header className="header">
        <h1>SnowPilot</h1>
        <p className="tagline">Quick reference for The Long Dark</p>
      </header>

      {/* ── Region Selector ──────────────────────────────────── */}
      <section className="region-select-section">
        <label htmlFor="region-select" className="sr-only">
          Select region
        </label>
        <select
          id="region-select"
          className="region-select"
          value={selected?.id ?? ''}
          onChange={handleSelect}
        >
          <option value="">Where are you?</option>
          <optgroup label="Regions">
            {grouped.main.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </optgroup>
          <optgroup label="DLC">
            {grouped.dlc.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </optgroup>
          <optgroup label="Transition Zones">
            {grouped.transition.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </optgroup>
        </select>
      </section>

      {/* ── Region Detail ────────────────────────────────────── */}
      {selected && (
        <section className="region-detail">
          <div className="critical-rule">
            <span className="critical-icon" aria-hidden="true">!</span>
            <p>{selected.criticalRule}</p>
          </div>

          <ul className="landmarks">
            {selected.landmarks.map((lm, i) => (
              <li key={i}>{lm}</li>
            ))}
          </ul>

          <button
            type="button"
            className="map-btn"
            onClick={() => setMapOpen(true)}
          >
            View Map
          </button>
        </section>
      )}

      {/* ── Map Viewer Overlay ───────────────────────────────── */}
      {selected && (
        <MapViewer
          isOpen={mapOpen}
          regionName={selected.name}
          mapPageTitle={selected.mapPageTitle}
          mapUrl={selected.mapUrl}
          onClose={() => setMapOpen(false)}
        />
      )}

      <RoutePlotter
        homeRegionId={selected?.id ?? null}
        onFromAlignRegion={(regionId) => {
          const r = REGIONS.find((reg) => reg.id === regionId);
          if (r) setSelected(r);
        }}
      />

      {/* ── Universal Survival Card ──────────────────────────── */}
      <section className="survival-card">
        <h2>Survival Rules</h2>
        <ul>
          {UNIVERSAL_RULES.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
