# PLAN DE DESARROLLO - Especialista en Requerimientos v2

## Visión del Producto
Crear un asistente web interactivo que guíe a los usuarios en la elaboración de documentos de requerimiento (TDR, EETT) de forma estandarizada y a prueba de errores. El sistema funcionará como un wizard condicional, presentando campos y opciones predefinidas basadas en selecciones iniciales del usuario (como tipo y cuantía de la contratación), utilizando plantillas base en formato Markdown.

---

## Fichas de Tarea

### **Ficha #0.0: Configuración Inicial del Proyecto Web**

*   **Estado:** `Completado`
*   **Objetivo:** Establecer la estructura básica de un proyecto web en la raíz del proyecto `Especialista_requerimientos`.
*   **Herramientas:** HTML, CSS, JavaScript.
*   **Flujo Principal ("Camino Feliz"):**
    1.  Crear `index.html` con una estructura HTML5 mínima (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`).
    2.  Vincular un nuevo archivo `styles.css` dentro del `<head>`.
    3.  Vincular un nuevo archivo `app.js` (diferente al `wizard.js` o `ia-manager.js` del plan archivado) al final del `<body>`.
    4.  Agregar un título básico a la página (ej: "Asistente de Requerimientos").
*   **Análisis de Variables, Casos de Borde y Errores:**
    *   **Archivos no encontrados:** Asegurar que `styles.css` y `app.js` se crean y se enlazan correctamente para evitar errores en la consola del navegador.
*   **Resultado Esperado:** Un navegador puede abrir `index.html` y mostrar una página vacía o con un título básico, confirmando que los archivos `styles.css` y `app.js` están correctamente enlazados y sin errores en la consola.

---

### **Ficha #1.0: Motor de Condiciones Iniciales**

*   **Estado:** `Completado`
*   **Objetivo:** Crear una interfaz inicial donde el usuario selecciona los criterios primarios que definen el tipo de requerimiento a generar.
*   **Herramientas:** HTML, CSS, `app.js`.
*   **Flujo Principal ("Camino Feliz"):**
    1.  El sistema muestra al usuario un formulario inicial simple.
    2.  El formulario contiene:
        *   Un grupo de opciones para "Tipo de Contratación": (o) Bien (o) Servicio.
        *   Un campo numérico para "Monto Estimado en S/.".
    3.  El usuario selecciona "Servicio" e ingresa un monto (ej: 50000).
    4.  El usuario hace clic en un botón "Siguiente" o "Generar".
    5.  El sistema evalúa las condiciones. Al ser "Servicio" y monto > 42,800 (8 UIT), determina internamente que debe usar la plantilla `PS 04.01.01 FORM 01_Términos de Referencia Servicios Generales.md` para el siguiente paso.
*   **Análisis de Variables, Casos de Borde y Errores:**
    *   **Datos incompletos:** Si el usuario no selecciona "Tipo" o no ingresa "Monto" y hace clic en "Siguiente", el sistema debe resaltar los campos faltantes con un mensaje como "Por favor, complete todos los campos para continuar". No debe avanzar.
    *   **Datos inválidos:** Si el usuario ingresa texto o un número negativo en "Monto", el sistema debe mostrar un mensaje de error "Por favor, ingrese un monto válido" junto al campo y no avanzar.
*   **Resultado Esperado:** El sistema tiene en memoria la decisión de qué plantilla usar y está listo para cargar el asistente principal con las fichas correspondientes a esa plantilla.

---

### **Ficha #2.0: Constructor Interactivo de TDR para Servicios Generales**

*   **Estado:** `Completado`
*   **Objetivo:** Generar el formulario interactivo completo para la plantilla `PS 04.01.01 FORM 01_Términos de Referencia Servicios Generales.md`, permitiendo al usuario rellenar todas sus secciones de forma guiada y dinámica. La IA revisará el documento completo al finalizar.
*   **Herramientas:** HTML, CSS, `app.js`, `data/metas-entidad.json` (o Supabase si se implementa).
*   **Sub-tareas:**
    *   **2.1: Carga y Procesamiento de la Plantilla:**
        *   **Estado:** `Completado`
        *   **Objetivo:** Leer el contenido de `data/PS 04.01.01 FORM 01_Términos de Referencia Servicios Generales.md` y parsearlo para identificar las 18 secciones y sus requisitos de control.
        *   **Acción:** Implementar una función en `app.js` que pueda cargar y dividir la plantilla en una estructura de datos manejable (ej. un array de objetos, cada uno representando una sección).
        *   **Resultado Esperado:** Una estructura de datos en JavaScript que contenga el título de cada sección y sus instrucciones para generar los campos del formulario.
    *   **2.2: Generación Dinámica del Formulario (Estructura General):**
        *   **Estado:** `Completado`
        *   **Objetivo:** Crear dinámicamente la estructura HTML del formulario completo basándose en la estructura de datos de la plantilla, pero sin los datos dinámicos aún.
        *   **Acción:** Implementar una función que reciba la estructura de datos de la plantilla y genere el HTML correspondiente para los `div` contenedores, títulos de sección, etc.
        *   **Resultado Esperado:** Un formulario vacío con todas las secciones de la plantilla visibles y etiquetadas, listo para recibir los campos de control.
    *   **2.3: Implementación de la Lógica de "Meta Presupuestaria" y "Actividad del POI":**
        *   **Estado:** `Completado`
        *   **Objetivo:** Cargar datos de metas y actividades, y poblar los campos `select` de "Meta Presupuestaria" y "Actividad del POI", incluyendo la lógica de dependencia.
        *   **Acción:**
            1.  Crear el archivo `data/metas-entidad.json` con datos de ejemplo.
            2.  Implementar la lógica en `app.js` para leer `metas-entidad.json`.
            3.  Poblar el `select` de "Meta Presupuestaria".
            4.  Implementar el evento `change` para "Meta Presupuestaria" que actualice la "Unidad de Organización" y filtre/cargue las "Actividades del POI".
        *   **Resultado Esperado:** Los campos "Meta Presupuestaria", "Unidad de Organización" y "Actividad del POI" funcionan dinámicamente.
    *   **2.4: Implementación de Controles Interactivos Restantes:**
        *   **Estado:** `Completado`
        *   **Objetivo:** Generar los campos de formulario restantes para cada sección de la plantilla según el "Tipo de Control Sugerido" (áreas de texto, radio buttons, interfaces dinámicas para entregables/penalidades, etc.).
        *   **Acción:** Extender la función de generación de formulario para crear los tipos de input específicos para cada sección.
        *   **Resultado Esperado:** Un formulario completamente interactivo, donde el usuario puede rellenar todas las secciones.
    *   **2.5: Integración de Botón "Revisar con IA":**
        *   **Estado:** `Completado`

*   **Estado:** `Completado`
        *   **Objetivo:** Crear un botón que, al ser clickeado, recolecte todo el contenido del formulario para prepararlo para la revisión de la IA (futura implementación).
        *   **Acción:** Implementar un evento `click` que capture los valores de todos los campos del formulario y los consolide en un objeto o string.
        *   **Resultado Esperado:** Un mecanismo para obtener los datos finales del TDR rellenado por el usuario.

*   **Flujo Principal ("Camino Feliz"):**
    1.  Después de pasar la Ficha #0, el sistema carga una única vista que presenta todos los campos interactivos correspondientes a las 18 secciones del `Formato 01: Términos De Referencia para la Contratación de Servicios en General`.
    2.  **Datos Generales (Parte superior de la plantilla):**
        *   **Meta Presupuestaria:** Campo `select` (dropdown) poblado con datos de `data/metas-entidad.json` (o Supabase).
            *   *Acción:* Al seleccionar una "Meta", el campo "Unidad de Organización" se autocompleta, y un nuevo `select` para "Actividad del POI" se carga dinámicamente, mostrando solo las actividades asociadas a la meta seleccionada. El usuario puede seleccionar una o varias actividades.
        *   **Unidad de Organización:** Campo de texto (`input`) que se autocompleta al seleccionar la "Meta Presupuestaria", pero es editable.
        *   **Actividad del POI:** Campo `select` (dropdown múltiple) que se carga dinámicamente.
        *   **Denominación de la Contratación:** Campo de texto (`input`).
    3.  **Secciones 1 a 18 (Cuerpo del TDR):**
        *   **Finalidad Pública, Antecedentes, Objetivo General/Específico, Alcance y Descripción del Servicio:** Campos de área de texto (`textarea`) de tamaño ajustable para permitir la redacción libre.
        *   **Requisitos del Proveedor y/o Personal:** Área de texto con la estructura de sub-secciones para guiar la redacción.
        *   **Perfeccionamiento:** Grupo de radio buttons con opciones predefinidas como "Se perfecciona con la notificación de la orden de servicio vía Pladicop" o "Con la suscripción de un contrato", y una opción "Otro (especifique)".
        *   **Lugar y Plazo de Ejecución:**
            *   **Lugar:** Campo de texto (`input`).
            *   **Plazo:** Grupo de radio buttons con opciones predefinidas (como las que mencionaste: "El servicio inicia a partir del día siguiente de notificada la orden de servicio", etc.) y un campo de texto adicional para una opción personalizada.
        *   **Resultados Esperados-Entregables:** Interfaz dinámica para añadir, editar y eliminar entregables. Cada entregable tendrá al menos un campo de descripción y un campo para el plazo.
        *   **Conformidad, Forma y Condiciones de Pago, Confidencialidad, Penalidades, Otras Penalidades, Resolución del Contrato, Cláusula Garantías, Cláusula Gestión de Riesgos, Cláusula Anticorrupción y Antisoborno, Cláusula Solución de Controversias:** Se presentarán como combinaciones de checkboxes (para incluir/excluir la cláusula estándar), campos de texto pre-llenados editables o grupos de opciones, según la complejidad de cada sección.
    4.  Botón "Revisar con IA" que toma todo el contenido generado.
*   **Análisis de Variables, Casos de Borde y Errores:**
    *   **Datos de "Meta" no encontrados:** Si `data/metas-entidad.json` está vacío o no contiene la meta, los campos dependientes deben permanecer vacíos o mostrar un mensaje de error.
    *   **Validación de campos:** Campos obligatorios deben ser validados antes de permitir la revisión o generación final.
    *   **Contenido mínimo:** La IA debe poder identificar si secciones clave tienen contenido insuficiente.
*   **Resultado Esperado:** Un formulario completo e interactivo que permite al usuario generar un TDR detallado, con campos dinámicos y opciones predefinidas para agilizar la redacción. El sistema estará listo para enviar el documento completo a la IA para revisión.

| Sección Plantilla | Ficha en el Asistente | Tipo de Control Sugerido | Detalles de Interacción / Dependencia |
| :--- | :--- | :--- | :--- |
| **Encabezado (Datos Generales)** | | | |
| Unidad de Organización | Campo de Texto | Input de texto | Se autocompleta al seleccionar "Meta Presupuestaria"; editable. |
| Meta Presupuestaria | Selección | Dropdown (`select`) | Poblado desde `data/metas-entidad.json` (o Supabase). |
| Actividad del POI | Selección Múltiple | Dropdown (`select multiple`) | Filtrado dinámicamente por la "Meta Presupuestaria" seleccionada. |
| Denominación de la Contratación | Campo de Texto | Input de texto | Edición libre. |
| **1. Finalidad Pública** | Campo de Texto Largo | `textarea` | Edición libre. |
| **2. Antecedentes** | Campo de Texto Largo | `textarea` | Edición libre. |
| **3. Objetivo** | | | |
| 3.1 Objetivo General | Campo de Texto Largo | `textarea` | Edición libre. |
| 3.2 Objetivo Específico | Campo de Texto Largo | `textarea` | Edición libre. |
| **4. Alcance y Descripción del Servicio** | | | |
| 4.1. Actividades | Campo de Texto Largo | `textarea` | Edición libre. |
| 4.2 Procedimiento | Campo de Texto Largo | `textarea` | Edición libre. |
| 4.3 Plan de trabajo | Campo de Texto Largo | `textarea` | Edición libre; checkbox opcional para requerirlo. |
| 4.4 Recursos provistos por proveedor | Campo de Texto Largo | `textarea` | Edición libre; checkbox para incluir/excluir sección. |
| 4.5 Reglamentos técnicos, normas metrológicas y/o sanitarias | Campo de Texto Largo | `textarea` | Edición libre; checkbox para incluir/excluir sección. |
| 4.6 Normas técnicas | Campo de Texto Largo | `textarea` | Edición libre; checkbox para incluir/excluir sección. |
| 4.7 Seguros | Campo de Texto Largo | `textarea` | Edición libre; checkbox para incluir/excluir sección. |
| 4.8 Prestaciones accesorias | Campo de Texto Largo | `textarea` | Edición libre; checkbox para incluir/excluir sección. |
| **5. Requisitos del Proveedor y/o Personal** | Campo de Texto Largo | `textarea` | Edición libre; con guía de contenido. |
| **6. Perfeccionamiento** | Selección de Opción | Radio Buttons | Opciones predefinidas + opción "Otro (especifique)". |
| **7. Lugar y Plazo de Ejecución** | | | |
| Lugar | Campo de Texto | `input` | Edición libre. |
| Plazo | Selección de Opción | Radio Buttons | Opciones predefinidas (ej: "Día siguiente", "Suscripción de acta") + opción "Personalizado (especifique)". |
| **8. Resultados Esperados-Entregables** | Interfaz Dinámica | Botones "Añadir Entregable", "Editar", "Eliminar" | Cada entregable con al menos "Descripción" (`textarea`) y "Plazo" (`input`). |
| **9. Conformidad** | Campos Mixtos | Input de texto, Dropdown, Textarea | Campo "Área que otorga"; Selección de "7 o 20 días"; Textarea para observaciones. |
| **10. Forma y Condiciones de Pago** | Campos Mixtos | Selección de Opción, Inputs de texto | Selección de "Moneda"; Detalle de pago (único/parcial) con opciones predefinidas + personalizado. Lista de documentación requerida. |
| **11. Confidencialidad** | Checkbox y Texto Largo | Checkbox + `textarea` | Checkbox para activar/desactivar la cláusula. `textarea` para editar el texto si está activa. |
| **12. Penalidades (Mora)** | Checkbox | Checkbox | Marcado por defecto. Texto de la cláusula estándar es fijo, pero con valores calculados dinámicamente si es posible. |
| **13. Otras Penalidades** | Interfaz Dinámica | Botones "Añadir Penalidad", "Editar", "Eliminar" | Cada penalidad con "Situación", "Procedimiento", "Monto/Porcentaje" (inputs). |
| **14. Resolución del Contrato** | Checkbox | Checkbox | Marcado por defecto. Texto de la cláusula estándar fijo. |
| **15. Cláusula Garantías** | Checkbox y Texto Largo | Checkbox + `textarea` | Desmarcado por defecto. Si se activa, texto editable. |
| **16. Cláusula Gestión de Riesgos** | Checkbox | Checkbox | Marcado por defecto. Texto de la cláusula estándar fijo. |
| **17. Cláusula Anticorrupción y Antisoborno** | Checkbox | Checkbox | Marcado por defecto. Texto de la cláusula estándar fijo. |
| **18. Cláusula Solución de Controversias** | Checkbox | Checkbox | Marcado por defecto. Texto de la cláusula estándar fijo. |


