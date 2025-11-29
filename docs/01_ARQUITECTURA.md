# ARQUITECTURA - Especialista de Requerimientos v2

**Proyecto:** Especialista de Requerimientos
**Versión:** 0.2.0
**Última actualización:** 2025-01-28

---

## 🏗️ VISIÓN GENERAL

### Descripción de alto nivel
Sistema web de página única (SPA) que guía al usuario en la creación de Términos de Referencia mediante un formulario dinámico generado desde plantillas markdown.

### Patrón arquitectónico
**MVC simplificado sin framework:**
- **Model:** JSON (metas-entidad.json, sessionStorage)
- **View:** HTML dinámico generado por JavaScript
- **Controller:** app.js (lógica de negocio)

---

## 📊 DIAGRAMA DE FLUJO PRINCIPAL

```
┌─────────────────────────────────────────────────────────────────┐
│                      INICIO (index.html)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Formulario Inicial   │
              │ - Tipo: Servicio     │
              │ - Monto: [input]     │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Validar Condiciones  │
              │ ¿Servicio <= 8 UIT?  │
              └──────────┬───────────┘
                         │
                    ┌────┴────┐
                    │  SÍ     │  NO → Mensaje error
                    ▼         │
        ┌───────────────────────────────┐
        │ loadAndParseTemplate()        │
        │ - Fetch markdown              │
        │ - Parse secciones             │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │ renderInteractiveForm()       │
        │ - Generar HTML dinámico       │
        │ - Cargar metas desde JSON     │
        │ - Crear campos interactivos   │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │    FORMULARIO COMPLETO        │
        │  (18 secciones editables)     │
        └───────────┬───────────────────┘
                    │
        ┌───────────┴────────────┬──────────────┐
        ▼                        ▼              ▼
   ┌─────────┐          ┌──────────────┐  ┌──────────┐
   │  VISTA  │          │    GUARDAR   │  │ REVISAR  │
   │ PREVIA  │          │     JSON     │  │   IA     │
   └────┬────┘          └──────────────┘  └──────────┘
        │                                  (Futuro)
        ▼
┌────────────────────────┐
│  vista_previa.html     │
│  - Leer sessionStorage │
│  - Generar documento   │
│  - Imprimir/PDF        │
└────────┬───────────────┘
         │
    ┌────┴─────┐
    │  VOLVER  │
    ▼          │
┌───────────────────────┐
│ Restaurar formulario  │
│ desde sessionStorage  │
└───────────────────────┘
```

---

## 🗂️ ESTRUCTURA DE DATOS

### Base de datos de Metas (metas-entidad.json)

```json
[
  {
    "id": "0012",                    // ID único de la meta
    "nombre": "0012 - Gestión...",   // Nombre descriptivo
    "unidad": "Unidad de...",        // Unidad organizacional
    "actividades": [                 // Array de actividades
      {
        "id": "AO_01",               // ID de actividad
        "nombre": "AO 01 - ..."      // Descripción actividad
      }
    ]
  }
]
```

**Relaciones:**
```
Meta (1) ──────── (1) Unidad
  │
  └──── (N) Actividades
```

### Estructura de TDR guardado

```json
{
  "id": "TDR_2025-01-28T...",        // ID único generado
  "fecha_creacion": "ISO-8601",      // Timestamp creación
  "tipo": "Servicio",                // Tipo contratación
  "monto_estimado": 40000,           // Monto en soles
  "meta": "0012",                    // ID meta seleccionada
  "unidad": "Unidad de...",          // Nombre unidad
  "actividades": ["AO_01", "AO_04"], // IDs actividades
  "denominacion": "...",             // Nombre del servicio
  "secciones": {                     // Todos los campos
    "campo1": "valor1",
    "campo2": "valor2",
    ...
  },
  "estado": "borrador",              // Estado del documento
  "ultima_modificacion": "ISO-8601"  // Timestamp modificación
}
```

### SessionStorage (temporal)

```javascript
sessionStorage.setItem('tdr_datos_temporales', JSON.stringify({
  // Todos los campos del formulario
  metaPresupuestaria: "0012",
  unidadOrganizacion: "...",
  actividadPOI: ["AO_01", "AO_04"],
  // ... resto de campos
}));
```

**Ciclo de vida:**
1. Se guarda al hacer clic en "Vista Previa"
2. Se lee en vista_previa.html
3. Se lee al volver a index.html
4. Se limpia al cerrar navegador

---

## 🔧 COMPONENTES PRINCIPALES

