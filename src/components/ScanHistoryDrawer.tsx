import React, { useState } from 'react';
import { ScanHistoryRecord } from '../types/disease';
import { History, X, Trash2, Calendar, CheckCircle2, Clock, AlertTriangle, ChevronRight, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ScanHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScanHistoryRecord[];
  onSelectScan: (record: ScanHistoryRecord) => void;
  onDeleteScan: (id: string) => void;
  onClearHistory: () => void;
  onUpdateStatus: (id: string, status: ScanHistoryRecord['status']) => void;
}

export const ScanHistoryDrawer: React.FC<ScanHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectScan,
  onDeleteScan,
  onClearHistory,
  onUpdateStatus,
}) => {
  const { language, t } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<string>('All');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (filterStatus === 'All') return true;
    return item.status === filterStatus;
  });

  const getStatusBadge = (status: ScanHistoryRecord['status']) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Treated':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Monitoring':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{t('Crop Health Journal')}</h3>
              <p className="text-xs text-zinc-400">{history.length} {t('logged scans & pathology records')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-950/40 flex items-center justify-between gap-2 overflow-x-auto">
          {['All', 'Needs Action', 'Treated', 'Monitoring', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                filterStatus === st
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t(st)}
            </button>
          ))}
        </div>

        {/* List of Scans */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 space-y-2">
              <History className="w-12 h-12 mx-auto text-zinc-600 stroke-1" />
              <p className="font-medium text-zinc-400">{t('No scans found')}</p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                {t('Capture or analyze leaf photos and click "Save to Field History" to track progress over time.')}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col gap-3 group"
              >
                <div className="flex gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.diagnosis.plant.commonName}
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-800 shrink-0 cursor-pointer"
                    onClick={() => {
                      onSelectScan(item);
                      onClose();
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white text-sm truncate">
                        {item.diagnosis.plant.commonName}
                      </span>
                      <span className="text-[10px] text-zinc-500 shrink-0">
                        {new Date(item.timestamp).toLocaleDateString(language === 'te' ? 'te-IN' : undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-emerald-300 truncate">
                      {item.diagnosis.primaryDiagnosis.name}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${getStatusBadge(
                          item.status
                        )} bg-zinc-900 focus:outline-none`}
                      >
                        <option value="Needs Action">{t('Needs Action')}</option>
                        <option value="Treated">{t('Treated')}</option>
                        <option value="Monitoring">{t('Monitoring')}</option>
                        <option value="Resolved">{t('Resolved')}</option>
                      </select>

                      <span className="text-[10px] text-zinc-400">
                        {t(item.diagnosis.primaryDiagnosis.severity)} {t('severity')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                  <button
                    onClick={() => {
                      onSelectScan(item);
                      onClose();
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition"
                  >
                    <span>{t('View Analysis')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteScan(item.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1 transition"
                    title={t('Delete Record')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {history.length > 0 && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="text-xs text-zinc-500 hover:text-rose-400 transition flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('Clear All History')}</span>
            </button>
            <span className="text-xs text-zinc-400">{history.length} {t('records saved')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
