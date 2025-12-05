# PLAN DE MEJORA DE EXPERIENCIA DE USUARIO (UX/UI)

## Problema Identificado
El usuario percibe el proyecto (la interfaz del formulario) como "pesado". Esto probablemente se debe a:
1.  **Sobrecarga Cognitiva:** Mostrar 18 secciones abiertas simultáneamente abruma al usuario.
2.  **Contraste Visual:** Los bloques negros sólidos pueden sentirse muy agresivos o "duros" visualmente.
3.  **Longitud:** El scroll infinito hace que la tarea parezca interminable.

## Estrategias de Solución Propuestas

### Opción A: Estilo "Acordeón" (Recomendada por simplicidad)
*   **Concepto:** Todas las secciones inician "colapsadas" (cerradas), mostrando solo el título.
*   **Interacción:** El usuario hace clic en un título para abrir esa sección.
*   **Ventaja:** Reduce drásticamente la longitud de la página. El usuario ve un índice limpio y ataca una sección a la vez.
*   **Implementación:** Rápida (CSS + pequeño script JS).

### Opción B: Modo "Wizard" (Paso a Paso)
*   **Concepto:** Dividir el formulario en pantallas o pestañas lógicas.
    *   *Paso 1: Datos Generales*
    *   *Paso 2: Definición del Servicio (Objetivos, Alcance)*
    *   *Paso 3: Ejecución (Lugar, Plazo, Entregables)*
    *   *Paso 4: Términos Legales (Penalidades, Cláusulas)*
*   **Ventaja:** Enfoca al usuario en tareas pequeñas. Se siente más ligero y guiado.
*   **Implementación:** Media (requiere lógica de navegación entre pasos).

### Opción C: Refinamiento Visual (Lite)
*   **Concepto:** Mantener todo abierto pero "suavizar" el diseño.
*   **Acciones:**
    *   Cambiar el fondo negro puro (`#212529`) por un gris azulado oscuro más suave o un diseño "card" con sombras suaves.
    *   Aumentar el espacio en blanco (padding/margin).
    *   Usar tipografía más ligera.
*   **Ventaja:** Mejora estética sin cambiar la funcionalidad.

## Recomendación Inmediata
Implementar la **Opción A (Acordeón)** junto con un **suavizado visual (Opción C)**. Esto ataca la sensación de "pesadez" estructural y visual simultáneamente sin requerir una reescritura masiva del código.

---
**¿Qué opinas? ¿Te gustaría probar primero el estilo "Acordeón" para limpiar la pantalla?**

## Estado Actual (2025-12-05)
Se ha implementado exitosamente el estilo **Acordeón** y el **Modo Oscuro**.
Se han añadido funcionalidades avanzadas:
1.  **Live Preview** en tiempo real.
2.  **Generación de Word**.
3.  **Creación de Nuevas Secciones** (con Modal y paridad funcional).
4.  **Cláusulas Adicionales (+)**: Se ha iniciado la implementación de un botón "+" en los encabezados para agregar cláusulas extra rápidamente. Esta funcionalidad está funcional pero marcada para refinamiento futuro.
