import React, { useState } from 'react';
import { Columns, X, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ScanHistoryRecord } from '../types/disease';
import { useLanguage } from '../context/LanguageContext';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl: string;
  currentPlantName: string;
  history: ScanHistoryRecord[];
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  currentImageUrl,
  currentPlantName,
  history,
}) => {
  const { language, t } = useLanguage();
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>(
    history.length > 0 ? history[0].id : ''
  );

  if (!isOpen) return null;

  const compareItem = history.find((h) => h.id === selectedHistoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t('Crop Progression & Comparison')}</h3>
              <p className="text-xs text-zinc-400">{t('Compare current leaf with past scans or baseline reference')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Selector */}
        {history.length > 0 && (
          <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-950/60 flex items-center gap-3">
            <span className="text-xs text-zinc-400 shrink-0">{t('Compare with past scan:')}</span>
            <select
              value={selectedHistoryId}
              onChange={(e) => setSelectedHistoryId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none"
            >
              {history.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.diagnosis.plant.commonName} - {h.diagnosis.primaryDiagnosis.name} (
                  {new Date(h.timestamp).toLocaleDateString(language === 'te' ? 'te-IN' : undefined)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Side by Side Display */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Side 1: Current Scan */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                {t('Active Analysis')}
              </span>
              <span className="text-zinc-400">{t('Today')}</span>
            </div>
            <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-zinc-800">
              <img src={currentImageUrl} alt={t('Current Scan')} className="w-full h-full object-contain" />
            </div>
            <p className="text-sm font-bold text-white">{currentPlantName}</p>
          </div>

          {/* Side 2: Selected Past Scan */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                {t('Comparative Log')}
              </span>
              {compareItem && (
                <span className="text-zinc-400">
                  {new Date(compareItem.timestamp).toLocaleDateString(language === 'te' ? 'te-IN' : undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>

            {compareItem ? (
              <>
                <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-zinc-800">
                  <img
                    src={compareItem.imageUrl}
                    alt={compareItem.diagnosis.plant.commonName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{compareItem.diagnosis.plant.commonName}</p>
                  <p className="text-xs text-zinc-400">
                    {compareItem.diagnosis.primaryDiagnosis.name} ({compareItem.status})
                  </p>
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-center p-6 text-zinc-500 text-xs">
                {t('No past scans recorded yet. Once you save multiple scans, you can monitor lesion recovery side-by-side here.')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
