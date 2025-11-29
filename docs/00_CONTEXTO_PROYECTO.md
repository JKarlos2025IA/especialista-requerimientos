# PROYECTO: ESPECIALISTA DE REQUERIMIENTOS V2

> **INSTRUCCION PARA IAs:** Este es el archivo maestro del proyecto. Leelo COMPLETO antes de hacer cualquier cambio.

---

## 📌 LECTURA RAPIDA (30 segundos)

**Que hace:** Sistema web para generar Terminos de Referencia (TDR) de servicios de forma guiada e interactiva

**Estado actual:** Version 0.2.0 - Funcional (desarrollo activo)

**Ultima sesion:** 2025-01-28

**Siguiente paso:** Optimizacion de sistema de documentacion y mejoras en vista previa

**Nivel de complejidad:** Medio

---

## 🎯 CONTEXTO COMPLETO

### Proposito
Automatizar la creacion de Terminos de Referencia (TDR) para contrataciones de servicios en la Junta Nacional de Justicia (JNJ), reduciendo errores, estandarizando documentos y agilizando el proceso.

### Usuario final
Juan Montenegro - Especialista en requerimientos de la JNJ
- Necesita generar TDR frecuentemente
- Requiere cumplir normativa especifica (Ley 32069)
- Busca eficiencia y calidad en documentos

### Problema que resuelve
- **Antes:** TDR se creaban manualmente, propensos a errores, inconsistentes
- **Ahora:** Formulario guiado que asegura completitud y formato correcto
- **Futuro:** Revision automatica con IA para mejorar calidad

---

## 🛠️ TECNOLOGIAS Y STACK

**Lenguajes:**
- HTML5
- CSS3
- JavaScript vanilla (ES6+)
- Markdown (para plantillas)

**Frameworks:**
- Ninguno (vanilla JS por simplicidad)

**Base de datos:**
- JSON local (archivos .json)
- SessionStorage (datos temporales)
- Futuro: Supabase (contemplado)

**Entorno de desarrollo:**
- SO: Windows 64 bits
- Shell: CMD (NO PowerShell)
- Servidor: Python http.server (puerto 8000)
- Editor: [VS Code u otro]

**Dependencias externas:**
- Ninguna (sin npm, sin node_modules)
- Futuro: Claude API (para revision IA)

---

## 📋 ESTADO ACTUAL

### Funcionalidades completadas
- [x] Formulario inicial de condiciones (tipo/monto)
- [x] Carga dinamica de formulario desde markdown
- [x] Parser de markdown limpio y estructurado
- [x] Campos de meta presupuestaria con dependencias
- [x] Seleccion multiple de actividades POI
- [x] 18 secciones del TDR con campos apropiados
- [x] Vista previa con formato profesional
- [x] Impresion/PDF desde vista previa
- [x] Guardar JSON con datos completos
- [x] Preservacion de datos al navegar (sessionStorage)
- [x] Restauracion de formulario al volver de vista previa

### En desarrollo
- [ ] Sistema de documentacion del proyecto
- [ ] Mejoras en diseño de vista previa

### Pendiente (backlog)
- [ ] Revision con IA (requiere API de Claude)
- [ ] Cargar TDR guardado para editar
- [ ] Validaciones de campos obligatorios
- [ ] Opciones predefinidas en mas secciones
- [ ] Migracion a Supabase (opcional)
- [ ] Sistema de versiones de TDR

---

## ⚠️ REGLAS ESPECIFICAS DE ESTE PROYECTO

**CRITICAS (No negociables):**
1. NO usar emojis en codigo JavaScript (problemas UnicodeEncodeError en Windows CMD)
2. SIEMPRE usar CMD, NUNCA PowerShell
3. SIEMPRE probar en navegador despues de cambios
4. NO modificar parser de markdown (lineas 159-259 de app.js) sin probar exhaustivamente

