import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { navItems } from "../../data/navigation";

// ─── menu movil con animaciones y portal ─────────────────────
// ─── se abre desde el header en dispositivos pequeños
export default function MobileMenu({ currentPath }: { currentPath: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ─── bloquear scroll del body cuando el menu esta abierto────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300 lg:hidden active:scale-95"
        aria-label="Abrir menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isMounted && createPortal(
        <div
          className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: isOpen ? 1 : 0 }}
            onClick={closeMenu}
          />
          <aside
            className="relative flex h-full w-[85vw] max-w-64 flex-col border-r border-slate-800/60 bg-surface transition-all duration-300"
            style={{
              transform: isOpen ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            <div className="flex h-14 items-center justify-between border-b border-slate-800/60 pl-5 pr-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/20">
                  <svg className="h-[18px] w-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <span className="text-sm font-bold tracking-tight text-white">PYME Finance</span>
                  <p className="text-[10px] text-slate-500">Panel de indicadores</p>
                </div>
              </div>
              <button
                onClick={closeMenu}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300 active:scale-95"
                aria-label="Cerrar menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-4">
              {navItems.map((navigationItem, itemIndex) => {
                const isActive = currentPath === navigationItem.href;
                return (
                  <a
                    key={navigationItem.href}
                    href={navigationItem.href}
                    onClick={closeMenu}
                    className={`group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                    }`}
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? "translateX(0)" : "translateX(-12px)",
                      transition: "all 0.3s ease-out",
                      transitionDelay: isOpen ? `${100 + itemIndex * 40}ms` : "0ms",
                    }}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-emerald-500" />
                    )}
                    <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={navigationItem.icon} />
                    </svg>
                    {navigationItem.label}
                  </a>
                );
              })}
            </nav>
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}
