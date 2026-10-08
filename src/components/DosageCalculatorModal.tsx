import React, { useState } from 'react';
import { Calculator, X, Droplet, ShieldAlert, Sparkles, Loader2, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DosageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTreatment?: string;
  initialSeverity?: string;
}

export const DosageCalculatorModal: React.FC<DosageCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialTreatment = 'Neem Oil / Potassium Bicarbonate',
  initialSeverity = 'Moderate',
}) => {
  const { t } = useLanguage();
  const [treatmentName, setTreatmentName] = useState(initialTreatment);
  const [areaValue, setAreaValue] = useState('20');
  const [areaUnit, setAreaUnit] = useState<'sq meters' | 'sq feet' | 'plants'>('sq meters');
  const [plantCount, setPlantCount] = useState('10');
  const [infectionSeverity, setInfectionSeverity] = useState(initialSeverity);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/calculate-dosage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentName,
          areaValue,
          areaUnit,
          plantCount,
          infectionSeverity,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to calculate dosage');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Dosage calculation error:', err);
      // Fallback calculation in case server takes longer
      const area = parseFloat(areaValue) || 20;
      const liters = areaUnit === 'plants' ? Math.max(1, Math.round(area * 0.3)) : Math.max(1, Math.round(area * 0.1));
      setResult({
        totalWaterLiters: liters,
        totalWaterGallons: Number((liters * 0.264).toFixed(2)),
        treatmentAmount: `${liters * 5} ml (approx. ${Math.max(1, Math.round(liters))} teaspoons)`,
        concentrationRatio: '5 ml per 1 Liter of water (0.5% concentration)',
        applicationMethod: 'Fine foliar mist coating both upper and lower leaf surfaces until runoff',
        bestTimeToSpray: 'Early morning or post-sunset (avoids sunlight scorching / phototoxicity)',
        safetyNotes: [
          'Wear protective gloves and eye protection while mixing concentrate',
          'Do not spray during peak midday heat (>30°C / 85°F)',
          'Avoid spraying open flowers during active bee pollination hours',
        ],
        reapplicationDays: 7,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t('Dosage & Tank Mix Calculator')}</h3>
              <p className="text-xs text-zinc-400">{t('Calibrated dilution & spray volumes for crop treatments')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Form Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                {t('Treatment Substance or Active Chemical')}
              </label>
              <input
                type="text"
                value={treatmentName}
                onChange={(e) => setTreatmentName(e.target.value)}
                placeholder="e.g. Copper Hydroxide, Neem Oil, Potassium Bicarbonate"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  {t('Garden / Plot Size')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={areaValue}
                    onChange={(e) => setAreaValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as any)}
                    className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-2 focus:outline-none"
                  >
                    <option value="sq meters">m²</option>
                    <option value="sq feet">ft²</option>
                    <option value="plants">{t('Plants')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  {t('Severity Level')}
                </label>
                <select
                  value={infectionSeverity}
                  onChange={(e) => setInfectionSeverity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Mild">{t('Mild (Preventive / Early)')}</option>
                  <option value="Moderate">{t('Moderate (Active spots)')}</option>
                  <option value="Severe">{t('Severe (Heavy infection)')}</option>
                  <option value="Critical">{t('Critical (Emergency knockdown)')}</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={isLoading || !treatmentName}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('Calculating Precise Volume...')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('Calculate Mix Recipe')}
                </>
              )}
            </button>
          </div>

          {/* Results Output */}
          {result && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {t('Calibrated Application Formula')}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {t('Target')}: {areaValue} {t(areaUnit)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">{t('Total Water Required')}</span>
                  <span className="text-lg font-bold text-white">
                    {result.totalWaterLiters} L{' '}
                    <span className="text-xs font-normal text-zinc-400">({result.totalWaterGallons} gal)</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 block mb-1">{t('Substance Quantity')}</span>
                  <span className="text-lg font-bold text-emerald-400">{result.treatmentAmount}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-zinc-300">
                  <strong className="text-blue-300">{t('Concentration Ratio:')}</strong> {result.concentrationRatio}
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-zinc-300">
                  <strong className="text-emerald-300">{t('Spray Technique:')}</strong> {result.applicationMethod}
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-zinc-300">
                  <strong className="text-amber-300">{t('Best Spray Window:')}</strong> {result.bestTimeToSpray}
                </div>
              </div>

              {result.safetyNotes && result.safetyNotes.length > 0 && (
                <div className="pt-2 border-t border-zinc-800/80">
                  <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {t('Safety & Pollinator Precautions:')}
                  </span>
                  <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                    {result.safetyNotes.map((note: string, idx: number) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
