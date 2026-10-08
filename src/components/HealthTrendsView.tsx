import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  Eye,
  PlusCircle,
  Clock,
  Layers,
  Sprout,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { ScanHistoryRecord, DiagnosisResult } from '../types/disease';
import { useLanguage } from '../context/LanguageContext';

interface HealthTrendsViewProps {
  history: ScanHistoryRecord[];
  onSelectScan?: (record: ScanHistoryRecord) => void;
  onNewScanRequested?: () => void;
  onOpenDosage?: () => void;
  onOpenChat?: () => void;
}

// Pre-seeded high quality realistic recovery dataset for instant demonstration
const SAMPLE_RECOVERY_TIMELINE: ScanHistoryRecord[] = [
  {
    id: 'rec-day-1',
    timestamp: Date.now() - 14 * 86400000, // 14 days ago
    imageUrl: 'src/assets/images/tomato_blight_leaf_1790153414247.jpg',
    status: 'Needs Action',
    notes: 'Initial acute detection: dark necrotic bullseye lesions with chlorotic yellow halo.',
    diagnosis: {
      isPlant: true,
      plant: { commonName: 'Tomato', scientificName: 'Solanum lycopersicum', family: 'Solanaceae' },
      healthStatus: 'Diseased',
      primaryDiagnosis: {
        name: 'Early Blight (Alternaria solani)',
        pathogenType: 'Fungal',
        severity: 'Severe',
        confidence: 0.96,
        affectedPercentage: 68,
        contagionRisk: 'High',
      },
      symptoms: {
        visualSigns: ['Target-like concentric rings', 'Severe chlorotic leaf margin yellowing'],
        impactedParts: ['Lower foliar canopy'],
        diseaseStage: 'Active fungal sporulation',
      },
      treatmentPlan: {
        emergencyAction: 'Isolate affected rows and spray Copper Hydroxide immediately.',
        organicSolutions: [{ treatment: 'Neem Oil Spray', recipeOrMethod: '5ml/L water', frequency: 'Every 5 days' }],
        chemicalSolutions: [{ activeIngredient: 'Copper Hydroxide', instructions: '2.5g per Liter water foliar spray' }],
        culturalPractices: ['Prune lowest 12 inches of infected foliage to prevent splash reinfection'],
      },
      prevention: ['Avoid overhead sprinklers', 'Apply straw mulch beneath plants'],
      recoveryPrognosis: 'Moderate; requires aggressive foliar fungicide intervention',
    },
  },
  {
    id: 'rec-day-4',
    timestamp: Date.now() - 10 * 86400000, // 10 days ago
    imageUrl: 'src/assets/images/tomato_blight_leaf_1790153414247.jpg',
    status: 'Treated',
    notes: 'Post-spray check: lesion expansion halted after initial Copper Hydroxide application.',
    diagnosis: {
      isPlant: true,
      plant: { commonName: 'Tomato', scientificName: 'Solanum lycopersicum', family: 'Solanaceae' },
      healthStatus: 'Diseased',
      primaryDiagnosis: {
        name: 'Early Blight (Alternaria solani)',
        pathogenType: 'Fungal',
        severity: 'Moderate',
        confidence: 0.94,
        affectedPercentage: 45,
        contagionRisk: 'Moderate',
      },
      symptoms: {
        visualSigns: ['Lesion borders dried, sporulation arrested', 'Yellow halo fading'],
        impactedParts: ['Lower foliar canopy'],
        diseaseStage: 'Contained lesion regression',
      },
      treatmentPlan: {
        emergencyAction: 'Apply secondary protective biological Bacillus subtilis spray.',
        organicSolutions: [{ treatment: 'Bacillus subtilis', recipeOrMethod: '3g/L', frequency: 'Weekly' }],
        chemicalSolutions: [],
        culturalPractices: ['Increase inter-row airflow'],
      },
      prevention: ['Drip irrigation only'],
      recoveryPrognosis: 'Good; tissue necrosis contained',
    },
  },
  {
    id: 'rec-day-8',
    timestamp: Date.now() - 6 * 86400000, // 6 days ago
    imageUrl: 'src/assets/images/tomato_blight_leaf_1790153414247.jpg',
    status: 'Monitoring',
    notes: 'Healthy vigorous green shoots emerging at top canopy. Old lesions dry and inactive.',
    diagnosis: {
      isPlant: true,
      plant: { commonName: 'Tomato', scientificName: 'Solanum lycopersicum', family: 'Solanaceae' },
      healthStatus: 'Diseased',
      primaryDiagnosis: {
        name: 'Early Blight (Alternaria solani)',
        pathogenType: 'Fungal',
        severity: 'Mild',
        confidence: 0.91,
        affectedPercentage: 22,
        contagionRisk: 'Low',
      },
      symptoms: {
        visualSigns: ['Scarred inactive leaf spots', 'Vigorous new leaf expansion'],
        impactedParts: ['Localized old foliage'],
        diseaseStage: 'Recovery and healing phase',
      },
      treatmentPlan: {
        emergencyAction: 'Maintain foliar potassium silica nutritional booster.',
        organicSolutions: [{ treatment: 'Compost tea foliar drench', recipeOrMethod: 'Diluted 1:5', frequency: 'Bi-weekly' }],
        chemicalSolutions: [],
        culturalPractices: ['Remove remaining scarred lower leaves'],
      },
      prevention: ['Maintain drip line spacing'],
      recoveryPrognosis: 'High recovery; full harvest potential preserved',
    },
  },
  {
    id: 'rec-day-14',
    timestamp: Date.now() - 1 * 86400000, // Yesterday
    imageUrl: 'src/assets/images/healthy_pepper_leaf_1790153472091.jpg',
    status: 'Resolved',
    notes: 'Complete remission. Foliar canopy 92% healthy with active flowering.',
    diagnosis: {
      isPlant: true,
      plant: { commonName: 'Tomato', scientificName: 'Solanum lycopersicum', family: 'Solanaceae' },
      healthStatus: 'Healthy',
      primaryDiagnosis: {
        name: 'Recovered / Healthy Leaf Tissue',
        pathogenType: 'None',
        severity: 'None',
        confidence: 0.98,
        affectedPercentage: 8,
        contagionRisk: 'None',
      },
      symptoms: {
        visualSigns: ['Lush deep green pigmentation', 'Turgid uniform lamina surface'],
        impactedParts: ['Full canopy'],
        diseaseStage: 'Remission / Healthy recovery',
      },
      treatmentPlan: {
        emergencyAction: 'No chemical action required. Continue seasonal organic nutrition.',
        organicSolutions: [],
        chemicalSolutions: [],
        culturalPractices: ['Weekly routine visual inspection'],
      },
      prevention: ['Maintain balanced N-P-K soil fertility'],
      recoveryPrognosis: 'Fully recovered',
    },
  },
];

