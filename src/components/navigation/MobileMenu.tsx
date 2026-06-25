import { useState, useEffect } from "react";
import { navItems } from "../../data/navigation";

export default function MobileMenu({ currentPath }: { currentPath: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        class="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300 lg:hidden active:scale-95"
        aria-label="Abrir menú"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div
        class={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: open ? 1 : 0 }}
          onClick={() => setOpen(false)}
        />
        <aside
          class="relative flex w-64 flex-col border-r border-slate-800/60 bg-surface transition-all duration-300"
          style={{
            transform: open ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          <div class="flex h-14 items-center justify-between border-b border-slate-800/60 pl-5 pr-4">
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/20">
                <svg class="h-[18px] w-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="leading-tight">
                <span class="text-sm font-bold tracking-tight text-white">PYME Finance</span>
                <p class="text-[10px] text-slate-500">Panel de indicadores</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300 active:scale-95"
              aria-label="Cerrar menú"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav class="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-4">
            {navItems.map((item, i) => {
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  class={`group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                  }`}
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "translateX(0)" : "translateX(-12px)",
                    transition: "all 0.3s ease-out",
                    transitionDelay: open ? `${100 + i * 40}ms` : "0ms",
                  }}
                >
                  {isActive && (
                    <span class="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-emerald-500" />
                  )}
                  <svg class="h-[18px] w-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div class="border-t border-slate-800/60 px-3 py-3">
            <div class="rounded-lg bg-slate-800/20 px-3 py-2.5">
              <div class="flex items-center gap-2.5">
                <span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" style={{ animation: "pulse-dot 2s infinite" }} />
                </span>
                <div class="text-[11px] leading-tight">
                  <p class="font-medium text-slate-400">Sistema operativo</p>
                  <p class="text-emerald-400">100%</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
