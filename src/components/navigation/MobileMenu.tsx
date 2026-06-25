import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Inicio", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/busqueda-historica/", label: "Búsqueda Histórica", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { href: "/pronostico-mercado/", label: "Pronóstico de Mercado", icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" },
  { href: "/api-info/", label: "API Info", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  { href: "/dev-team/", label: "Dev Team", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" },
];

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
        class="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800/80 hover:text-white lg:hidden transition-colors"
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
          class="relative flex w-64 flex-col border-r border-neutral-800 bg-surface transition-all duration-300"
          style={{
            transform: open ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          <div class="flex h-16 items-center justify-between border-b border-neutral-800 pl-6 pr-4">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20">
                <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span class="text-base font-bold text-white">PYME Finance</span>
                <p class="text-[10px] text-neutral-500">Panel de indicadores</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              class="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
              aria-label="Cerrar menú"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-5">
            {navItems.map((item, i) => {
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  class={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
                  }`}
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "translateX(0)" : "translateX(-12px)",
                    transition: "all 0.3s ease-out",
                    transitionDelay: open ? `${100 + i * 40}ms` : "0ms",
                  }}
                >
                  {isActive && (
                    <span class="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div class="border-t border-neutral-800 px-3 py-4">
            <div class="flex items-center gap-3 rounded-lg bg-neutral-800/30 px-3 py-2.5">
              <div class="relative flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                <div class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div class="text-xs">
                <p class="text-neutral-400">Sistema operativo</p>
                <p class="text-emerald-400">100%</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
