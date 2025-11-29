# SISTEMA DE DOCUMENTACION - Guia Rapida

## 🎯 QUE ES ESTO

Este es el sistema de documentacion para mantener continuidad en proyectos de desarrollo que duran semanas o meses, especialmente cuando trabajas con multiples IAs en sesiones discontinuas.

---

## 📚 ARCHIVOS DEL SISTEMA

### En Google Drive (Reglas Globales)
```
G:\Mi unidad\03_PROJECTS\0000_MEMORY\
├── 01_REGLAS_EFICIENCIA.md          ← Optimizacion de tokens (YA EXISTIA)
├── 02_PROTOCOLO_PROYECTOS.md        ← Gestion de proyectos (NUEVO)
└── TEMPLATE_00_CONTEXTO_PROYECTO.md ← Template para nuevos proyectos (NUEVO)
```

### En Este Proyecto
```
C:\Users\juan.montenegro\Desktop\Especialista_requerimientos\docs\
├── 00_CONTEXTO_PROYECTO.md    ← ARCHIVO MAESTRO (leer siempre primero)
├── 01_ARQUITECTURA.md         ← [Pendiente crear]
├── 02_DECISIONES.md           ← [Pendiente crear]
├── 03_PENDIENTES.md           ← [Pendiente crear]
└── 04_SESIONES.md             ← [Pendiente crear]
```

---

## 🚀 COMO USAR (Para Juan)

### INICIO DE NUEVA SESION CON IA

**Prompt recomendado:**
```markdown
Hola, soy Juan Montenegro.

IMPORTANTE: Antes de hacer cualquier cosa, lee en este orden:
1. G:\Mi unidad\03_PROJECTS\0000_MEMORY\01_REGLAS_EFICIENCIA.md
2. C:\Users\juan.montenegro\Desktop\Especialista_requerimientos\docs\00_CONTEXTO_PROYECTO.md
3. C:\Users\juan.montenegro\Desktop\Especialista_requerimientos\docs\03_PENDIENTES.md

Confirma que leiste estos 3 archivos resumiendo:
- Estado actual del proyecto
- Que se hizo en la ultima sesion
- Que tarea vamos a hacer hoy

Tarea de hoy: [DESCRIPCION DE LO QUE QUIERES HACER]
```

### AL TERMINAR SESION

1. Actualizar `00_CONTEXTO_PROYECTO.md`:
   - Cambiar "Ultima sesion" a fecha de hoy
   - Agregar entrada en "Historial de Sesiones"
   - Actualizar "Estado actual" si cambio algo importante

2. Si tomaste decisiones tecnicas importantes:
   - Documentar en `02_DECISIONES.md`

3. Actualizar `03_PENDIENTES.md`:
   - Marcar completados
   - Agregar nuevas tareas descubiertas

---

## 📖 QUE CONTIENE CADA ARCHIVO

### 00_CONTEXTO_PROYECTO.md
- **Lectura rapida:** Estado en 30 segundos
- **Mapa de archivos:** Donde esta cada cosa
- **Reglas especificas:** Que NO hacer en este proyecto
- **Historial:** Que se hizo cada dia

**Lee este archivo SIEMPRE primero.**

### 01_ARQUITECTURA.md (Pendiente crear)
- Diagramas del sistema
- Flujo de datos
- Explicacion tecnica profunda

### 02_DECISIONES.md (Pendiente crear)
- Por que elegiste X tecnologia
- Por que rechazaste opcion Y
- Razonamiento de decisiones importantes

### 03_PENDIENTES.md (Pendiente crear)
- TODO list organizado por prioridad
- Tareas bloqueadas
- Backlog

### 04_SESIONES.md (Pendiente crear)
- Diario detallado de cada sesion
- Problemas encontrados y soluciones
- Aprendizajes

---

## ✅ VENTAJAS DE ESTE SISTEMA

1. **Continuidad garantizada:**
   - Cualquier IA puede retomar donde quedaste
   - No pierdes tiempo re-explicando

2. **Mantenibilidad:**
   - Codigo documentado se entiende meses despues
   - Facilita agregar features

3. **Escalabilidad:**
   - Proyecto puede crecer sin volverse caotico
   - Facil integrar nuevos desarrolladores

4. **Trazabilidad:**
   - Sabes por que tomaste cada decision
   - Puedes revertir cambios con confianza

5. **Profesionalismo:**
   - Sistema probado en la industria
   - Facil de mostrar a stakeholders

---

## 🎓 SIGUIENTES PASOS

### Hoy (2025-01-28)
- [x] Crear sistema de documentacion
- [x] Crear 00_CONTEXTO_PROYECTO.md
- [ ] Crear archivos restantes (01-04)

### Proxima sesion
- [ ] Llenar 01_ARQUITECTURA.md con diagramas
- [ ] Llenar 02_DECISIONES.md con decisiones tomadas
- [ ] Llenar 03_PENDIENTES.md con backlog
- [ ] Empezar 04_SESIONES.md

### Futuro
- [ ] Aplicar sistema a otros proyectos
- [ ] Refinar templates segun experiencia

---

## ❓ PREGUNTAS FRECUENTES

**P: Es mucho trabajo mantener esto?**
R: Los primeros dias si, pero luego se vuelve automatico. Actualizar 00_CONTEXTO toma 2 minutos al final de cada sesion.

**P: Que pasa si no actualizo?**
R: El sistema pierde efectividad. Lo critico es actualizar 00_CONTEXTO cada sesion.

**P: Debo documentar TODO?**
R: No. Solo decisiones importantes y cambios significativos. Cambios triviales no.

**P: Funciona con Gemini/GPT tambien?**
R: Si, el sistema es agnostico de la IA. Todos pueden leer markdown.

**P: Y si el proyecto es muy chico?**
R: Para proyectos <1 dia, es overkill. Para proyectos >3 dias, es necesario.

---

**Creado:** 2025-01-28
**Autor:** Juan Montenegro + Claude