**PREFERENCIAS:**
1. Codigo simple y legible sobre optimizacion prematura
2. Comentarios explicativos en zonas criticas
3. Documentar decisiones importantes en 02_DECISIONES.md
4. Salida en CMD preferible sobre interfaces web complejas

**PROHIBICIONES:**
1. NO usar frameworks pesados (React, Vue, etc)
2. NO agregar dependencias npm sin consultar
3. NO borrar archivos de data/ sin backup
4. NO cambiar estructura de metas-entidad.json sin actualizar codigo

---

## 🗺️ ARQUITECTURA

### Estructura de directorios
```
Especialista_requerimientos/
├── docs/                               ← Documentacion del proyecto
│   ├── 00_CONTEXTO_PROYECTO.md        ← Este archivo
│   ├── 01_ARQUITECTURA.md             ← Diagramas tecnicos
│   ├── 02_DECISIONES.md               ← Log de decisiones
│   ├── 03_PENDIENTES.md               ← TODO list
│   └── 04_SESIONES.md                 ← Registro diario
├── data/                               ← Datos y plantillas
│   ├── guardados/                     ← TDRs guardados (.json)
│   ├── metas-entidad.json             ← Base de datos de metas
│   └── TDR_Servicios_Generales.md     ← Plantilla markdown
├── plantillas/                         ← Templates HTML (futuro)
├── index.html                          ← Pagina principal
├── vista_previa.html                   ← Vista previa del TDR
├── app.js                              ← Motor principal de la aplicacion
├── styles.css                          ← Estilos CSS
├── iniciar_servidor.bat                ← Script para ejecutar
├── PLAN_DE_DESARROLLO.md               ← Plan original (referencia)
└── README.md                           ← Documentacion publica
```

### Flujo principal
```
1. Usuario abre index.html
2. Selecciona tipo (Servicio) y monto
3. Sistema carga plantilla markdown
4. Parser convierte markdown a estructura JSON
5. Renderiza formulario dinamico con todos los campos
6. Usuario completa campos
7. Opciones:
   a) Vista Previa → vista_previa.html (preserva datos)
   b) Guardar → Descarga JSON
   c) [Futuro] Revisar IA → Analisis y sugerencias
```

### Diagrama de datos
```
metas-entidad.json:
{
  id: "0012",
  nombre: "...",
  unidad: "...",       → Se autocompleta
  actividades: [       → Multiselect dinamico
    {id, nombre}
  ]
}
```

---

## 📂 MAPA DE ARCHIVOS CRITICOS

### `app.js` (680 lineas)
**Que hace:** Motor principal de la aplicacion

