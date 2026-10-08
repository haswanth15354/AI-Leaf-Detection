import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout,
  Camera,
  Upload,
  BookOpen,
  Calculator,
  History,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Layers,
  Search,
  Activity,
} from 'lucide-react';
import { DiagnosisResult, ScanHistoryRecord, SampleLeaf } from './types/disease';
import { SAMPLE_LEAVES } from './data/sampleLeaves';
import { optimizeImageForUpload, urlToBase64, fileToBase64 } from './utils/imageUtils';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { DiagnosisView } from './components/DiagnosisView';
import { AgronomistChat } from './components/AgronomistChat';
import { DosageCalculatorModal } from './components/DosageCalculatorModal';
import { DiseaseAtlasModal } from './components/DiseaseAtlasModal';
import { ScanHistoryDrawer } from './components/ScanHistoryDrawer';
import { ComparisonModal } from './components/ComparisonModal';
import { UserProfileMenu } from './components/UserProfileMenu';
import { AuthModal } from './components/AuthModal';
import { HealthTrendsView } from './components/HealthTrendsView';
import { AuthPage } from './components/AuthPage';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  // State for active image and diagnosis
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeDiagnosis, setActiveDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Uploading image...');
  const [error, setError] = useState<string | null>(null);

  // User context hints
  const [plantHint, setPlantHint] = useState('');
  const [environmentContext, setEnvironmentContext] = useState('');

  // Modals & Drawers state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDosageOpen, setIsDosageOpen] = useState(false);
  const [dosageTreatment, setDosageTreatment] = useState('Copper Hydroxide');
  const [isAtlasOpen, setIsAtlasOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'scanner' | 'trends' | 'auth'>('scanner');
  const [authPageInitialMode, setAuthPageInitialMode] = useState<'login' | 'register'>('login');

  // History state persisted in localStorage
  const [scanHistory, setScanHistory] = useState<ScanHistoryRecord[]>(() => {
    try {
      const stored = localStorage.getItem('florascan_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync scan history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('florascan_history', JSON.stringify(scanHistory));
    } catch (e) {
      console.error('Failed to save history to localStorage:', e);
    }
  }, [scanHistory]);

  // Main diagnosis handler
  const runDiagnosis = async (base64: string, mimeType: string, displayUrl: string) => {
    setActiveImage(displayUrl);
    setActiveDiagnosis(null);
    setIsAnalyzing(true);
    setError(null);

    // Multi-phase feedback steps
    setAnalysisStep(t('Calibrating botanical vision sensors...'));
    const stepTimer1 = setTimeout(() => {
      setAnalysisStep(t('Screening for fungal, bacterial & viral pathogens...'));
    }, 1200);
    const stepTimer2 = setTimeout(() => {
      setAnalysisStep(t('Mapping lesion coordinates & calculating leaf damage %...'));
    }, 2400);
    const stepTimer3 = setTimeout(() => {
      setAnalysisStep(t('Synthesizing dual organic & chemical prescriptions...'));
    }, 3800);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          plantHint: plantHint.trim() || undefined,
          environmentContext: environmentContext.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to complete plant diagnosis. Please verify your connection.');
      }

      const diagnosisData: DiagnosisResult = await response.json();
      setActiveDiagnosis(diagnosisData);

      // Auto-save to history
      const newRecord: ScanHistoryRecord = {
        id: `scan-${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: displayUrl,
        diagnosis: diagnosisData,
        status: diagnosisData.healthStatus === 'Healthy' ? 'Resolved' : 'Needs Action',
      };
      setScanHistory((prev) => [newRecord, ...prev.slice(0, 24)]);
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      setError(err.message || 'An unexpected error occurred during diagnosis.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsAnalyzing(false);
    }
  };

  // Handle uploaded files
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t('Please upload a valid image file (JPEG, PNG, WEBP).'));
      return;
    }
    try {
      const optimized = await optimizeImageForUpload(file);
      await runDiagnosis(optimized.base64, optimized.mimeType, optimized.dataUrl);
    } catch (err: any) {
      console.error('Image processing failed:', err);
      setError(t('Failed to process uploaded image. Please try another file.'));
    }
  };

  // Handle camera capture
  const handleCameraCapture = async (blob: Blob, dataUrl: string) => {
    try {
      const optimized = await optimizeImageForUpload(blob);
      await runDiagnosis(optimized.base64, optimized.mimeType, dataUrl);
    } catch (err) {
      console.error('Camera processing error:', err);
      setError(t('Could not process camera image.'));
    }
  };

  // Handle sample selection
  const handleSampleClick = async (sample: SampleLeaf) => {
    try {
      setError(null);
      setIsAnalyzing(true);
      setActiveImage(sample.imageUrl);

      if (sample.presetDiagnosis) {
        setAnalysisStep(`Calibrating botanical pathology for ${sample.title}...`);
        await new Promise((resolve) => setTimeout(resolve, 350));
        setActiveDiagnosis(sample.presetDiagnosis);
        setIsAnalyzing(false);

        // Auto-save to history if not already present
        const alreadyInHistory = scanHistory.some((item) => item.imageUrl === sample.imageUrl);
        if (!alreadyInHistory) {
          const newRecord: ScanHistoryRecord = {
            id: `scan-${Date.now()}`,
            timestamp: Date.now(),
            imageUrl: sample.imageUrl,
            diagnosis: sample.presetDiagnosis,
            status: sample.presetDiagnosis.healthStatus === 'Healthy' ? 'Resolved' : 'Needs Action',
          };
          setScanHistory((prev) => [newRecord, ...prev.slice(0, 24)]);
        }
        return;
      }

      setAnalysisStep(`Loading ${sample.title} reference leaf...`);
      const { base64, mimeType } = await urlToBase64(sample.imageUrl);
      await runDiagnosis(base64, mimeType, sample.imageUrl);
    } catch (err: any) {
      console.error('Sample loading error:', err);
      setError(err?.message || 'Failed to load sample image. Please try again.');
      setIsAnalyzing(false);
    }
  };

  // Save/Update status in history
  const handleSaveToHistory = (status: ScanHistoryRecord['status']) => {
    if (!activeDiagnosis || !activeImage) return;
    const existingIndex = scanHistory.findIndex((h) => h.imageUrl === activeImage);
    if (existingIndex >= 0) {
      const updated = [...scanHistory];
      updated[existingIndex].status = status;
      setScanHistory(updated);
    } else {
      const newRecord: ScanHistoryRecord = {
        id: `scan-${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: activeImage,
        diagnosis: activeDiagnosis,
        status,
      };
      setScanHistory([newRecord, ...scanHistory]);
    }
  };

  const handleUpdateStatus = (id: string, status: ScanHistoryRecord['status']) => {
    setScanHistory((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const handleDeleteHistory = (id: string) => {
    setScanHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm(t('Are you sure you want to clear your entire crop scan history?'))) {
      setScanHistory([]);
    }
  };

  const isCurrentSaved = scanHistory.some((h) => h.imageUrl === activeImage);

  return (
    <div lang={language} className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              setCurrentView('scanner');
              setActiveDiagnosis(null);
              setActiveImage(null);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Sprout className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  FloraScan <span className="text-emerald-400 font-extrabold text-sm px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">AI</span>
                </h1>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                {t('Botanical Pathology & AI Crop Doctor')}
              </p>
            </div>
          </div>

          {/* Navigation & Action Links */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <label className="sr-only" htmlFor="language-select">{t('Language')}</label>
            <select
              id="language-select"
              aria-label={t('Language')}
              value={language}
              onChange={(event) => setLanguage(event.target.value as 'en' | 'te')}
              className="h-9 w-[76px] rounded-xl border border-zinc-800 bg-zinc-900 px-2 text-xs font-semibold text-zinc-200 outline-none focus:ring-1 focus:ring-emerald-500 sm:w-28"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
            </select>
            <button
              onClick={() => setCurrentView(currentView === 'trends' ? 'scanner' : 'trends')}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                currentView === 'trends'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-950/60'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
              title={t('Track crop disease severity trajectory & recovery over time')}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{t('Health Trends')}</span>
            </button>

            <button
              onClick={() => setIsAtlasOpen(true)}
              className="px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">{t('Disease Atlas')}</span>
            </button>

            <button
              onClick={() => setIsDosageOpen(true)}
              className="px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-blue-400" />
              <span className="hidden md:inline">{t('Dosage Calc')}</span>
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 relative cursor-pointer"
            >
              <History className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">{t('Crop Log')}</span>
              {scanHistory.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-black">
                  {scanHistory.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsChatOpen(true)}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('Ask Dr. Flora')}</span>
            </button>

            {/* User Profile & Login / Register Component */}
            <div className="pl-1 sm:pl-2 border-l border-zinc-800">
              <UserProfileMenu
                onOpenHistory={() => setIsHistoryOpen(true)}
                onNavigateToAuth={(mode) => {
                  setAuthPageInitialMode(mode);
                  setCurrentView('auth');
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-sm flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-xs font-semibold text-rose-200"
            >
              {t('Dismiss')}
            </button>
          </div>
        )}

        {/* View Routing: Dedicated Auth Page, Health Trends Line Chart, or Scanner Dashboard */}
        {currentView === 'auth' ? (
          <AuthPage
            onBackToApp={() => setCurrentView('scanner')}
            initialMode={authPageInitialMode}
          />
        ) : currentView === 'trends' ? (
          <HealthTrendsView
            history={scanHistory}
            onSelectScan={(record) => {
              setActiveImage(record.imageUrl);
              setActiveDiagnosis(record.diagnosis);
              setCurrentView('scanner');
            }}
            onNewScanRequested={() => {
              setActiveImage(null);
              setActiveDiagnosis(null);
              setCurrentView('scanner');
            }}
            onOpenDosage={() => setIsDosageOpen(true)}
            onOpenChat={() => setIsChatOpen(true)}
          />
        ) : (
          /* Primary Scanner & Pathology Dashboard */
          <>
            {/* Diagnosis Active State */}
            {activeDiagnosis && activeImage && !isAnalyzing ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveDiagnosis(null);
                  setActiveImage(null);
                }}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
              >
                ← {t('Scan Another Plant or Leaf')}
              </button>

              {scanHistory.length > 1 && (
                <button
                  onClick={() => setIsCompareOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t('Compare with Past Scan')}</span>
                </button>
              )}
            </div>

            <DiagnosisView
              imageUrl={activeImage}
              diagnosis={activeDiagnosis}
              onOpenChat={() => setIsChatOpen(true)}
              onOpenDosage={(treatment) => {
                setDosageTreatment(treatment);
                setIsDosageOpen(true);
              }}
              onSaveToHistory={handleSaveToHistory}
              isSaved={isCurrentSaved}
            />
          </div>
        ) : isAnalyzing ? (
          /* Analyzing Animation State */
          <div className="max-w-xl mx-auto py-16 text-center space-y-6 animate-fadeIn">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Leaf className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {t('Analyzing Foliar Pathology')}
              </h2>
              <p className="text-sm font-medium text-emerald-400 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                {analysisStep}
              </p>
            </div>

            {activeImage && (
              <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-black relative">
                <img src={activeImage} alt="Scanning" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent animate-scan" />
              </div>
            )}

            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              FloraScan AI leverages multimodal vision models calibrated for agricultural phytopathology and plant diagnostics.
            </p>
          </div>
        ) : (
          /* Home Screen: Hero & Upload Studio */
          <div className="space-y-10 py-2 sm:py-6">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-semibold shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('AI Vision Disease Detection & Integrated Pest Management')}</span>
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {t('Identify Plant Diseases in Seconds.')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500">
                  {t('Protect Your Harvest.')}
                </span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                {t('Snap or upload a photo of infected leaves, stems, or crops. Get instant scientific pathogen identification, lesion severity assessment, dual organic/chemical treatment plans, and continuous health tracking.')}
              </p>
            </div>

            {/* Input Options Grid */}
            <div className="max-w-2xl mx-auto">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative rounded-3xl p-6 sm:p-8 border-2 border-dashed transition-all duration-300 text-center bg-zinc-900/60 backdrop-blur-sm ${
                  isDragOver
                    ? 'border-emerald-400 bg-emerald-950/20 scale-[1.01]'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Upload Hidden Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-sm transition flex items-center gap-2.5 shadow-lg group"
                    >
                      <Upload className="w-4 h-4 text-emerald-400 group-hover:-translate-y-0.5 transition-transform" />
                      <span>{t('Upload Leaf Photo')}</span>
                    </button>

                    <button
                      onClick={() => setIsCameraOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition flex items-center gap-2.5 shadow-lg shadow-emerald-950/40 group"
                    >
                      <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{t('Open Live Camera')}</span>
                    </button>
                  </div>

                  <p className="text-xs text-zinc-500">
                    {t('or drag & drop leaf images here (JPEG, PNG, WEBP up to 30MB)')}
                  </p>

                  {/* Optional Context Controls */}
                  <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                        {t('Plant Species (Optional)')}
                      </label>
                      <input
                        type="text"
                        value={plantHint}
                        onChange={(e) => setPlantHint(e.target.value)}
                        placeholder={t('e.g. Tomato, Corn, Grape, Rose')}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                        {t('Growing Environment (Optional)')}
                      </label>
                      <input
                        type="text"
                        value={environmentContext}
                        onChange={(e) => setEnvironmentContext(e.target.value)}
                        placeholder={t('e.g. Greenhouse, Outdoor field, Raised bed')}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Sample Library */}
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    {t('Try With Reference Specimen Samples')}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {t('Click any curated leaf sample below to run immediate diagnostic analysis')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {SAMPLE_LEAVES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSampleClick(sample)}
                    className="p-2.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/80 text-left transition-all duration-200 group flex flex-col justify-between shadow-md"
                  >
                    <div>
                      <div className="aspect-square rounded-xl overflow-hidden bg-black mb-2.5 relative border border-zinc-850">
                        <img
                          src={sample.imageUrl}
                          alt={sample.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${
                            sample.severity === 'Healthy'
                              ? 'bg-emerald-600'
                              : sample.severity === 'Severe'
                              ? 'bg-rose-600'
                              : 'bg-amber-600'
                          }`}
                        >
                          {sample.severity}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition truncate">
                        {sample.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate">{sample.diseaseName}</p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-emerald-400 font-medium">
                      <span>{t('Scan Now')}</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto pt-6 border-t border-zinc-900">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">{t('Visual Pathogen Screening')}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t('Identifies 50+ fungal, oomycete, bacterial, viral, and nutrient deficiencies with visual bounding box lesion localization.')}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">{t('Dual-Track Action Plans')}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t('Provides both bio-organic solutions (neem, bacillus, compost teas) and active chemical protectants with safety intervals.')}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">{t('Calibrated Dosage & Doctor Chat')}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t('Calculate tank mix volumes tailored to your plot size and consult Dr. Flora for specialized agronomic advice.')}
                </p>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 px-4 sm:px-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {t('FloraScan AI Botanical Pathology System. Powered by Gemini 3.8 Flash.')}</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <button onClick={() => setIsAtlasOpen(true)} className="hover:text-white transition">
              {t('Pathology Encyclopedia')}
            </button>
            <button onClick={() => setIsDosageOpen(true)} className="hover:text-white transition">
              {t('Spray Dilution Tool')}
            </button>
            <button onClick={() => setIsChatOpen(true)} className="hover:text-white transition">
              {t('Agronomist Consultation')}
            </button>
          </div>
        </div>
      </footer>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Agronomist AI Q&A Drawer */}
      <AgronomistChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        diagnosis={activeDiagnosis}
      />

      {/* Dosage & Spray Tank Calculator Modal */}
      <DosageCalculatorModal
        isOpen={isDosageOpen}
        onClose={() => setIsDosageOpen(false)}
        initialTreatment={dosageTreatment}
        initialSeverity={activeDiagnosis?.primaryDiagnosis.severity || 'Moderate'}
      />

      {/* Disease Atlas Encyclopedia Modal */}
      <DiseaseAtlasModal
        isOpen={isAtlasOpen}
        onClose={() => setIsAtlasOpen(false)}
      />

      {/* Scan History Drawer */}
      <ScanHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={scanHistory}
        onSelectScan={(record) => {
          setActiveImage(record.imageUrl);
          setActiveDiagnosis(record.diagnosis);
          setCurrentView('scanner');
        }}
        onDeleteScan={handleDeleteHistory}
        onClearHistory={handleClearHistory}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Crop Comparison Modal */}
      {activeImage && activeDiagnosis && (
        <ComparisonModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          currentImageUrl={activeImage}
          currentPlantName={activeDiagnosis.plant.commonName}
          history={scanHistory.filter((h) => h.imageUrl !== activeImage)}
        />
      )}

      {/* User Authentication Modal (Sign In / Registration) */}
      <AuthModal />
    </div>
  );
}
