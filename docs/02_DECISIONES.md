# DECISIONES TECNICAS - Especialista de Requerimientos

**Proyecto:** Especialista de Requerimientos v2
**Proposito:** Registro de decisiones arquitectonicas importantes (ADR)
**Formato:** Architecture Decision Records

---

## Indice de Decisiones

1. [No usar frameworks JavaScript](#decision-1-no-usar-frameworks-javascript)
2. [Markdown como formato de plantillas](#decision-2-markdown-como-formato-de-plantillas)
3. [SessionStorage para preservar datos](#decision-3-sessionstorage-para-preservar-datos)
4. [JSON local en vez de base de datos](#decision-4-json-local-en-vez-de-base-de-datos)
5. [Tres botones separados en vez de uno](#decision-5-tres-botones-separados)
6. [Nueva pagina para vista previa](#decision-6-nueva-pagina-para-vista-previa)

---

## Decision 1: No usar frameworks JavaScript

**Fecha:** 2025-01-28
**Estado:** ✅ Activa
**Contexto:** Definir tecnologias para construir la aplicacion web

### Problema
Necesitamos crear una aplicacion web interactiva. Opciones:
- Vanilla JavaScript
- React
- Vue
- Angular

### Opciones consideradas

#### Opcion A: React
**Pros:**
- Popular, mucha documentacion
- Componentes reutilizables
- Ecosistema grande

**Contras:**
- Requiere npm, node_modules (100+ MB)
- Build process complejo
- Curva de aprendizaje
- Overkill para este proyecto
- Dependencia externa

#### Opcion B: Vue
**Pros:**
- Mas simple que React
- Buena documentacion

**Contras:**
- Mismos problemas que React
- Menos conocido

#### Opcion C: Vanilla JavaScript
**Pros:**
- Cero dependencias
- Rapido de cargar (<1 segundo)
- Simple de mantener
- No requiere build
- Total control

**Contras:**
- Mas codigo manual
- Sin componentes reutilizables nativos

### Decision tomada
**Vanilla JavaScript (Opcion C)**

### Razonamiento
1. **Simplicidad:** Proyecto pequeño-mediano, no justifica framework
2. **Velocidad:** Sin dependencias = carga instantanea
3. **Mantenibilidad:** Cualquiera puede leer JavaScript vanilla
4. **Portabilidad:** Funciona en cualquier navegador sin compilar
5. **Alineado con preferencias:** Usuario prefiere soluciones simples (ver 01_REGLAS_EFICIENCIA.md)

### Consecuencias

**Positivas:**
- Proyecto pesa ~50 KB vs 2+ MB con framework
- Servidor simple (Python http.server)
- Facil de debuggear (no source maps)
- Sin vulnerabilidades de dependencias

**Negativas:**
- Mas codigo repetitivo (helper functions)
- Manipulacion DOM manual
- Sin hot reload (refresh manual)

**Riesgos:**
- Si proyecto crece mucho (>5000 lineas), podria volverse dificil
- Mitigacion: Modularizar en archivos separados si crece

### Cuando revisar esta decision
Si el proyecto:
- Supera 5000 lineas de codigo
- Requiere componentes muy complejos
- Necesita routing avanzado
- Se vuelve aplicacion multi-pagina compleja

---

## Decision 2: Markdown como formato de plantillas

**Fecha:** 2025-01-28
**Estado:** ✅ Activa
**Contexto:** Como almacenar plantillas de TDR

### Problema
Necesitamos formato para definir estructura del TDR. Opciones:
- JSON
- XML
- Markdown
- HTML

### Opciones consideradas

#### Opcion A: JSON
**Pros:**
- Facil de parsear en JavaScript
- Estructura clara

**Contras:**
- Dificil de editar (sintaxis estricta)
- No legible para humanos
- Comillas, comas, brackets

**Ejemplo:**
```json
{
  "sections": [
    {
      "title": "Finalidad Publica",
      "instructivo": "Describir el interes..."
    }
  ]
}
```

#### Opcion B: Markdown
**Pros:**
- Legible por humanos
- Facil de editar
- Sintaxis simple
- Versionable en Git

**Contras:**
- Requiere parser custom
- Formato flexible = mas validaciones

**Ejemplo:**
```markdown
## 1. Finalidad Publica
**Instructivo:** Describir el interes...
```

### Decision tomada
**Markdown (Opcion B)**

### Razonamiento
1. **Editable:** Usuario no-tecnico puede editar plantilla
2. **Legible:** Se ve como documento, no como codigo
3. **Simple:** Sintaxis minima (##, **bold**)
4. **Versionable:** Cambios claros en Git diff
5. **Estandar:** Markdown es ubicuo

### Consecuencias

**Positivas:**
- Plantillas faciles de actualizar sin tocar codigo
- Nuevas plantillas = nuevo archivo .md
- Documentacion y plantilla en mismo formato

**Negativas:**
- Parser custom necesario (150 lineas)
- Formato debe ser consistente
- Cambios en formato requieren actualizar parser

**Riesgos:**
- Usuario rompe formato → Parser falla
- Mitigacion: Validacion basica, mensajes de error claros

### Cuando revisar esta decision
Si:
- Plantillas se vuelven muy complejas (formulas, tablas)
- Necesitamos validacion estricta
- Parser se vuelve inmanejable

---

## Decision 3: SessionStorage para preservar datos

**Fecha:** 2025-01-28
**Estado:** ✅ Activa
**Contexto:** Como preservar datos al navegar a vista previa

### Problema
Usuario completa formulario, va a vista previa, y quiere volver sin perder datos.

### Opciones consideradas

#### Opcion A: LocalStorage
**Pros:**
- Persiste entre sesiones
- Simple de usar

**Contras:**
- Datos quedan para siempre
- Riesgo de datos obsoletos
- Menos seguro (persiste)

#### Opcion B: SessionStorage
**Pros:**
- Se limpia al cerrar navegador
- Simple de usar
- Suficiente para el caso de uso

**Contras:**
- No persiste entre sesiones
- Se pierde al cerrar navegador

#### Opcion C: Query parameters en URL
**Pros:**
- Sin JavaScript storage

**Contras:**
- URL muy larga (limite 2048 chars)
- Datos visibles en URL
- Inseguro

### Decision tomada
**SessionStorage (Opcion B)**

### Razonamiento
1. **Caso de uso:** Solo necesitamos persistir durante navegacion
2. **Seguridad:** Datos no quedan guardados permanentemente
3. **Simplicidad:** API simple (setItem, getItem)
4. **Limpieza automatica:** No requiere borrar manual

### Consecuencias

**Positivas:**
- Usuario puede ir y volver libremente
- Datos se limpian automaticamente
- Sin configuracion adicional

**Negativas:**
- Datos se pierden al cerrar navegador
- No sirve para guardar TDR largo plazo

**Riesgos:**
- Usuario cierra navegador por error = datos perdidos
- Mitigacion: Mensaje claro de que debe usar "Guardar" para persistir

### Cuando revisar esta decision
Si:
- Usuarios reportan perdida de datos frecuente
- Necesitamos auto-guardado
- Implementamos sistema multi-sesion

---

## Decision 4: JSON local en vez de base de datos

**Fecha:** 2025-01-28
**Estado:** ✅ Activa (revisar en Fase 2)
**Contexto:** Como almacenar datos de metas y TDRs guardados

### Problema
Necesitamos almacenar:
- Metas presupuestarias
- Actividades POI
- TDRs guardados

### Opciones consideradas

#### Opcion A: JSON local
**Pros:**
- Cero configuracion
- Sin servidor necesario
- Rapido de implementar

**Contras:**
- No escalable multi-usuario
- Sin queries complejas
- Sin sincronizacion

#### Opcion B: Supabase (PostgreSQL)
**Pros:**
- Base de datos real
- Multi-usuario
- Sincronizacion automatica
- Backups

**Contras:**
- Requiere cuenta/configuracion
- API keys necesarias
- Complejidad adicional
- Costo (gratis hasta cierto punto)

### Decision tomada
**JSON local (Opcion A) para MVP, migrar a Supabase en Fase 2**

### Razonamiento
1. **MVP primero:** Validar concepto antes de infraestructura
2. **Simplicidad:** Usuario unico, local suficiente
3. **Rapido:** Implementar en minutos vs horas
4. **Sin dependencias:** No requiere internet constante

### Consecuencias

**Positivas:**
- Desarrollo rapido
- Sin costos
- Sin configuracion
- Funciona offline

**Negativas:**
- Solo un usuario
- Sin backup automatico
- Sin versionado de TDRs
- Datos en archivos separados

**Riesgos:**
- Perdida de datos si se borra archivo
- Mitigacion: Documentar backups manuales

### Cuando revisar esta decision
Cuando:
- ✅ Necesitemos multi-usuario
- ✅ Queramos historial de versiones
- ✅ Necesitemos sincronizacion
- ✅ Datos crezcan mucho (>1000 TDRs)

**Plan de migracion a Supabase:**
1. Crear esquema de base de datos
2. Migrar metas-entidad.json → tabla `metas`
3. Implementar API calls con fetch
4. Migrar TDRs guardados → tabla `tdrs`

---

## Decision 5: Tres botones separados

**Fecha:** 2025-01-28
**Estado:** ✅ Activa
**Contexto:** Acciones disponibles al completar formulario

### Problema
Usuario completa formulario. ¿Que acciones ofrecer?

### Opciones consideradas

#### Opcion A: Un solo boton "Guardar"
**Pros:**
- Simple
- Menos confuso

**Contras:**
- No permite vista previa
- No permite revision IA
- Inflexible

#### Opcion B: Tres botones separados
**Pros:**
- Flujo flexible
- Usuario elige orden
- Opciones claras

**Contras:**
- Mas botones = mas UI
- Puede confundir

### Decision tomada
**Tres botones separados (Opcion B)**
1. Vista Previa
2. Guardar
3. Revisar con IA (futuro)

### Razonamiento
1. **Flexibilidad:** Usuario puede solo previsualizar sin guardar
2. **Flujo natural:** Ver → Ajustar → Guardar
3. **Preparacion futuro:** Boton IA ya esta presente
4. **UX clara:** Cada boton tiene proposito unico

### Consecuencias

**Positivas:**
- Usuario tiene control total del flujo
- Puede ver vista previa multiples veces
- Puede guardar sin vista previa
- Preparado para IA

**Negativas:**
- UI ligeramente mas compleja
- Requiere explicar opciones

**Riesgos:**
- Usuario confundido por multiples opciones
- Mitigacion: Colores diferentes, tooltips

### Cuando revisar esta decision
Si:
- Usuarios reportan confusion
- Analytics muestran que nadie usa vista previa
- Flujo necesita simplificarse

---

## Decision 6: Nueva pagina para vista previa

**Fecha:** 2025-01-28
**Estado:** ✅ Activa
**Contexto:** Como mostrar vista previa del documento

### Problema
Usuario quiere ver como se vera el TDR final antes de guardar.

### Opciones consideradas

#### Opcion A: Modal/popup sobre formulario
**Pros:**
- No sale de pagina
- Rapido de mostrar/ocultar

**Contras:**
- Espacio limitado
- No permite imprimir facilmente
- CSS complejo para print

#### Opcion B: Panel lateral deslizable
**Pros:**
- Ve formulario y preview simultaneamente

**Contras:**
- Pantalla dividida = poco espacio
- Complejo en mobile

#### Opcion C: Nueva pagina completa
**Pros:**
- Espacio completo para documento
- Facil de imprimir (Ctrl+P)
- CSS print optimizado
- Puede ser PDF directo

**Contras:**
- Navegacion entre paginas
- Riesgo de perder datos

### Decision tomada
**Nueva pagina completa (Opcion C)** con sessionStorage para preservar datos

### Razonamiento
1. **Impresion:** Vista previa debe ser imprimible = pagina completa
2. **Formato:** Documento necesita espacio vertical completo
3. **PDF:** Browser print to PDF funciona mejor en pagina dedicada
4. **Separacion:** Edicion vs visualizacion son modos diferentes

### Consecuencias

**Positivas:**
- Documento se ve exactamente como se imprimira
- Boton imprimir nativo del navegador
- CSS @media print funciona perfecto
- Usuario enfocado en revisar, no editar

**Negativas:**
- Requiere navegacion (boton volver)
- Dependencia de sessionStorage
- Dos archivos HTML en vez de uno

**Riesgos:**
- Usuario pierde datos si cierra navegador
- Mitigacion: SessionStorage preserva en navegacion normal

### Cuando revisar esta decision
Si:
- Usuarios reportan datos perdidos frecuentemente
- Necesitamos edicion inline en vista previa
- Mobile se vuelve prioridad

---

## Template para Nuevas Decisiones

```markdown
## Decision X: [Titulo]

**Fecha:** [YYYY-MM-DD]
**Estado:** ✅ Activa / ⚠️ Deprecada / ❌ Revertida
**Contexto:** [Situacion que requiere decision]

### Problema
[Descripcion del problema a resolver]

### Opciones consideradas

#### Opcion A: [Nombre]
**Pros:**
- [Pro 1]
- [Pro 2]

**Contras:**
- [Contra 1]
- [Contra 2]

#### Opcion B: [Nombre]
**Pros:**
- [Pro 1]

**Contras:**
- [Contra 1]

### Decision tomada
**[Opcion elegida]**

### Razonamiento
1. [Razon 1]
2. [Razon 2]
3. [Razon 3]

### Consecuencias

**Positivas:**
- [Lista]

**Negativas:**
- [Lista]

**Riesgos:**
- [Riesgo] - Mitigacion: [Como mitigar]

### Cuando revisar esta decision
Si:
- [Condicion 1]
- [Condicion 2]
```

---

**Ultima actualizacion:** 2025-01-28
**Total de decisiones:** 6
