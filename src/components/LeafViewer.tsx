import React, { useState } from 'react';
import { DetectedRegion } from '../types/disease';
import { Eye, EyeOff, Layers, ZoomIn } from 'lucide-react';

interface LeafViewerProps {
  imageUrl: string;
  detectedRegions?: DetectedRegion[];
  severity: string;
}

export const LeafViewer: React.FC<LeafViewerProps> = ({ imageUrl, detectedRegions = [], severity }) => {
  const [showBoxes, setShowBoxes] = useState(true);
  const [activeBoxIndex, setActiveBoxIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const getSeverityColor = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical':
      case 'severe':
        return { border: 'border-rose-500', bg: 'bg-rose-500/20', text: 'text-rose-300', badge: 'bg-rose-600' };
      case 'moderate':
        return { border: 'border-amber-500', bg: 'bg-amber-500/20', text: 'text-amber-300', badge: 'bg-amber-600' };
      case 'mild':
        return { border: 'border-yellow-400', bg: 'bg-yellow-400/20', text: 'text-yellow-200', badge: 'bg-yellow-600' };
      case 'healthy':
      case 'none':
        return { border: 'border-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-300', badge: 'bg-emerald-600' };
      default:
        return { border: 'border-emerald-500', bg: 'bg-emerald-500/20', text: 'text-emerald-300', badge: 'bg-emerald-600' };
    }
  };

  const colors = getSeverityColor(severity);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl group">
      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {detectedRegions.length > 0 && (
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 backdrop-blur-md border border-zinc-700/60 transition shadow-lg"
            >
              {showBoxes ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{showBoxes ? 'Hide Lesion Highlights' : 'Show Lesion Highlights'}</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-300">
                {detectedRegions.length}
              </span>
            </button>
          )}
        </div>

        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="pointer-events-auto p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white backdrop-blur-md border border-zinc-700/60 transition shadow-lg"
          title={isZoomed ? 'Reset Zoom' : 'Inspect Details'}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Image & Bounding Box Container */}
      <div className={`relative w-full overflow-hidden transition-all duration-300 flex items-center justify-center bg-zinc-900/40 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
        <img
          src={imageUrl}
          alt="Analyzed Plant Leaf"
          className={`w-full max-h-[440px] sm:max-h-[500px] object-contain transition-transform duration-300 ${isZoomed ? 'scale-125' : 'scale-100'}`}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* AI Bounding Boxes Overlay */}
        {showBoxes && detectedRegions.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {detectedRegions.map((region, idx) => {
              const [ymin, xmin, ymax, xmax] = region.box_2d;
              // Coordinates normalized to 0-1000
              const top = `${(ymin / 1000) * 100}%`;
              const left = `${(xmin / 1000) * 100}%`;
              const width = `${((xmax - xmin) / 1000) * 100}%`;
              const height = `${((ymax - ymin) / 1000) * 100}%`;

              const isActive = activeBoxIndex === idx;

              return (
                <div
                  key={idx}
                  style={{ top, left, width, height }}
                  className={`absolute pointer-events-auto transition-all duration-200 border-2 rounded-lg cursor-pointer ${
                    isActive
                      ? 'border-white bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.4)] z-30'
                      : `${colors.border} ${colors.bg} hover:border-white z-10`
                  }`}
                  onMouseEnter={() => setActiveBoxIndex(idx)}
                  onMouseLeave={() => setActiveBoxIndex(null)}
                >
                  <span
                    className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap shadow-md transition-transform ${
                      isActive ? 'bg-white text-zinc-950 scale-105' : `${colors.badge} text-white`
                    }`}
                  >
                    #{idx + 1} {region.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Region Detail Bar if hovered */}
      {showBoxes && activeBoxIndex !== null && detectedRegions[activeBoxIndex] && (
        <div className="px-4 py-2.5 bg-zinc-900 border-t border-zinc-800 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">
              Lesion #{activeBoxIndex + 1}: {detectedRegions[activeBoxIndex].label}
            </span>
            {detectedRegions[activeBoxIndex].description && (
              <span className="text-zinc-400 hidden sm:inline">
                — {detectedRegions[activeBoxIndex].description}
              </span>
            )}
          </div>
          <span className="text-[10px] text-zinc-400">Area Bounding: #{activeBoxIndex + 1}</span>
        </div>
      )}

      {/* Detected regions list badges */}
      {detectedRegions.length > 0 && activeBoxIndex === null && (
        <div className="px-4 py-2 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-xs text-zinc-400">
          <Layers className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="text-[11px] shrink-0 font-medium text-zinc-300">Detected Spots:</span>
          {detectedRegions.map((region, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBoxIndex(activeBoxIndex === idx ? null : idx)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition shrink-0 ${
                activeBoxIndex === idx
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              #{idx + 1} {region.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