export const HealthTrendsView: React.FC<HealthTrendsViewProps> = ({
  history,
  onSelectScan,
  onNewScanRequested,
  onOpenDosage,
  onOpenChat,
}) => {
  const { language, t } = useLanguage();
  // Toggle between user's real scans or demo sample recovery timeline
  const [useSampleTimeline, setUseSampleTimeline] = useState(history.length < 2);
  const [selectedCrop, setSelectedCrop] = useState<string>('All Crops');
  const [metricMode, setMetricMode] = useState<'severity' | 'healthIndex'>('severity');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [activeRecordModal, setActiveRecordModal] = useState<ScanHistoryRecord | null>(null);

  // Active records to chart
  const sourceRecords = useSampleTimeline || history.length === 0 ? SAMPLE_RECOVERY_TIMELINE : history;

  // Filter records by crop and sort chronologically (oldest to newest)
  const filteredRecords = useMemo(() => {
    let recs = [...sourceRecords];
    if (selectedCrop !== 'All Crops') {
      recs = recs.filter((r) => r.diagnosis.plant.commonName.toLowerCase() === selectedCrop.toLowerCase());
    }
    return recs.sort((a, b) => a.timestamp - b.timestamp);
  }, [sourceRecords, selectedCrop]);

  // Unique crops available in dataset
  const availableCrops = useMemo(() => {
    const set = new Set<string>();
    sourceRecords.forEach((r) => {
      if (r.diagnosis.plant.commonName) {
        set.add(r.diagnosis.plant.commonName);
      }
    });
    return Array.from(set);
  }, [sourceRecords]);

  // Trend analysis calculations
  const trendAnalysis = useMemo(() => {
    if (filteredRecords.length === 0) {
      return {
        direction: 'none',
        delta: 0,
        currentSeverity: 0,
        baselineSeverity: 0,
        label: t('No data'),
        color: 'text-stone-400',
        bg: 'bg-stone-800',
        borderColor: 'border-stone-700',
        recommendation: t('Scan more crops to establish a longitudinal baseline.'),
      };
    }

    const baseline = filteredRecords[0].diagnosis.primaryDiagnosis.affectedPercentage;
    const latest = filteredRecords[filteredRecords.length - 1].diagnosis.primaryDiagnosis.affectedPercentage;
    const delta = latest - baseline;

    if (delta <= -8) {
      return {
        direction: 'improving',
        delta: Math.abs(delta),
        currentSeverity: latest,
        baselineSeverity: baseline,
        label: t('Crop Health Improving'),
        sublabel: t('Severity decreased by {percent}% since first baseline scan').replace('{percent}', `${Math.round(Math.abs(delta))}`),
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/40',
        borderColor: 'border-emerald-800/80',
        recommendation:
          t('Applied treatments are successfully suppressing pathogen sporulation. Continue preventative foliar schedule and monitor new shoots.'),
      };
    } else if (delta >= 8) {
      return {
        direction: 'declining',
        delta: delta,
        currentSeverity: latest,
        baselineSeverity: baseline,
        label: t('Crop Health Declining'),
        sublabel: t('Severity increased by {percent}% over monitoring window').replace('{percent}', `${Math.round(delta)}`),
        color: 'text-rose-400',
        bg: 'bg-rose-950/40',
        borderColor: 'border-rose-800/80',
        recommendation:
          t('Pathogen pressure is intensifying. Consider escalating treatment dosage, pruning heavily infected foliage, and isolating affected rows immediately.'),
      };
    } else {
      return {
        direction: 'stable',
        delta: Math.abs(delta),
        currentSeverity: latest,
        baselineSeverity: baseline,
        label: t('Crop Condition Stable'),
        sublabel: t('Pathogen expansion arrested; symptoms are holding steady'),
        color: 'text-amber-400',
        bg: 'bg-amber-950/40',
        borderColor: 'border-amber-800/80',
        recommendation:
          t('Disease progression is contained. Maintain recommended cultural practices and prepare for next protective spray cycle.'),
      };
    }
  }, [filteredRecords, t]);

  // SVG Chart Dimensions & Coordinates
  const chartWidth = 720;
  const chartHeight = 260;
  const padding = { top: 30, right: 35, bottom: 45, left: 55 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const points = useMemo(() => {
    if (filteredRecords.length === 0) return [];
    const count = filteredRecords.length;

    return filteredRecords.map((record, index) => {
      const severity = record.diagnosis.primaryDiagnosis.affectedPercentage;
      const value = metricMode === 'severity' ? severity : Math.max(0, 100 - severity);

      const x = count === 1 ? padding.left + graphWidth / 2 : padding.left + (index / (count - 1)) * graphWidth;
      // In SVG, y=0 is at top, so higher value is lower y
      const y = padding.top + graphHeight - (value / 100) * graphHeight;

      return { x, y, value, record, index };
    });
  }, [filteredRecords, metricMode, graphWidth, graphHeight]);

  // Construct smooth SVG path
  const svgPathD = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [points]);

  // Area fill under the path
  const areaPathD = useMemo(() => {
    if (points.length < 2) return '';
    const bottomY = padding.top + graphHeight;
    return `${svgPathD} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
  }, [svgPathD, points, graphHeight]);

  // Format timestamp helper
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFullDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/50">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {t('Crop Health Trends & Severity Tracker')}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                {t('AI Vision Chronology')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              {t('Track longitudinal disease severity over time. Verify whether organic/chemical treatments are arresting lesion spread, restoring foliar canopy, or requiring intervention.')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {history.length > 0 && (
            <button
              onClick={() => setUseSampleTimeline(!useSampleTimeline)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t(useSampleTimeline ? 'Switch to My Scans' : 'View Sample 14-Day Timeline')}</span>
            </button>
          )}

          {onNewScanRequested && (
            <button
              onClick={onNewScanRequested}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-950/60 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('Record New Scan')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI & Health Trajectory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Indicator Card */}
        <div className={`p-5 rounded-2xl border ${trendAnalysis.borderColor} ${trendAnalysis.bg} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {t('Health Trajectory')}
              </span>
              {trendAnalysis.direction === 'improving' ? (
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              ) : trendAnalysis.direction === 'declining' ? (
                <TrendingUp className="w-4 h-4 text-rose-400" />
              ) : (
                <Minus className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <h3 className={`text-lg font-black mt-1 ${trendAnalysis.color}`}>
              {trendAnalysis.label}
            </h3>
            <p className="text-xs text-zinc-300 mt-1">
              {trendAnalysis.sublabel}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>{t('Updated across {count} scans').replace('{count}', `${filteredRecords.length}`)}</span>
          </div>
        </div>

        {/* Current Severity Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {t('Latest Damage Area')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">
                {trendAnalysis.currentSeverity}%
              </span>
              <span className="text-xs font-semibold text-zinc-400">{t('affected leaf tissue')}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  trendAnalysis.currentSeverity <= 20
                    ? 'bg-emerald-500'
                    : trendAnalysis.currentSeverity <= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, trendAnalysis.currentSeverity)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span>{t('Baseline')}: {trendAnalysis.baselineSeverity}%</span>
            <span className={trendAnalysis.color}>
              {trendAnalysis.direction === 'improving' ? `-${Math.round(trendAnalysis.delta)}%` : `+${Math.round(trendAnalysis.delta)}%`}
            </span>
          </div>
        </div>

        {/* Active Pathogen Resolution Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {t('Active Pathogen')}
            </span>
            <h3 className="text-base font-bold text-white mt-1 truncate">
              {filteredRecords.length > 0
                ? filteredRecords[filteredRecords.length - 1].diagnosis.primaryDiagnosis.name
                : t('None detected')}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {t('Crop')}: <strong className="text-zinc-200">{filteredRecords[0]?.diagnosis.plant.commonName || t('Plant')}</strong>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">{t('Status')}:</span>
            <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              {t(filteredRecords[filteredRecords.length - 1]?.status || 'Monitoring')}
            </span>
          </div>
        </div>

        {/* Quick Treatment Assistance Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {t('Treatment Advisory')}
            </span>
            <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
              {trendAnalysis.recommendation}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center gap-2">
            {onOpenDosage && (
              <button
                onClick={onOpenDosage}
                className="flex-1 py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-200 text-center transition cursor-pointer"
              >
                {t('Dosage Calc')}
              </button>
            )}
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="flex-1 py-1 px-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-[11px] font-semibold text-emerald-300 border border-emerald-800 text-center transition cursor-pointer"
              >
                {t('Ask Agronomist')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl shadow-xl">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              {t('Disease Severity Trajectory Curve')}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Metric Mode Toggle */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setMetricMode('severity')}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  metricMode === 'severity'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t('Severity % (Lower is better)')}
              </button>
              <button
                onClick={() => setMetricMode('healthIndex')}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  metricMode === 'healthIndex'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t('Health Index (Higher is better)')}
              </button>
            </div>

            {/* Crop Selector */}
            {availableCrops.length > 1 && (
              <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800 text-xs">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="bg-transparent text-zinc-200 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="All Crops">{t('All Crops')}</option>
                  {availableCrops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* SVG Interactive Line Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[620px] select-none"
          >
            <defs>
              {/* Area Gradient */}
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={
                    metricMode === 'severity'
                      ? trendAnalysis.direction === 'improving'
                        ? '#10b981'
                        : '#f43f5e'
                      : '#10b981'
                  }
                  stopOpacity="0.35"
                />
                <stop
                  offset="100%"
                  stopColor={
                    metricMode === 'severity'
                      ? trendAnalysis.direction === 'improving'
                        ? '#10b981'
                        : '#f43f5e'
                      : '#10b981'
                  }
                  stopOpacity="0.0"
                />
              </linearGradient>

              {/* Stroke Gradient */}
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor={trendAnalysis.direction === 'declining' ? '#f43f5e' : '#10b981'} />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines and percentage levels */}
            {[0, 25, 50, 75, 100].map((level) => {
              const y = padding.top + graphHeight - (level / 100) * graphHeight;
              return (
                <g key={level}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#27272a"
                    strokeDasharray={level === 0 || level === 100 ? '' : '4 4'}
                    strokeWidth={level === 0 ? '1.5' : '1'}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-zinc-500 font-mono"
                  >
                    {level}%
                  </text>
                </g>
              );
            })}

            {/* Severity Band Zone Labels on the Right */}
            {metricMode === 'severity' ? (
              <g className="text-[9px] fill-zinc-600 font-semibold uppercase">
                <text x={chartWidth - padding.right + 6} y={padding.top + graphHeight * 0.15}>
                  {t('Critical')}
                </text>
                <text x={chartWidth - padding.right + 6} y={padding.top + graphHeight * 0.45}>
                  {t('Moderate')}
                </text>
                <text x={chartWidth - padding.right + 6} y={padding.top + graphHeight * 0.85}>
                  {t('Healthy / Mild')}
                </text>
              </g>
            ) : null}

            {/* Area under curve */}
            {areaPathD && <path d={areaPathD} fill="url(#areaGradient)" />}

            {/* Dotted Baseline Reference Line */}
            {points.length > 1 && (
              <line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[points.length - 1].x}
                y2={points[0].y}
                stroke="#52525b"
                strokeDasharray="3 3"
                strokeWidth="1"
                opacity="0.6"
              />
            )}

            {/* Main Connecting Curve */}
            {svgPathD && (
              <path
                d={svgPathD}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points */}
            {points.map((pt, idx) => {
              const isHovered = hoveredPointIndex === idx;
              const isLatest = idx === points.length - 1;

              return (
                <g key={pt.record.id} className="cursor-pointer">
                  {/* Subtle pulsing glow for latest scan */}
                  {isLatest && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="#10b981"
                      opacity="0.25"
                      className="animate-ping"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 7 : 5}
                    fill={isLatest ? '#34d399' : '#18181b'}
                    stroke={isLatest ? '#ffffff' : '#34d399'}
                    strokeWidth="2.5"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    onClick={() => setActiveRecordModal(pt.record)}
                  />

                  {/* Value label on top of point */}
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    className="text-[11px] font-bold fill-white font-mono pointer-events-none"
                  >
                    {Math.round(pt.value)}%
                  </text>

                  {/* X Axis Date Label */}
                  <text
                    x={pt.x}
                    y={padding.top + graphHeight + 20}
                    textAnchor="middle"
                    className="text-[10px] fill-zinc-400 font-medium pointer-events-none"
                  >
                    {formatDate(pt.record.timestamp)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Hover Tooltip Box */}
          {hoveredPointIndex !== null && points[hoveredPointIndex] && (
            <div
              className="absolute pointer-events-none z-20 bg-zinc-950/95 border border-zinc-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs w-64 animate-fade-in"
              style={{
                left: `${Math.min(Math.max(points[hoveredPointIndex].x - 80, 10), chartWidth - 250)}px`,
                top: `${Math.max(points[hoveredPointIndex].y - 110, 10)}px`,
              }}
            >
              <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800 pb-1.5 mb-1.5">
                <span>{formatFullDate(points[hoveredPointIndex].record.timestamp)}</span>
                <span className="font-bold text-emerald-400 uppercase">
                  {points[hoveredPointIndex].record.status}
                </span>
              </div>
              <p className="font-bold text-white text-sm">
                {points[hoveredPointIndex].record.diagnosis.primaryDiagnosis.name}
              </p>
              <p className="text-[11px] text-zinc-400">
                {t('Crop')}: {points[hoveredPointIndex].record.diagnosis.plant.commonName}
              </p>
              <div className="mt-2 flex items-center justify-between font-mono text-[11px]">
                <span className="text-zinc-400">{t('Severity')}:</span>
                <span className="font-bold text-amber-400">
                  {points[hoveredPointIndex].record.diagnosis.primaryDiagnosis.affectedPercentage}% {t('damage')}
                </span>
              </div>
              {points[hoveredPointIndex].record.notes && (
                <p className="mt-1.5 text-[10px] text-zinc-400 italic line-clamp-2">
                  "{points[hoveredPointIndex].record.notes}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>{t('Healthy / Remission (0-20%)')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>{t('Moderate Stress (21-50%)')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span>{t('Severe / Critical (>50%)')}</span>
            </span>
          </div>

          <div className="text-[11px] text-zinc-500">
            {t('Click any data node on the line chart to inspect full pathology report.')}
          </div>
        </div>
      </div>

      {/* Chronological Scan Timeline Feed */}
      <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{t('Inspection Log & Treatment Milestones')}</span>
          </h3>
          <span className="text-xs text-zinc-400">
            {filteredRecords.length} {t('recorded checkpoints')}
          </span>
        </div>

        <div className="space-y-3">
          {filteredRecords
            .slice()
            .reverse()
            .map((rec, idx) => {
              const diag = rec.diagnosis;
              const severity = diag.primaryDiagnosis.affectedPercentage;

              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    if (onSelectScan) onSelectScan(rec);
                  }}
                  className="p-4 rounded-2xl bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Leaf thumbnail if available */}
                    {rec.imageUrl ? (
                      <img
                        src={rec.imageUrl}
                        alt={t('Leaf scan')}
                        className="w-14 h-14 rounded-xl object-cover border border-zinc-700/80 group-hover:scale-105 transition-transform shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                        <Sprout className="w-6 h-6" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                          {diag.plant.commonName} - {diag.primaryDiagnosis.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {diag.primaryDiagnosis.pathogenType}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {formatFullDate(rec.timestamp)}
                      </p>
                      {rec.notes && (
                        <p className="text-xs text-zinc-300 mt-1 line-clamp-1 italic">
                          "{rec.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress & Severity indicator */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">
                        {severity}% {t('Severity')}
                      </div>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          rec.status === 'Resolved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : rec.status === 'Treated'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : rec.status === 'Monitoring'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {t(rec.status)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-2 rounded-xl bg-zinc-800 group-hover:bg-emerald-600 group-hover:text-white text-zinc-400 transition-colors"
                      title={t('Inspect Diagnostic Details')}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Record Quick Inspect Modal */}
      {activeRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setActiveRecordModal(null)}
              className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {activeRecordModal.diagnosis.plant.commonName} {t('Checkpoint')}
                </h3>
                <p className="text-xs text-zinc-400">
                  {formatFullDate(activeRecordModal.timestamp)}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <p className="font-bold text-white text-sm mb-1">
                  {activeRecordModal.diagnosis.primaryDiagnosis.name}
                </p>
                <p className="text-zinc-400">
                  {t(activeRecordModal.diagnosis.primaryDiagnosis.pathogenType)} {t('Pathogen')} •{' '}
                  <strong className="text-amber-400">
                    {activeRecordModal.diagnosis.primaryDiagnosis.affectedPercentage}% {t('leaf area')}
                  </strong>
                </p>
              </div>

              {activeRecordModal.notes && (
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                  <span className="font-semibold text-zinc-400 block mb-1">{t('Field Observation:')}</span>
                  <p className="italic">"{activeRecordModal.notes}"</p>
                </div>
              )}

              {activeRecordModal.diagnosis.treatmentPlan.emergencyAction && (
                <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/60">
                  <span className="font-bold text-emerald-400 block mb-1">{t('Prescribed Action:')}</span>
                  <p>{activeRecordModal.diagnosis.treatmentPlan.emergencyAction}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveRecordModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700"
              >
                {t('Close')}
              </button>
              {onSelectScan && (
                <button
                  onClick={() => {
                    const rec = activeRecordModal;
                    setActiveRecordModal(null);
                    onSelectScan(rec);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950/50"
                >
                  {t('Load in Pathology Dashboard')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
