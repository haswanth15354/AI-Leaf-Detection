import React, { useState } from 'react';
import { DISEASE_ATLAS } from '../data/diseaseAtlas';
import { DiseaseAtlasEntry } from '../types/disease';
import { BookOpen, X, Search, Filter, ShieldCheck, AlertCircle, Droplets, ThermometerSun } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DiseaseAtlasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSampleForScan?: (cropName: string) => void;
}

export const DiseaseAtlasModal: React.FC<DiseaseAtlasModalProps> = ({
  isOpen,
  onClose,
  onSelectSampleForScan,
}) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>('late-blight');

  if (!isOpen) return null;

  const pathogenTypes = ['All', 'Fungal', 'Oomycete', 'Bacterial', 'Nutritional'];

  const filteredEntries = DISEASE_ATLAS.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(search.toLowerCase()) ||
      entry.scientificName.toLowerCase().includes(search.toLowerCase()) ||
      entry.vulnerableCrops.some((c) => c.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === 'All' || entry.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl flex flex-col h-[750px] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t('Botanical Pathology Atlas')}</h3>
              <p className="text-xs text-zinc-400">{t('Comprehensive reference encyclopedia of crop diseases & pathogens')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/60 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search diseases, pathogens, crops (e.g. Tomato, Mildew, Phytophthora)...')}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs sm:text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {pathogenTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                  selectedType === type
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {t(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <AlertCircle className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
              <p className="font-semibold text-zinc-300">{t('No diseases match your search criteria')}</p>
              <p className="text-xs text-zinc-500">{t('Try searching for broader keywords like "Blight", "Tomato", or "Grape".')}</p>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <div
                  key={entry.id}
                  className="rounded-2xl bg-zinc-950/70 border border-zinc-800/80 overflow-hidden transition-all duration-200"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/60 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{entry.name}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-800 text-amber-300 border border-zinc-700">
                          {t(entry.type)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 italic font-mono">{entry.scientificName}</p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-zinc-500">{t('Hosts')}</span>
                        {entry.vulnerableCrops.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[10px] border border-zinc-800"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition">
                      {isExpanded ? t('Collapse') : t('Details')}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-900/40 space-y-4 text-xs animate-fadeIn">
                      {/* Weather / Conditions */}
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-amber-200">
                        <ThermometerSun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-amber-300 font-semibold mb-0.5">
                            {t('Favorable Environmental Conditions:')}
                          </strong>
                          <span>{entry.favorableConditions}</span>
                        </div>
                      </div>

                      {/* Symptoms */}
                      <div>
                        <strong className="text-zinc-300 uppercase tracking-wider text-[11px] block mb-2">
                          {t('Visual Clinical Symptoms:')}
                        </strong>
                        <ul className="space-y-1.5 text-zinc-300">
                          {entry.symptoms.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Dual Treatment Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {/* Organic */}
                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5" />
                            {t('Organic & Biological Controls')}
                          </span>
                          <ul className="space-y-1.5 text-zinc-300 text-[11px]">
                            {entry.organicTreatments.map((t, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-emerald-500 font-bold">•</span>
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Chemical */}
                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                          <span className="font-bold text-blue-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {t('Target Chemical Protectants')}
                          </span>
                          <ul className="space-y-1.5 text-zinc-300 text-[11px]">
                            {entry.chemicalTreatments.map((t, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-blue-500 font-bold">•</span>
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Long-term prevention */}
                      <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                        <strong className="text-zinc-300 block mb-1">{t('Preventive Agronomy Tips:')}</strong>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-zinc-400 text-[11px]">
                          {entry.preventionTips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold">✓</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