**Secciones importantes:**
- **Lineas 1-23:** Inicializacion y verificacion de sessionStorage
- **Lineas 26-138:** Helper functions para generar controles HTML
- **Lineas 142-156:** fetchMetasData() - Carga base de datos de metas
- **Lineas 159-259:** loadAndParseTemplate() - ⚠️ **PARSER DE MARKDOWN** (FRAGIL)
  - Parse de markdown con estructura especifica
  - Detecta secciones (##), subsecciones (###), instructivos
  - Cualquier cambio requiere prueba exhaustiva
- **Lineas 261-607:** renderInteractiveForm() - Genera formulario dinamico
  - Linea 275-309: Logica de meta/unidad/actividades (CRITICA)
  - Lineas 311-456: Renderizado de las 18 secciones
- **Lineas 461-514:** Creacion de 3 botones (Vista Previa, Guardar, Revisar IA)
- **Lineas 516-537:** collectFormData() - Recolecta datos del formulario
- **Lineas 539-549:** Vista Previa - Guarda en sessionStorage y navega
- **Lineas 551-588:** Guardar - Genera y descarga JSON
- **Lineas 609-651:** restaurarFormularioConDatos() - Restaura formulario desde sessionStorage

**Dependencias:**
- Requiere: data/metas-entidad.json, data/TDR_Servicios_Generales.md
- Usado por: index.html

### `vista_previa.html` (autocontenido)
**Que hace:** Genera vista previa formateada del TDR para impresion/PDF

**Estructura:**
- HTML con estilos CSS inline (para impresion)
- JavaScript inline que lee sessionStorage
- Funcion generarDocumento() renderiza todas las secciones
- Botones: Volver (preserva datos), Imprimir, Descargar JSON

**Puntos criticos:**
- Linea 180: Lectura de sessionStorage (falla si no hay datos)
- Lineas 200-250: Mapeo de campos del formulario a secciones del documento

### `data/TDR_Servicios_Generales.md`
**Que hace:** Plantilla maestra en formato markdown

**Estructura:**
```markdown
## DATOS_GENERALES
## 1. Finalidad Publica
### 3.1 Objetivo General
**Instructivo:** [Texto guia]
**Contenido:** [Texto predefinido]
```

**NO MODIFICAR sin actualizar parser en app.js:159-259**

### `data/metas-entidad.json`
**Que hace:** Base de datos de metas presupuestarias

**Estructura:**
```json
[
  {
    "id": "0012",
    "nombre": "0012 - Gestion de Abastecimiento...",
    "unidad": "Unidad de Abastecimiento...",
    "actividades": [
      {"id": "AO_01", "nombre": "AO 01 - ..."}
    ]
  }
]
```

**Agregar nuevas metas:** Seguir estructura exacta

---

## 🔧 CONFIGURACION

### Variables globales (app.js)
```javascript
UIT_ACTUAL_VALUE = 5350  // Valor UIT 2025
TDR_UMBRAL = 42800       // 8 UIT (umbral para TDR)
```

### SessionStorage keys
```javascript
'tdr_datos_temporales'  // Datos del formulario para vista previa
```

---

## 🚀 COMO EJECUTAR

### Instalacion inicial
```cmd
# No requiere instalacion
# Solo verificar que Python este instalado
python --version
```

### Ejecucion normal
```cmd
# Opcion 1: Ejecutar bat
cd C:\Users\juan.montenegro\Desktop\Especialista_requerimientos
iniciar_servidor.bat

# Opcion 2: Manual
cd C:\Users\juan.montenegro\Desktop\Especialista_requerimientos
python -m http.server 8000
# Abrir navegador: http://localhost:8000
```

### Testing
```
# Testing manual:
1. Completar formulario
2. Click "Vista Previa"
3. Verificar formato
4. Click "Volver"
5. Verificar que datos se preservaron
6. Click "Guardar"
7. Verificar JSON descargado
```

---

## 📝 HISTORIAL DE SESIONES

### 2025-01-28 (Tarde)
**Duracion:** 2 horas
**Objetivo:** Implementar vista previa, guardar y sistema de documentacion

**Completado:**
- Sistema de 3 botones (Vista Previa, Guardar, Revisar IA)
- Vista previa con formato profesional
- Boton imprimir/guardar PDF
- Guardar JSON con estructura completa
- Preservacion de datos con sessionStorage
- Restauracion automatica al volver de vista previa
- Creacion de sistema de documentacion del proyecto

**Problemas:**
- Ninguno significativo

**Soluciones:**
- N/A

**Pendiente:**
- Llenar archivos de documentacion restantes
- Optimizar vista previa (logos, watermarks)

---

### 2025-01-28 (Mañana)
**Duracion:** 3 horas
**Objetivo:** Lograr que formulario cargue completamente desde markdown

**Completado:**
- Conversion de PDF a markdown limpio
- Parser completamente reescrito (mas simple y robusto)
- Actualizacion de metas-entidad.json con datos realistas
- Renombrado de archivo de plantilla (eliminacion de tildes)
- Formulario carga todas las 18 secciones correctamente

**Problemas:**
- Archivo markdown original tenia formato inconsistente (tablas, backslashes)
- Parser anterior era demasiado complejo

**Soluciones:**
- Creado nuevo markdown desde PDF con estructura limpia
- Parser simplificado que detecta ##, ###, **Instructivo:**, **Contenido:**

**Pendiente:**
- Implementar vista previa
- Implementar guardar

---

## 🐛 PROBLEMAS CONOCIDOS

### Problema 1: Emojis en codigo causan UnicodeEncodeError
**Sintoma:** Error al ejecutar scripts Python o JavaScript con emojis en Windows CMD
**Causa:** Codificacion de CMD es limitada (cp437 o cp1252)
**Workaround:** NO usar emojis en codigo, solo en comentarios o strings si es necesario
**Solucion definitiva:** Usar solo ASCII en codigo

### Problema 2: Nombres de archivo con caracteres especiales
**Sintoma:** fetch() falla al cargar archivos con tildes o espacios mal codificados
**Causa:** URL encoding inconsistente en Windows
**Workaround:** Renombrar archivos sin tildes ni caracteres especiales
**Solucion definitiva:** Aplicada - todos los archivos sin tildes

---

## 💡 DECISIONES TECNICAS IMPORTANTES

> **Nota:** Para decisiones detalladas ver `02_DECISIONES.md`

### Decision 1: No usar frameworks JavaScript
**Fecha:** 2025-01-28
**Que se decidio:** Usar vanilla JavaScript sin React/Vue/Angular
**Por que:** Simplicidad, sin dependencias, facil de mantener, rapido de cargar
**Ver:** 02_DECISIONES.md#decision-1-no-frameworks

### Decision 2: Markdown como formato de plantilla
**Fecha:** 2025-01-28
**Que se decidio:** Usar markdown para definir estructura del TDR
**Por que:** Facil de editar, legible, versionable, parseble
**Ver:** 02_DECISIONES.md#decision-2-markdown-plantillas

### Decision 3: SessionStorage para preservar datos
**Fecha:** 2025-01-28
**Que se decidio:** Usar sessionStorage en vez de localStorage o cookies
**Por que:** Datos se limpian al cerrar navegador (mas seguro), simple de usar
**Ver:** 02_DECISIONES.md#decision-3-sessionstorage

---

## 🎓 RECURSOS Y REFERENCIAS

**Documentacion oficial:**
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript)
- [MDN - SessionStorage](https://developer.mozilla.org/es/docs/Web/API/Window/sessionStorage)

**Normativa:**
- Ley 32069 - Ley General de Contrataciones Publicas
- Decreto Supremo 009-2025-EF - Reglamento

**Referencias internas:**
- G:\Mi unidad\03_PROJECTS\0000_MEMORY\01_REGLAS_EFICIENCIA.md
- G:\Mi unidad\03_PROJECTS\0000_MEMORY\02_PROTOCOLO_PROYECTOS.md

---

## 📞 CONTACTO Y EQUIPO

**Desarrollador principal:** Juan Montenegro
**Stakeholders:** Unidad de Abastecimiento y Servicios Generales - JNJ
**Repositorio:** [Pendiente de crear en GitHub]

---

## 🔄 CONTROL DE VERSIONES

**Version actual:** 0.2.0
**Ultima actualizacion:** 2025-01-28 19:00
**Actualizado por:** Claude (Anthropic)

### Changelog
- **v0.2.0** (2025-01-28): Vista previa, guardar JSON, sistema de documentacion
- **v0.1.0** (2025-01-28): Formulario completo funcional, parser markdown, campos dinamicos
- **v0.0.1** (2025-01-27): Version inicial con formulario basico

---

## 📌 NOTAS PARA PROXIMA SESION

- [ ] Crear archivos 01_ARQUITECTURA.md, 02_DECISIONES.md, 03_PENDIENTES.md, 04_SESIONES.md
- [ ] Agregar validaciones antes de guardar (campos obligatorios)
- [ ] Mejorar diseño de vista previa (logo JNJ, watermark)
- [ ] Considerar implementar "Cargar TDR" para editar documentos guardados
- [ ] Investigar integracion con Claude API para revision IA

---

**Fin del archivo de contexto**