### 1. Parser de Markdown (`loadAndParseTemplate`)

**Ubicación:** app.js líneas 159-259

**Entrada:**
```markdown
## 1. Finalidad Publica
**Instructivo:** Describir el interés...

### 3.1 Objetivo General
**Contenido:** Texto predefinido...
```

**Salida:**
```javascript
[
  {
    id: "1__finalidad_publica",
    title: "1. Finalidad Publica",
    content: "",
    instructivo: "Describir el interés...",
    subsecciones: []
  },
  {
    id: "3__objetivo_de_la_contratacion",
    title: "3. Objetivo de la Contratacion",
    subsecciones: [
      {
        title: "3.1 Objetivo General",
        content: "Texto predefinido...",
        instructivo: ""
      }
    ]
  }
]
```

**Algoritmo:**
1. Split markdown por líneas
2. Detectar secciones con `##`
3. Detectar subsecciones con `###`
4. Extraer instructivos (`**Instructivo:**`)
5. Extraer contenido predefinido (`**Contenido:**`)
6. Retornar array de objetos estructurados

**Puntos críticos:**
- ⚠️ Regex línea 176: `/^## /` - Detecta secciones principales
- ⚠️ Regex línea 194: `/^### /` - Detecta subsecciones
- ⚠️ Muy sensible al formato del markdown

---

### 2. Renderizador de Formulario (`renderInteractiveForm`)

**Ubicación:** app.js líneas 261-607

**Responsabilidades:**
1. Limpiar contenedor
2. Cargar datos de metas
3. Por cada sección:
   - Crear div contenedor
   - Generar controles según tipo
   - Configurar eventos
4. Agregar botones de acción

**Tipos de controles generados:**

| Sección | Tipo de control | Función helper |
|---------|----------------|----------------|
| Meta Presupuestaria | Select dropdown | `createSelectInput` |
| Unidad | Input readonly | `createTextInput` |
| Actividades POI | Select multiple | `createSelectInput` |
| Finalidad Pública | Textarea | `createTextInput` |
| Perfeccionamiento | Radio buttons | `createRadioGroup` |
| Confidencialidad | Checkbox + Textarea | `createCheckbox` |

**Lógica especial - Meta/Unidad/Actividades:**
```javascript
// Líneas 294-309
metaSelect.addEventListener('change', (event) => {
  const selectedMetaId = event.target.value;
  const selectedMeta = allMetasData.find(...);

  // Auto-completar unidad
  unidadInput.value = selectedMeta.unidad;

  // Cargar actividades dinámicamente
  actividadSelect.innerHTML = '';
  selectedMeta.actividades.forEach(act => {
    const option = document.createElement('option');
    option.value = act.id;
    option.textContent = act.nombre;
    actividadSelect.appendChild(option);
  });
});
```

---

### 3. Colector de Datos (`collectFormData`)

**Ubicación:** app.js líneas 516-537

**Función:** Recorre todos los elementos del formulario y construye objeto con datos

**Algoritmo:**
```javascript
for (const element of formElements) {
  if (element.name) {
    if (element.type === 'radio') {
      if (element.checked) formData[element.name] = element.value;
    } else if (element.type === 'checkbox') {
      formData[element.name] = element.checked;
    } else if (element.tagName === 'SELECT' && element.multiple) {
      formData[element.name] = Array.from(element.selectedOptions)
        .map(option => option.value);
    } else {
      formData[element.name] = element.value;
    }
  }
}
```

---

### 4. Generador de Vista Previa

**Ubicación:** vista_previa.html líneas 180-280

**Flujo:**
1. Leer `sessionStorage.getItem('tdr_datos_temporales')`
2. Parse JSON
3. Generar HTML formateado por sección
4. Renderizar en documento

**Estructura HTML generada:**
```html
<div class="datos-generales">
  <table>...</table>
</div>

<div class="seccion">
  <div class="seccion-titulo">1. Finalidad Pública</div>
  <div class="seccion-contenido">
    <p>[Contenido del usuario]</p>
  </div>
</div>
```

---

## 🔄 FLUJO DE DATOS

### Escenario 1: Usuario completa y guarda

```
Usuario → Formulario → collectFormData() → JSON → Download
```

### Escenario 2: Usuario ve vista previa

```
Usuario → Formulario → collectFormData() → sessionStorage
                                              ↓
                                        vista_previa.html
                                              ↓
                                        Renderizar HTML
```

### Escenario 3: Usuario vuelve de vista previa

