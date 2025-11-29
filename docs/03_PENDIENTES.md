# PENDIENTES - Especialista de Requerimientos v2

**Proyecto:** Especialista de Requerimientos
**Version:** 0.2.0
**Ultima actualizacion:** 2025-01-28

---

## 📋 COMO USAR ESTE ARCHIVO

Este archivo es el TODO list oficial del proyecto.

**Reglas:**
1. Mantener organizado por prioridad (P0 = critico, P1 = importante, P2 = deseado)
2. Actualizar al final de cada sesion
3. Marcar completados con `[x]` y fecha
4. NO borrar completados, moverlos a seccion de historial
5. Agregar contexto minimo a cada tarea

**Estados:**
- [ ] Pendiente
- [⏳] En progreso
- [x] Completado
- [❌] Cancelado/Bloqueado

---

## 🔥 PRIORIDAD 0 (Critico - Bloquea funcionalidad)

### Funcionalidad basica

- [x] **2025-01-28:** Parser de markdown funcional
- [x] **2025-01-28:** Formulario carga todas las 18 secciones
- [x] **2025-01-28:** Vista previa genera documento completo
- [x] **2025-01-28:** Guardar JSON con estructura correcta
- [x] **2025-01-28:** SessionStorage preserva datos al navegar

### Documentacion del proyecto

- [x] **2025-01-28:** Sistema de documentacion creado
- [x] **2025-01-28:** Archivo 00_CONTEXTO_PROYECTO.md
- [x] **2025-01-28:** Archivo 01_ARQUITECTURA.md
- [x] **2025-01-28:** Archivo 02_DECISIONES.md
- [x] **2025-01-28:** Archivo 03_PENDIENTES.md (este archivo)
- [x] **2025-01-28:** Archivo 04_SESIONES.md

---

## ⚡ PRIORIDAD 1 (Importante - Mejora significativa)

### Validaciones

- [ ] **Validar campos obligatorios antes de guardar**
  - Contexto: Actualmente se puede guardar formulario vacio
  - Accion: Identificar campos criticos y validar antes de permitir guardar
  - Estimacion: 1-2 horas
  - Archivos: app.js (antes de btnGuardar.click)

- [ ] **Validar campos obligatorios antes de vista previa**
  - Contexto: Vista previa puede mostrar documento incompleto
  - Accion: Validar campos minimos necesarios
  - Estimacion: 30 min
  - Archivos: app.js (antes de btnVistaPrevia.click)

- [ ] **Indicadores visuales de campos obligatorios**
  - Contexto: Usuario no sabe que campos son obligatorios
  - Accion: Agregar asterisco (*) rojo en etiquetas
  - Estimacion: 1 hora
  - Archivos: app.js (renderInteractiveForm), styles.css

### Vista previa

- [ ] **Agregar logo JNJ en vista previa**
  - Contexto: Documento debe tener imagen institucional
  - Accion: Agregar logo en header de vista_previa.html
  - Estimacion: 30 min
  - Archivos: vista_previa.html, CSS inline
  - Bloqueado: Necesita archivo de imagen del logo

- [ ] **Agregar watermark "BORRADOR" en vista previa**
  - Contexto: Distinguir documentos no finalizados
  - Accion: CSS con watermark diagonal
  - Estimacion: 30 min
  - Archivos: vista_previa.html (CSS)

- [ ] **Mejorar formato de tabla en vista previa**
  - Contexto: Tabla de datos generales podria verse mas profesional
  - Accion: Ajustar estilos de tabla, bordes, colores
  - Estimacion: 1 hora
  - Archivos: vista_previa.html (CSS)

### Datos y plantillas

- [ ] **Completar metas-entidad.json con todas las metas de JNJ**
  - Contexto: Actualmente solo tiene 3 metas de ejemplo
  - Accion: Obtener lista completa de metas y actividades
  - Estimacion: 2-3 horas (depende de fuente)
  - Archivos: data/metas-entidad.json
  - Bloqueado: Necesita acceso a sistema presupuestal

- [ ] **Crear plantilla para bienes (TDR_Bienes.md)**
  - Contexto: Actualmente solo existe plantilla para servicios
  - Accion: Crear markdown para terminos de referencia de bienes
  - Estimacion: 2 horas
  - Archivos: data/TDR_Bienes.md, actualizar app.js para selector

---

## 🎯 PRIORIDAD 2 (Deseado - Mejoras de calidad de vida)

### Funcionalidades nuevas

- [ ] **Cargar TDR guardado para editar**
  - Contexto: Usuario guarda JSON pero no puede volver a editarlo
  - Accion: Boton "Cargar TDR" que lee JSON y rellena formulario
  - Estimacion: 2-3 horas
  - Archivos: index.html (nuevo boton), app.js (funcion cargarTDR)

- [ ] **Auto-guardado en localStorage cada 5 minutos**
  - Contexto: Si navegador se cierra, datos se pierden
  - Accion: setInterval que guarda en localStorage
  - Estimacion: 1 hora
  - Archivos: app.js
  - Nota: Agregar boton "Recuperar borrador" al inicio

- [ ] **Historial de TDRs guardados**
  - Contexto: Usuario no tiene lista de TDRs creados
  - Accion: Pagina lista.html que muestra JSONs guardados
  - Estimacion: 3-4 horas
  - Archivos: lista.html (nuevo), app.js, requiere backend o localStorage

### Mejoras de UX

