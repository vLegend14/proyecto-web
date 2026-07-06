# PYME Finance — Dashboard Financiero

Dashboard de indicadores económicos chilenos que consume la API pública de [mindicador.cl](https://mindicador.cl).

## Tecnologías

- Astro 6
- React 19
- Tailwind CSS 4
- TypeScript

## Requisitos

- Node.js >= 22.12.0

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # servidor local en localhost:4321
npm run build    # build producción → dist/
npm run preview  # preview del build
```

## API

Usamos [mindicador.cl](https://mindicador.cl), una API pública chilena que entrega valores de UF, UTM, Dólar, Euro, IPC, IMACEC y otros indicadores económicos. No requiere autenticación.

## Páginas

- **Dashboard** — KPIs en tiempo real (UF, UTM, Dólar, Euro), resumen del mercado y alertas
- **Filtrado de Datos** — Consulta valores por indicador y año, con Spotlight Search (Ctrl+K)
- **Pronóstico de Mercado** — Proyección UF con regresión lineal, simulador de estrés y validación de fuente
- **API Info** — Documentación técnica de los endpoints
- **Dev Team** — Equipo de desarrollo

## Estructura

```
src/
├── api/          # Cliente HTTP (fetch con retry, timeout)
├── components/   # Componentes UI, widgets, charts, navegación
├── hooks/        # Hooks React (useCurrentValues, useDashboardData, useForecast, useHistoricalSearch)
├── layouts/      # Layout base con sidebar, header y footer
├── pages/        # Rutas del sitio
├── services/     # Capa de servicio para mindicador.cl
├── styles/       # Estilos globales (Tailwind)
├── types/        # Tipos TypeScript
└── utils/        # Utilidades (formateo, regresión lineal, logging)
```