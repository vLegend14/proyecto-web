# GIT -> flujo basico para empezar a trabajar

**que es esto?**
- los pasos para bajar el proyecto, instalarlo y empezar

---

# 1. DESCARGAR EL PROYECTO

solo la primera vez:

```bash
git clone https://github.com/tu-usuario/nombre-del-proyecto.git
cd nombre-del-proyecto
```

---

# 2. INSTALAR LAS DEPENDENCIAS

```bash
npm install
```

si ves la carpeta `node_modules/`, ya esta listo.

---

# 3. LEVANTAR EL SERVIDOR LOCAL

```bash
npm run dev
```

abre `http://localhost:4321` en tu navegador. el proyecto se actualiza solo cuando guardas cambios.

---

# 4. ESTRUCTURA DEL PROYECTO

```
src/
├── layouts/
│   └── BaseLayout.astro    # plantilla base: importa estilos, header y footer
├── pages/                  # aca iran todas las paginas de la web
│   └── index.astro         # pagina principal
├── components/
│   ├── Header.astro        # barra superior con logo y navegacion
│   └── Footer.astro        # pie de pagina
└── styles/
    └── global.css          # estilos globales, importa tailwind
public/                     # imagenes, fuentes, archivos estaticos
```

---

# 5. CICLO DIARIO

```bash
git checkout main
git pull origin main
git checkout -b nombre-de-tu-tarea
# trabajas, editas codigo...
git add .
git commit -m "que hiciste"
git push origin nombre-de-tu-tarea
```

---

# IMPORTANTE

- **nunca trabajes en `main`** — crea tu rama con `git checkout -b`
- **siempre haz `git pull` antes de empezar**
- **usa `git status` ante cualquier duda** — te dice en que rama estas y que archivos tienen cambios