- [ ] **Tooltips explicativos en cada seccion**
  - Contexto: Algunos instructivos son largos
  - Accion: Agregar icono (i) con tooltip
  - Estimacion: 2 horas
  - Archivos: app.js (renderInteractiveForm), styles.css

- [ ] **Indicador de progreso (X de 18 secciones completadas)**
  - Contexto: Usuario no sabe cuanto falta
  - Accion: Barra de progreso en parte superior
  - Estimacion: 2 horas
  - Archivos: app.js, styles.css

- [ ] **Botones de navegacion entre secciones**
  - Contexto: Formulario muy largo, dificil navegar
  - Accion: Botones "Anterior/Siguiente seccion"
  - Estimacion: 2-3 horas
  - Archivos: app.js, styles.css

- [ ] **Modo oscuro**
  - Contexto: Trabajo nocturno mas comodo
  - Accion: Toggle para dark mode
  - Estimacion: 2 horas
  - Archivos: styles.css, app.js (guardar preferencia)

### Optimizaciones

- [ ] **Lazy loading de secciones**
  - Contexto: 18 secciones cargan todas de una vez
  - Accion: Cargar secciones bajo demanda
  - Estimacion: 3 horas
  - Archivos: app.js (refactor renderInteractiveForm)
  - Nota: Solo si performance se vuelve problema

- [ ] **Comprimir JSONs guardados**
  - Contexto: JSONs pueden ser pesados
  - Accion: Usar LZString o similar
  - Estimacion: 1 hora
  - Archivos: app.js
  - Nota: Baja prioridad, JSONs no son tan pesados

---

## 🤖 PRIORIDAD 3 (Futuro - Requiere integracion externa)

### Revision con IA

- [ ] **Configurar API de Claude**
  - Contexto: Boton "Revisar IA" esta deshabilitado
  - Accion: Obtener API key, configurar fetch
  - Estimacion: 1 hora
  - Archivos: app.js (nuevo modulo api.js)
  - Bloqueado: Requiere cuenta Anthropic y API key

- [ ] **Implementar prompt para revision de TDR**
  - Contexto: IA debe revisar contenido de TDR
  - Accion: Crear prompt optimizado, enviar secciones
  - Estimacion: 2-3 horas
  - Archivos: app.js o api.js
  - Dependencia: Configurar API primero

- [ ] **Panel de sugerencias de IA**
  - Contexto: Mostrar resultados de revision
  - Accion: Crear UI para mostrar sugerencias por seccion
  - Estimacion: 3-4 horas
  - Archivos: revision_ia.html (nuevo), app.js

### Base de datos real

- [ ] **Migrar a Supabase**
  - Contexto: JSON local no escala, no es multi-usuario
  - Accion: Crear proyecto Supabase, definir esquema
  - Estimacion: 4-6 horas
  - Archivos: Todos (refactor completo)
  - Nota: Solo si se necesita multi-usuario

- [ ] **Sistema de autenticacion**
  - Contexto: Si migramos a Supabase, necesitamos auth
  - Accion: Implementar login con Supabase Auth
  - Estimacion: 3-4 horas
  - Archivos: login.html (nuevo), app.js
  - Dependencia: Migracion a Supabase

- [ ] **Versionado de TDRs**
  - Contexto: Guardar historial de cambios
  - Accion: Tabla versiones en Supabase
  - Estimacion: 2 horas
  - Archivos: Backend/Supabase
  - Dependencia: Migracion a Supabase

---

## ❌ BLOQUEADOS / CANCELADOS

### Bloqueados

- [❌] **Integracion con SIAF** (Bloqueado)
  - Razon: Requiere acceso a sistema cerrado de MEF
  - Solucion alternativa: JSON local con metas manuales

- [❌] **Firma digital de documentos** (Bloqueado)
  - Razon: Requiere certificado digital y libreria especifica
  - Solucion alternativa: Exportar PDF y firmar externamente

### Cancelados

- [❌] **Version mobile** (Cancelado)
  - Razon: Usuario final trabaja en escritorio
  - Decision: No prioritario, responsive basico suficiente

---

## 📚 BACKLOG (Ideas sin priorizar)

- Exportar a Word (.docx) ademas de JSON
- Plantillas personalizables por usuario
- Comparador de versiones de TDR
- Sistema de comentarios/notas por seccion
- Integracion con SEACE (Sistema Electronico de Contrataciones)
- Chat con IA para asistencia durante llenado
- Templates de respuestas comunes
- Biblioteca de texto predefinido reutilizable
- Dashboard de estadisticas (TDRs creados, tiempo promedio, etc)
- Modo colaborativo (multiples usuarios editando)

---

## 📊 METRICAS

**Total de tareas:**
- Completadas: 11
- Prioridad 0: 0 pendientes
- Prioridad 1: 9 pendientes
- Prioridad 2: 8 pendientes
- Prioridad 3: 6 pendientes
- Bloqueadas: 2
- Canceladas: 1

**Estimacion de trabajo pendiente:**
- P1: ~15 horas
- P2: ~20 horas
- P3: ~15 horas
- **Total:** ~50 horas

---

## 🎯 PROXIMO SPRINT (Sugerencia)

**Sprint 1 (Proximas 2 sesiones):**
1. Validaciones de campos obligatorios
2. Indicadores visuales de campos requeridos
3. Mejorar formato de vista previa
4. Completar metas-entidad.json

**Criterio de exito:**
- Usuario no puede guardar TDR incompleto
- Vista previa se ve profesional
- Todas las metas de JNJ disponibles

---

**Ultima actualizacion:** 2025-01-28
**Actualizado por:** Claude (Anthropic)
