# GIT -> control de versiones para nuestro proyecto web

**que es git?**
- es una herramienta que nos permite guardar el historial de cambios de nuestro codigo.
- nos permite trabajar en equipo sin que uno pise el codigo del otro.
- es nuestro "respaldo" si algo sale mal.

---

# 1. CONFIGURACION INICIAL (PREPARAR EL ENTORNO)

antes de empezar, git debe saber quien eres para registrar tus cambios
ejecuta estos comandos en tu terminal:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu_email@ejemplo.com"  # usa el mismo de tu cuenta de GitHub
```

**instalacion:**
- linux: `sudo pacman -S git` (o apt/dnf segun tu distro)
- windows/mac: descargar desde la web oficial de git

---

# 2. PRIMEROS PASOS (SOLO LA PRIMERA VEZ)

### descargar el repositorio

```bash
git clone https://github.com/tu-usuario/nombre-del-proyecto.git
# esto crea una carpeta con todo el proyecto en tu computadora
# desde ahi trabajas, entrando a esa carpeta con "cd nombre-del-proyecto"
```

### autenticacion en github

cuando hagas `git push` te pedira usuario y contraseña. **no uses tu contraseña normal**, github ahora pide un token:

1. ve a GitHub -> Settings -> Developer settings -> Personal access tokens -> Tokens (classic)
2. genera uno marcando los permisos **repo** y **workflow**
3. copialo y guardalo, lo usaras como contraseña cuando lo pida

> si usas ssh en vez de https no necesitas token cada vez, pero para empezar con https es mas simple.

---

# 3. CICLO DE TRABAJO DIARIO (FLUJO DEL EQUIPO)

para no romper el proyecto, seguiremos este protocolo diario:

### 1. sincronizar:
```bash
git checkout main          # cambia a la rama principal del proyecto
git pull origin main       # descarga y fusiona los cambios remotos en tu main local
```

> **importante:** siempre haz `git pull` antes de empezar. si tu compañero subio cambios, los necesitas para no trabajar sobre una version vieja.

### 2. trabajar:
```bash
git checkout -b nombre-de-tu-tarea          # crea y salta a una nueva rama para tu tarea
# escribes tu codigo, pruebas que funcione...
git status                 # (opcional) muestra que archivos modificaste
```

> `git status` es tu mejor amigo: te dice en que rama estas y que archivos tienen cambios. usalo cuando tengas dudas.

### 3. entregar:
```bash
git add .                                       # prepara todos los archivos modificados para el commit
git commit -m "descripción detallada de lo que hiciste"  # guarda los cambios en el historial con un mensaje
git push origin nombre-de-tu-tarea              # sube tu rama al repositorio remoto (GitHub)
```

> el mensaje del commit debe explicar **que** hiciste, no "avance" o "cambios". ej: "agregue validacion del formulario de registro".

---

# 4. PROTOCOLO DE REVISION Y ERRORES (ROL DEL LIDER)

el lider es el encargado de verificar que el codigo sea funcional antes de unirlo a la rama `main`:

### 1. probar codigo ajeno:
```bash
git fetch origin                                # descarga los cambios del servidor sin mezclarlos
git checkout tarea-de-compañero         # cambia a la rama del compañero para probarla
# ejecutas el proyecto localmente y buscas errores
```

### 2. unificar (merge):
```bash
# si todo esta bien:
git checkout main                               # vuelve a la rama principal
git merge --no-ff tarea-de-compañero    # --no-ff fuerza un commit de merge aunque sea fast-forward
git push origin main                            # sube los cambios fusionados al repositorio remoto
git branch -d tarea-de-compañero        # elimina la rama local
git push origin --delete tarea-de-compañero  # elimina la rama remota
# si hubo errores, el compañero debe corregirlos en su rama y hacer push de nuevo
```

---

# 5. ERRORES COMUNES Y CONSEJOS

### conflicto de merge

si al hacer `git pull` o `git merge` aparece **CONFLICT**, significa que dos personas modificaron la misma linea del mismo archivo.

git mete esas marcas `<<<<<<<` y `>>>>>>>` **dentro del archivo** para que veas el problema. en vscode se vera asi:

```py
nombre = "Jose"
<<<<<<< HEAD
edad = 20      ← esto era lo que estaba en tu codigo local
=======
edad = 21      ← esto es lo que traia la otra rama
>>>>>>> nombre-de-la-rama-que-tiene-conflicto
```

**que hacer:**
1. abre el archivo (vscode te lo marca en rojo)
2. decide que linea dejar: edad = 20 o edad = 21 (o combinarlas)
3. borra todo lo que sobre y **borra las marcas** `<<<<<<<`, `=======`, `>>>>>>>`
4. guarda y ejecuta:

```bash
git add .
git commit -m "resuelto conflicto en [nombre del archivo]"
```

> los conflictos suenan feo pero son normales. si te pasa, avisa al lider. no vas a romper nada.

### reglas de oro

- **nunca trabajes en `main`** — siempre crea tu rama con `git checkout -b`
- **haz `git pull origin main` antes de crear tu rama** — partes de la version mas actual
- **usa `git status` ante cualquier duda** — te dice en que rama estas y que archivos cambiaste
- **si te falla el push por "authentication"** — usa el token, no tu contraseña de github

### como nombrar tu rama

nombrala con guiones, sin espacios, sin acentos. que se entienda que hiciste:

| bien | mal |
|------|-----|
| `login` | `mejoras` |
| `arreglar-boton` | `mi-codigo` |
| `conexion-base-datos` | `cambios` |