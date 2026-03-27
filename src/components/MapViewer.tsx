import { useState, useEffect } from 'react';
import { getMapImageUrl } from '../lib/fandomMaps';
import './MapViewer.css';

interface MapViewerProps {
  isOpen: boolean;
  regionName: string;
  mapPageTitle: string;
  mapUrl: string;
  onClose: () => void;
}

export function MapViewer({ isOpen, regionName, mapPageTitle, mapUrl, onClose }: MapViewerProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !mapPageTitle) {
      setStatus('idle');
      setImageUrl(null);
      return;
    }
    setStatus('loading');
    getMapImageUrl(mapPageTitle)
      .then((url) => { setImageUrl(url); setStatus('ok'); })
      .catch(() => setStatus('error'));
  }, [isOpen, mapPageTitle]);

  if (!isOpen) return null;

  return (
    <div className="mv-overlay" role="dialog" aria-modal="true" aria-label={`${regionName} map`}>
      <button type="button" className="mv-close" onClick={onClose}>
        Close
      </button>

      <div className="mv-body">
        {status === 'loading' && (
          <div className="mv-loading">
            <div className="mv-spinner" aria-hidden="true" />
            <p>Loading map...</p>
          </div>
        )}

        {status === 'ok' && imageUrl && (
          <div className="mv-scroll">
            <img src={imageUrl} alt={`${regionName} map`} className="mv-image" />
          </div>
        )}

        {status === 'error' && (
          <div className="mv-error">
            <p>Could not load map image.</p>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mv-fallback-btn">
              Open on wiki instead
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
