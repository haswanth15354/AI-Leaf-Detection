import React, { useState } from 'react';
import { DiagnosisResult } from '../types/disease';
import { LeafViewer } from './LeafViewer';
import { useLanguage } from '../context/LanguageContext';
import {
  AlertTriangle,
  CheckCircle2,
  Bug,
  Droplet,
  ShieldAlert,
  Activity,
  Calculator,
  MessageSquare,
  Bookmark,
  Share2,
  Printer,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface DiagnosisViewProps {
  imageUrl: string;
  diagnosis: DiagnosisResult;
  onOpenChat: () => void;
  onOpenDosage: (treatmentName: string) => void;
  onSaveToHistory: (status: 'Needs Action' | 'Treated' | 'Monitoring' | 'Resolved') => void;
  isSaved?: boolean;
}

export const DiagnosisView: React.FC<DiagnosisViewProps> = ({
  imageUrl,
  diagnosis,
  onOpenChat,
  onOpenDosage,
  onSaveToHistory,
  isSaved = false,
}) => {
  const { t } = useLanguage();
  const [activeTreatmentTab, setActiveTreatmentTab] = useState<'organic' | 'chemical' | 'cultural'>('organic');
  const [saveStatus, setSaveStatus] = useState<'Needs Action' | 'Treated' | 'Monitoring' | 'Resolved'>('Needs Action');
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    isPlant,
    plant,
    healthStatus,
    primaryDiagnosis,
    symptoms,
    detectedRegions = [],
    treatmentPlan,
    prevention,
    recoveryPrognosis,
    botanistNotes,
  } = diagnosis;

  const isHealthy = healthStatus === 'Healthy' || primaryDiagnosis.severity === 'None';

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'severe':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'mild':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  const getContagionBadgeClass = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'extremely high':
      case 'high':
        return 'bg-rose-950/60 text-rose-300 border-rose-800';
      case 'moderate':
        return 'bg-amber-950/60 text-amber-300 border-amber-800';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `FloraScan Diagnosis: ${plant.commonName} - ${primaryDiagnosis.name} (${primaryDiagnosis.severity} severity, ${primaryDiagnosis.confidence}% confidence).`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isPlant) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{t('Non-Plant Subject Detected')}</h3>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          {t('Our botanical vision system could not detect distinct plant leaves, stems, flowers, or fruit in this photo. Please upload a clear, focused close-up of foliage or crop leaves under good lighting.')}
        </p>
        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-left text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300 block mb-1">{t('Tips for best diagnostic accuracy:')}</span>
          <ul className="list-disc list-inside space-y-1">
            <li>{t('Ensure the leaf is in focus and fills at least 50% of the camera frame')}</li>
            <li>{t('Capture both the upper and lower leaf surface if powdery mildew is suspected')}</li>
            <li>{t('Avoid heavy shadows or extreme overexposure')}</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12 print:text-black">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isHealthy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {isHealthy ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{t('Diagnostic Verdict')}</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getSeverityBadgeClass(
                  primaryDiagnosis.severity
                )}`}
              >
                {t(primaryDiagnosis.severity)} {t('Severity')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {primaryDiagnosis.name}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition text-xs flex items-center gap-1.5"
            title={t('Copy Diagnosis Summary')}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{copiedLink ? t('Copied!') : t('Share')}</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition text-xs flex items-center gap-1.5"
            title={t('Print Clinical Plant Report')}
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{t('Export PDF')}</span>
          </button>
          <button
            onClick={onOpenChat}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('Consult Dr. Flora')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Leaf inspection + Metrics), Right Column (Diagnosis, Treatments, Triage) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Interactive Leaf Viewer with AI bounding boxes */}
          <LeafViewer
            imageUrl={imageUrl}
            detectedRegions={detectedRegions}
            severity={primaryDiagnosis.severity}
          />

          {/* Pathology Metrics: Confidence, Damage Area, Contagion Risk */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              {t('Pathology Quant Analysis')}
            </h4>

            {/* AI Confidence Meter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium">{t('Diagnostic Confidence')}</span>
                <span className="font-bold text-emerald-400">{primaryDiagnosis.confidence}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(10, primaryDiagnosis.confidence))}%` }}
                />
              </div>
            </div>

            {/* Foliage Affected Area */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium">{t('Foliage Surface Damage')}</span>
                <span className="font-bold text-amber-400">{primaryDiagnosis.affectedPercentage}% Est.</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(2, primaryDiagnosis.affectedPercentage))}%` }}
                />
              </div>
            </div>

            {/* Contagion Risk */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-xs text-zinc-300 font-medium">{t('Contagion to Neighbor Crops')}</span>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getContagionBadgeClass(
                  primaryDiagnosis.contagionRisk
                )}`}
              >
                {primaryDiagnosis.contagionRisk}
              </span>
            </div>
          </div>

          {/* Quick Log to History Widget */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <Bookmark className={`w-4 h-4 ${isSaved ? 'text-emerald-400 fill-emerald-400' : 'text-zinc-400'}`} />
              <div className="text-xs">
                <span className="font-medium text-white block">
                  {isSaved ? t('Saved in Crop Journal') : t('Log to Field History')}
                </span>
                <span className="text-zinc-400 text-[11px]">{t('Keep track of treatment recovery timeline')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={saveStatus}
                onChange={(e) => setSaveStatus(e.target.value as any)}
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Needs Action">{t('Needs Action')}</option>
                <option value="Treated">{t('Treated')}</option>
                <option value="Monitoring">{t('Monitoring')}</option>
                <option value="Resolved">{t('Resolved')}</option>
              </select>
              <button
                onClick={() => onSaveToHistory(saveStatus)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium text-xs transition"
              >
                {isSaved ? t('Update') : t('Save')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Triage, Symptoms, Treatments, Prognosis */}
        <div className="lg:col-span-7 space-y-5">
          {/* Emergency Triage Alert */}
          {!isHealthy && treatmentPlan.emergencyAction && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-red-950/20 to-zinc-900 border border-rose-800/60 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                      {t('Emergency Triage Protocol (Next 24-48 Hours)')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zinc-200 leading-relaxed">
                    {treatmentPlan.emergencyAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Observed Symptoms Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                {t('Pathological Symptoms & Progression')}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
                {t('Stage')}: {symptoms.diseaseStage}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-zinc-400 font-medium block">{t('Key Visual Indicators Observed:')}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptoms.visualSigns.map((sign, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-xs text-zinc-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{sign}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-zinc-400">{t('Impacted Tissues:')}</span>
              {symptoms.impactedParts.map((part, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                  {part}
                </span>
              ))}
              {symptoms.chlorosisOrNecrosis && (
                <span className="text-zinc-400 italic ml-2">({symptoms.chlorosisOrNecrosis})</span>
              )}
            </div>
          </div>

          {/* Treatment Center Tabs: Organic vs Chemical vs Cultural */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-emerald-400" />
                  {t('Prescription & Treatment Center')}
                </h3>
                <p className="text-xs text-zinc-400">{t('Evidence-based integrated pest and pathogen management')}</p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                <button
                  onClick={() => setActiveTreatmentTab('organic')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activeTreatmentTab === 'organic'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t('Organic & Biological')}
                </button>
                <button
                  onClick={() => setActiveTreatmentTab('chemical')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activeTreatmentTab === 'chemical'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t('Chemical Protectants')}
                </button>
                <button
                  onClick={() => setActiveTreatmentTab('cultural')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activeTreatmentTab === 'cultural'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t('Cultural Practices')}
                </button>
              </div>
            </div>

            {/* Tab: Organic Solutions */}
            {activeTreatmentTab === 'organic' && (
              <div className="space-y-3">
                {treatmentPlan.organicSolutions.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">{t('No specific organic treatments required.')}</p>
                ) : (
                  treatmentPlan.organicSolutions.map((sol, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-emerald-500/40 transition space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-emerald-200 group-hover:text-emerald-100 transition">
                            {sol.treatment}
                          </span>
                        </div>
                        <button
                          onClick={() => onOpenDosage(sol.treatment)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-medium flex items-center gap-1 transition shrink-0"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>{t('Calculate Dilution')}</span>
                        </button>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed pl-8">
                        <strong className="text-zinc-400">{t('Preparation & Spray:')}</strong> {sol.recipeOrMethod}
                      </p>

                      <div className="flex items-center gap-2 pl-8 text-[11px] text-zinc-400">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>{t('Frequency:')} <strong className="text-zinc-300">{sol.frequency}</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Chemical Solutions */}
            {activeTreatmentTab === 'chemical' && (
              <div className="space-y-3">
                {treatmentPlan.chemicalSolutions.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">{t('No chemical treatments necessary for this case.')}</p>
                ) : (
                  treatmentPlan.chemicalSolutions.map((sol, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-blue-500/40 transition space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-sm font-semibold text-blue-200 block">
                              {t('Active:')} {sol.activeIngredient}
                            </span>
                            {sol.commercialExample && (
                              <span className="text-[11px] text-zinc-400">
                                {t('Trade names:')} {sol.commercialExample}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => onOpenDosage(sol.activeIngredient)}
                          className="px-2.5 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-blue-800 text-blue-300 text-[11px] font-medium flex items-center gap-1 transition shrink-0"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>{t('Calculate Dosage')}</span>
                        </button>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed pl-8">
                        {sol.instructions}
                      </p>

                      {sol.safetyWarning && (
                        <div className="flex items-start gap-2 pl-8 pt-1 text-[11px] text-rose-300/90">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{t('Safety / Pre-harvest Interval:')} {sol.safetyWarning}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Cultural Practices */}
            {activeTreatmentTab === 'cultural' && (
              <div className="space-y-2.5">
                {treatmentPlan.culturalPractices.map((practice, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{practice}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Long-Term Prevention & Bio Prognosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prevention Checklist */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                {t('Proactive Prevention')}
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {prevention.slice(0, 4).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recovery Prognosis */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                {t('Recovery Prognosis')}
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {recoveryPrognosis}
              </p>
              {botanistNotes && (
                <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 italic">
                  &ldquo;{botanistNotes}&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
