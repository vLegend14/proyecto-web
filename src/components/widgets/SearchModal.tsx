import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { INDICATOR_NAMES } from '../../constants/indicators';
import type { IndicatorCode } from '../../types/indicator';

const CURRENT_YEAR = new Date().getFullYear();
const AVAILABLE_YEARS = Array.from({ length: 7 }, (_, index) => CURRENT_YEAR - index);

const indicatorEntries = Object.entries(INDICATOR_NAMES).map(([code, name]) => ({
  code: code as IndicatorCode,
  name,
}));

// ─── modal de busqueda spotlight estilo ─────────────────────
// ─── permite buscar indicador y año en dos pasos
export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState<'indicator' | 'year'>('indicator');
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorCode | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ─── shortcut ctrl+k para abrir/cerrar ────────────────────────
  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen((previousState) => !previousState);
      }
    };
    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, []);

  // ─── manejar apertura/cierre del modal ────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchQuery('');
      setCurrentStep('indicator');
      setSelectedIndicator(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredIndicators = useMemo(() => {
    if (!searchQuery.trim()) return indicatorEntries;
    const queryLowercase = searchQuery.toLowerCase();
    return indicatorEntries.filter(
      (indicator) =>
        indicator.code.includes(queryLowercase) ||
        indicator.name.toLowerCase().includes(queryLowercase)
    );
  }, [searchQuery]);

  const handleIndicatorSelection = (code: IndicatorCode) => {
    setSelectedIndicator(code);
    setCurrentStep('year');
    setSearchQuery('');
  };

  const handleYearSelection = (year: number) => {
    if (selectedIndicator) {
      window.location.href = `/busqueda-historica/?indicator=${selectedIndicator}&year=${year}`;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (currentStep === 'year') {
        setCurrentStep('indicator');
        setSelectedIndicator(null);
      } else {
        setIsOpen(false);
      }
    }
  };

  const selectedIndicatorName = selectedIndicator
    ? INDICATOR_NAMES[selectedIndicator]
    : '';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-icon relative h-8 w-8 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
        aria-label="Buscar indicador"
      >
        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {isMounted && createPortal(
        <div
          className={`fixed inset-0 z-50 flex items-start justify-center pt-[15vh] transition-opacity duration-200 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onKeyDown={handleKeyDown}
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`relative w-full max-w-md mx-4 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl transition-all duration-200 ${
              isOpen ? 'scale-100' : 'scale-95'
            }`}
          >
            {/* ─── paso 1: seleccionar indicador */}
            {currentStep === 'indicator' && (
              <>
                <div className="flex items-center gap-3 border-b border-slate-700/60 px-4 py-3">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Buscar indicador..."
                    className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
                  />
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                    ESC
                  </kbd>
                </div>

                <div className="max-h-72 overflow-y-auto p-1.5">
                  {filteredIndicators.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      No se encontraron indicadores
                    </div>
                  ) : (
                    filteredIndicators.map((indicator) => (
                      <button
                        key={indicator.code}
                        onClick={() => handleIndicatorSelection(indicator.code)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-800/60"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                          {indicator.code.slice(0, 3).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-200 truncate">{indicator.name}</p>
                          <p className="text-[11px] text-slate-500">{indicator.code}</p>
                        </div>
                        <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-700/60 px-4 py-2.5">
                  <p className="text-[10px] text-slate-500">
                    <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[9px]">Ctrl+K</kbd>
                    {' '}para abrir ·{' '}
                    <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[9px]">ESC</kbd>
                    {' '}para cerrar
                  </p>
                </div>
              </>
            )}

            {/* ─── paso 2: seleccionar año */}
            {currentStep === 'year' && (
              <>
                <div className="flex items-center gap-3 border-b border-slate-700/60 px-4 py-3">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{selectedIndicatorName}</p>
                    <p className="text-[10px] text-slate-500">Seleccionar año</p>
                  </div>
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                    ESC
                  </kbd>
                </div>

                <div className="max-h-72 overflow-y-auto p-1.5">
                  {AVAILABLE_YEARS.map((year, yearIndex) => (
                    <button
                      key={year}
                      onClick={() => handleYearSelection(year)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-800/60"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-[10px] font-bold text-blue-400">
                        {year}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-200">{year}</p>
                        {yearIndex === 0 && (
                          <p className="text-[11px] text-emerald-400">Predeterminado</p>
                        )}
                      </div>
                      <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-700/60 px-4 py-2.5">
                  <button
                    onClick={() => {
                      setCurrentStep('indicator');
                      setSelectedIndicator(null);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    ← Volver a indicadores
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