```
vista_previa.html → Botón "Volver" → index.html
                                         ↓
                                   Detectar sessionStorage
                                         ↓
                              restaurarFormularioConDatos()
                                         ↓
                                  Rellenar formulario
```

---

## 🎨 ARQUITECTURA DE FRONTEND

### Separación de responsabilidades

```
index.html
├── Estructura HTML estática
└── Contenedor dinámico (#app-container)

app.js
├── Lógica de negocio
├── Manipulación del DOM
└── Gestión de eventos

styles.css
└── Presentación visual

vista_previa.html
└── Generación de documento (auto-contenido)
```

### Patrón de eventos

```javascript
// Evento principal: submit del formulario inicial
conditionsForm.addEventListener('submit', async (event) => {
  // Validar → Cargar plantilla → Renderizar
});

// Evento: cambio de meta
metaSelect.addEventListener('change', (event) => {
  // Actualizar unidad y actividades
});

// Evento: clic en Vista Previa
btnVistaPrevia.addEventListener('click', (event) => {
  // Guardar sessionStorage → Navegar
});

// Evento: clic en Guardar
btnGuardar.addEventListener('click', (event) => {
  // Generar JSON → Descargar
});
```

---

## 🔐 SEGURIDAD Y VALIDACIONES

### Validaciones actuales

**Formulario inicial:**
- ✅ Tipo de contratación obligatorio
- ✅ Monto > 0 obligatorio
- ✅ Monto <= 8 UIT para usar plantilla

**Formulario principal:**
- ⚠️ Sin validaciones (pendiente implementar)

### Datos sensibles

**NO hay datos sensibles actualmente:**
- Todo se guarda local (sessionStorage, descargas)
- No hay comunicación con servidor
- No hay autenticación

**Futuro (si se implementa):**
- API keys de Claude → Variables de entorno
- Datos de usuario → Encriptar en tránsito

---

## 📈 ESCALABILIDAD

### Limitaciones actuales

| Aspecto | Límite actual | Escalabilidad |
|---------|--------------|---------------|
| Plantillas | 1 hardcodeada | Media - requiere código |
| Metas | ~10 en JSON | Alta - solo agregar datos |
| TDRs guardados | Downloads locales | Baja - sin centralización |
| Usuarios | 1 (local) | N/A - no multi-usuario |

### Puntos de mejora para escalar

1. **Multiple plantillas:**
   - Crear carpeta `data/plantillas/`
   - Selector de plantilla en formulario inicial
   - Generalizador de parser

2. **Base de datos real:**
   - Migrar metas a Supabase
   - CRUD de TDRs
   - Historial de versiones

3. **Multi-usuario:**
   - Autenticación
   - Permisos por rol
   - Colaboración

---

## 🧪 PUNTOS DE PRUEBA

### Críticos (requieren testing riguroso)

1. **Parser de markdown** (app.js:159-259)
   - Probar con diferentes formatos
   - Validar manejo de errores

2. **Lógica Meta → Actividades** (app.js:294-309)
   - Verificar que siempre carga
   - Probar con meta sin actividades

3. **SessionStorage** (múltiples archivos)
   - Verificar persistencia
   - Probar navegación atrás/adelante
   - Validar limpieza al cerrar

### Casos de borde

- Usuario no completa campos → Guardar con valores vacíos (OK)
- Usuario navega sin sessionStorage → Redirige a inicio (OK)
- Meta sin actividades → Select vacío (Manejar)
- Archivo markdown corrupto → Error catch (OK)

---

## 🔮 ARQUITECTURA FUTURA

### Fase 2: Revisión con IA

```
┌──────────────┐
│  Formulario  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Revisar con IA  │ ← Claude API
└──────┬───────────┘
       │
       ▼
┌────────────────────────┐
│  Panel de Sugerencias  │
│  - Error X             │
│  - Mejorar redacción Y │
│  - Falta info en Z     │
└────────┬───────────────┘
       │
    ┌──┴──┐
    │ Usuario acepta/rechaza
    ▼
┌──────────────┐
│  Formulario  │ ← Actualizado
└──────────────┘
```

### Fase 3: Base de datos

```
Frontend (actual)
    ↓
Supabase (PostgreSQL)
    ├── Tabla: metas
    ├── Tabla: tdrs
    ├── Tabla: usuarios
    └── Tabla: versiones_tdr
```

---

**Última actualización:** 2025-01-28
**Mantenedor:** Juan Montenegro
