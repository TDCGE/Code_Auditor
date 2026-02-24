# Marco Normativo de Calidad y Seguridad

## CGE-Verificator — Design Patterns Guide Skill

**Version:** 1.0
**Fecha:** 2026-02-24
**Alcance:** Criterios obligatorios de calidad arquitectonica, seguridad y mantenibilidad para todo proyecto creado o auditado con la skill `design-patterns-guide` del CGE-Verificator.

---

## 1. Proposito y Alcance

Este documento establece el **marco normativo** que rige la evaluacion de calidad y seguridad de proyectos de software. Define:

- **Dimensiones de calidad** medibles y auditables.
- **Criterios minimos** que todo proyecto debe cumplir.
- **Niveles de severidad** y su tratamiento obligatorio.
- **Mapeo explicito** entre principios SOLID, patrones GoF y reglas de auditoria.
- **Umbrales de conformidad** para clasificar proyectos.

Aplica a todo proyecto analizado por el CGE-Verificator, independientemente del lenguaje (TypeScript, JavaScript, Python, Java, C#) o framework utilizado.

---

## 2. Niveles de Severidad

| Nivel | Etiqueta | Peso | Tratamiento |
|-------|----------|------|-------------|
| **HIGH** | CRITICO | 3 | **Bloquea despliegue.** Debe corregirse antes de merge a rama principal. |
| **MEDIUM** | MEDIO | 2 | **Requiere plan de accion.** Debe documentarse y resolverse en el sprint actual o siguiente. |
| **LOW** | BAJO | 1 | **Recomendacion.** Puede priorizarse en backlog sin bloquear entregas. |

### Politica de tolerancia

| Contexto | HIGH permitidos | MEDIUM permitidos | LOW permitidos |
|----------|----------------|-------------------|----------------|
| **Merge a produccion** | 0 | ≤ 3 | Sin limite |
| **Merge a desarrollo** | 0 | ≤ 10 | Sin limite |
| **Pull Request (revision)** | 0 | ≤ 5 | Sin limite |
| **Prototipo / PoC** | ≤ 2 (documentados) | Sin limite | Sin limite |

---

## 3. Dimensiones de Calidad

### 3.1 Seguridad (SEC)

Detecta vulnerabilidades explotables y riesgos de exposicion de datos.

| ID Regla | Criterio | Severidad | Scanner |
|----------|----------|-----------|---------|
| `SEC-01` | No deben existir credenciales hardcodeadas (AWS keys, API keys, passwords, private keys) | HIGH | SecretScanner |
| `SEC-02` | No deben existir correos corporativos hardcodeados en codigo fuente | LOW | SecretScanner |
| `SEC-03` | JWT debe usar `verify()`, no `decode()`; debe incluir expiracion y secreto robusto | HIGH | AuthScanner |
| `SEC-04` | Passwords deben hashearse con bcrypt/scrypt/argon2; prohibido MD5/SHA1 | HIGH | AuthScanner |
| `SEC-05` | Toda ruta sensible debe tener control de acceso basado en roles | HIGH | AuthScanner |
| `SEC-06` | Cookies de sesion deben configurarse con `httpOnly`, `secure`, `sameSite` | MEDIUM | AuthScanner |
| `SEC-07` | Dependencias no deben tener vulnerabilidades conocidas (CVE) de severidad critica o alta | HIGH | DependencyScanner |
| `SEC-08` | Dependencias con vulnerabilidades moderadas deben tener plan de actualizacion | MEDIUM | DependencyScanner |

**Principios SOLID relacionados:**
- **DIP** (Dependency Inversion): Clientes de autenticacion deben depender de abstracciones, no de implementaciones concretas de hashing o JWT. Permite intercambiar algoritmos sin modificar logica de negocio.
- **OCP** (Open/Closed): El sistema de autenticacion debe ser extensible (nuevos providers OAuth, nuevos metodos MFA) sin modificar modulos existentes.

---

### 3.2 Arquitectura (ARQ)

Evalua la estructura del proyecto, separacion de responsabilidades y adherencia a patrones.

| ID Regla | Criterio | Severidad | Scanner |
|----------|----------|-----------|---------|
| `ARQ-01` | El proyecto debe tener estructura de directorios clara y convencional (`src/`, `tests/`, etc.) | MEDIUM | ArchitectureScanner |
| `ARQ-02` | No deben existir God Objects (clases con mas de 3 responsabilidades distintas) | HIGH | ArchitectureScanner |
| `ARQ-03` | No deben existir dependencias circulares entre modulos | HIGH | ArchitectureScanner |
| `ARQ-04` | Capas arquitectonicas no deben tener dependencias inversas (modelo no importa controlador) | HIGH | ArchitectureScanner |
| `ARQ-05` | Patrones de diseno aplicados deben ser coherentes con el problema que resuelven | MEDIUM | ArchitectureScanner |
| `ARQ-06` | No debe existir acoplamiento temporal (orden implicito de llamadas para funcionar) | MEDIUM | ArchitectureScanner |

**Principios SOLID relacionados:**

| Principio | Criterio Verificable | Violacion Tipica |
|-----------|---------------------|------------------|
| **SRP** | Cada clase tiene una unica razon para cambiar | Clase que mezcla logica de negocio, acceso a datos y presentacion |
| **OCP** | Agregar funcionalidad nueva no requiere modificar clases existentes | Cadenas `if/else` o `switch` que crecen con cada variante |
| **LSP** | Subclases pueden reemplazar a sus padres sin romper el sistema | Subclase lanza excepciones inesperadas o restringe parametros |
| **ISP** | Interfaces son granulares y cohesivas; no tienen metodos sin implementar | Clase implementa interfaz con metodos vacios (stubs) |
| **DIP** | Modulos de alto nivel dependen de abstracciones, no de implementaciones concretas | `import` directo de clase concreta de infraestructura en logica de negocio |

**Patrones GoF como solucion a violaciones arquitectonicas:**

| Violacion Detectada | Patron Recomendado | Justificacion |
|--------------------|--------------------|---------------|
| Creacion de objetos acoplada a clase concreta | **Factory Method** / **Abstract Factory** | Desacopla construccion de uso, cumple DIP y OCP |
| Clase con multiples responsabilidades | **Strategy** + extraccion de clases | Cada estrategia encapsula un algoritmo, cumple SRP |
| Comportamiento que varia segun estado | **State** | Elimina cadenas if/else de estado, cumple OCP |
| Funcionalidad agregada via herencia profunda | **Decorator** | Composicion sobre herencia, cumple OCP y LSP |
| Subsistema complejo expuesto directamente | **Facade** | Simplifica interfaz publica, cumple ISP |
| Notificaciones hardcodeadas entre objetos | **Observer** | Desacopla emisor de receptores, cumple DIP |
| Algoritmo con pasos fijos pero variantes | **Template Method** | Esqueleto fijo, pasos delegados a subclases, cumple OCP |
| Solicitudes procesadas por cadena de handlers | **Chain of Responsibility** | Desacopla emisor de receptor, cumple SRP |

---

### 3.3 Calidad de Codigo (COD)

Evalua legibilidad, complejidad y mantenibilidad a nivel de codigo fuente.

| ID Regla | Criterio | Severidad | Scanner |
|----------|----------|-----------|---------|
| `COD-01` | Funciones no deben exceder 50 lineas | MEDIUM | CodeQualityScanner |
| `COD-02` | Profundidad de anidamiento no debe superar 3 niveles | MEDIUM | CodeQualityScanner |
| `COD-03` | Complejidad ciclomatica no debe superar 10 por funcion | HIGH | CodeQualityScanner |
| `COD-04` | No deben existir bloques de codigo duplicado (> 10 lineas identicas) | MEDIUM | CodeQualityScanner |
| `COD-05` | Nomenclatura debe ser consistente dentro del proyecto (camelCase o snake_case, no mezcla) | LOW | CodeQualityScanner |
| `COD-06` | Funciones no deben tener mas de 4 parametros | MEDIUM | CodeQualityScanner |
| `COD-07` | Bloques try/catch no deben estar vacios ni silenciar excepciones | HIGH | CodeQualityScanner |
| `COD-08` | Promesas deben manejar rejection (`.catch()` o `try/await`) | HIGH | CodeQualityScanner |

**Principios relacionados:**
- **SRP**: Funciones largas o con muchos parametros suelen tener multiples responsabilidades.
- **Encapsular lo que varia**: Codigo duplicado indica falta de encapsulacion de la variabilidad.
- **Programar hacia interfaces**: Dependencias de clases concretas dificultan testing y extension.

---

### 3.4 Rendimiento (REN)

Detecta problemas de rendimiento en operaciones de I/O, base de datos y concurrencia.

| ID Regla | Criterio | Severidad | Scanner |
|----------|----------|-----------|---------|
| `REN-01` | No deben existir consultas N+1 (queries dentro de loops) | HIGH | PerformanceScanner |
| `REN-02` | Queries que retornan colecciones deben incluir paginacion | MEDIUM | PerformanceScanner |
| `REN-03` | Conexiones a DB, streams y file handles deben cerrarse explicitamente | HIGH | PerformanceScanner |
| `REN-04` | Operaciones sincronas bloqueantes estan prohibidas en codigo de servidor | HIGH | PerformanceScanner |
| `REN-05` | Operaciones costosas repetitivas deben tener estrategia de cache | MEDIUM | PerformanceScanner |
| `REN-06` | Algoritmos O(n²) deben justificarse cuando existan alternativas O(n log n) | MEDIUM | PerformanceScanner |

**Patrones GoF relacionados:**
- **Flyweight**: Compartir estado inmutable entre objetos similares reduce consumo de memoria.
- **Proxy**: Proxy de cache (lazy loading, virtual proxy) para controlar acceso costoso a recursos.
- **Iterator**: Procesamiento lazy de colecciones grandes evita cargar todo en memoria.

---

### 3.5 Testing (TST)

Evalua cobertura, frameworks y calidad de las pruebas existentes.

| ID Regla | Criterio | Severidad | Scanner |
|----------|----------|-----------|---------|
| `TST-01` | Ratio test-a-codigo debe ser ≥ 30% (archivos de test / archivos de codigo) | HIGH | TestingScanner |
| `TST-02` | Ratio test-a-codigo ≥ 10% es el minimo aceptable para desarrollo activo | MEDIUM | TestingScanner |
| `TST-03` | Debe existir un framework de testing configurado y funcional | MEDIUM | TestingScanner |
| `TST-04` | Assertions deben ser especificas (`toEqual`, `toHaveBeenCalledWith`), no genericas (`toBeTruthy`) | MEDIUM | TestingScanner |
| `TST-05` | Tests deben cubrir edge cases: null, colecciones vacias, valores limite, errores | MEDIUM | TestingScanner |
| `TST-06` | Tests no deben estar acoplados a implementacion; deben verificar comportamiento | LOW | TestingScanner |

**Principios relacionados:**
- **DIP**: Codigo que depende de abstracciones es inherentemente testeable (inyeccion de mocks).
- **ISP**: Interfaces granulares facilitan la creacion de mocks especificos.
- **SRP**: Clases con responsabilidad unica son mas faciles de testear de forma aislada.

---

### 3.6 Mantenibilidad (MAN)

Evalua la capacidad del proyecto para ser comprendido, modificado y extendido.

| ID Regla | Criterio | Severidad | Scanner |
|----------|----------|-----------|---------|
| `MAN-01` | Clases y funciones publicas deben tener documentacion (JSDoc, docstrings, Javadoc) | MEDIUM | ArchitectureScanner |
| `MAN-02` | El proyecto debe tener README.md con instrucciones de setup y ejecucion | LOW | ArchitectureScanner |
| `MAN-03` | Debe existir configuracion de linter activa y funcional | MEDIUM | ArchitectureScanner |
| `MAN-04` | Debe existir configuracion de formatter para consistencia de estilo | LOW | ArchitectureScanner |
| `MAN-05` | Dependencias cruzadas entre capas deben minimizarse y documentarse | HIGH | ArchitectureScanner |
| `MAN-06` | El proyecto debe tener archivo `guidelines.md` si es auditado recurrentemente | LOW | GuidelinesLoader |

---

## 4. Matriz de Conformidad SOLID-Patrones-Reglas

Esta matriz conecta cada principio SOLID con los patrones de diseno que lo implementan y las reglas de auditoria que verifican su cumplimiento.

| Principio | Patrones que lo Implementan | Reglas de Auditoria |
|-----------|----------------------------|---------------------|
| **SRP** | Strategy, Command, Mediator | ARQ-02, COD-01, COD-06 |
| **OCP** | Strategy, Decorator, Template Method, Observer, State | ARQ-05, ARQ-06 |
| **LSP** | Template Method, Strategy, Factory Method | ARQ-04, ARQ-05 |
| **ISP** | Facade, Adapter, Strategy | ARQ-02, COD-06 |
| **DIP** | Abstract Factory, Factory Method, Strategy, Observer, Bridge | ARQ-03, ARQ-04, SEC-03, SEC-04 |

---

## 5. Directrices Anti Sobre-Ingenieria

Alineadas con las directrices de la skill `design-patterns-guide`, este marco normativo **no penaliza** la ausencia de patrones cuando:

1. **El codigo funciona, es legible y no viola SOLID de forma evidente.** No se exige un patron solo por aplicarlo.
2. **El problema no existe todavia.** No se exige diseno para requisitos hipoteticos futuros.
3. **La duplicacion es ≤ 2 ocurrencias.** Tres lineas similares son preferibles a una abstraccion prematura.
4. **El equipo no conoce el patron.** Se reporta como `LOW` con sugerencia educativa, nunca como `HIGH`.

### Cuando SI aplicar un patron (criterios obligatorios)

Un patron **debe** aplicarse cuando:
- La violacion SOLID es evidente y recurrente (3+ instancias).
- El codigo actual causa bugs demostrados o es intesteable.
- La extension del sistema requiere modificar modulos existentes repetidamente.
- El acoplamiento impide despliegues independientes de modulos.

---

## 6. Clasificacion de Proyectos

Basado en los resultados de la auditoria completa, los proyectos se clasifican en:

### Nivel A — Conforme

| Criterio | Umbral |
|----------|--------|
| Issues HIGH | 0 |
| Issues MEDIUM | ≤ 3 |
| Cobertura de tests | ≥ 30% |
| Dependencias vulnerables (criticas) | 0 |
| Estructura de directorios | Convencional y documentada |
| Principios SOLID | Sin violaciones evidentes |

**Resultado:** Aprobado para produccion sin condiciones.

### Nivel B — Conforme con Observaciones

| Criterio | Umbral |
|----------|--------|
| Issues HIGH | 0 |
| Issues MEDIUM | 4–10 |
| Cobertura de tests | ≥ 10% |
| Dependencias vulnerables (criticas) | 0 |
| Principios SOLID | Violaciones menores documentadas |

**Resultado:** Aprobado para produccion con plan de mejora en siguiente iteracion.

### Nivel C — No Conforme (Remediacion Requerida)

| Criterio | Umbral |
|----------|--------|
| Issues HIGH | ≥ 1 |
| Issues MEDIUM | > 10 |
| Cobertura de tests | < 10% |
| Dependencias vulnerables (criticas) | ≥ 1 |
| Principios SOLID | Violaciones graves sin justificar |

**Resultado:** Bloqueado para produccion. Requiere remediacion y re-auditoria.

### Nivel D — Prototipo / PoC

| Criterio | Umbral |
|----------|--------|
| Issues HIGH | ≤ 2 (documentados como deuda tecnica) |
| Issues MEDIUM | Sin limite |
| Cobertura de tests | No requerida |

**Resultado:** Aceptable solo para validacion de concepto. No elegible para produccion.

---

## 7. Proceso de Auditoria

```
┌─────────────────────────────────────────────────────────┐
│  1. DETECCION                                           │
│  ─ Identificar tech stack (Node, Python, Java)          │
│  ─ Calcular metricas base (archivos, LOC, tests)        │
│  ─ Cargar guidelines.md si existe                       │
│  ─ Cargar suppressions.json si existe                   │
├─────────────────────────────────────────────────────────┤
│  2. ESCANEO (7 scanners en secuencia)                   │
│  ─ SecretScanner      → SEC-01, SEC-02                  │
│  ─ AuthScanner        → SEC-03 a SEC-06                 │
│  ─ ArchitectureScanner→ ARQ-01 a ARQ-06, MAN-01 a MAN-05│
│  ─ CodeQualityScanner → COD-01 a COD-08                 │
│  ─ PerformanceScanner → REN-01 a REN-06                 │
│  ─ DependencyScanner  → SEC-07, SEC-08                  │
│  ─ TestingScanner     → TST-01 a TST-06                 │
├─────────────────────────────────────────────────────────┤
│  3. CLASIFICACION                                       │
│  ─ Calcular totales por severidad                       │
│  ─ Evaluar umbrales de conformidad                      │
│  ─ Asignar nivel (A / B / C / D)                        │
├─────────────────────────────────────────────────────────┤
│  4. REPORTE                                             │
│  ─ Consola: resultados en tiempo real (colores)         │
│  ─ Markdown: audit/v{N}/audit.md                        │
│  ─ JSON: --output-json para CI/CD                       │
│  ─ PR Comment: via GitHub Action                        │
├─────────────────────────────────────────────────────────┤
│  5. SEGUIMIENTO                                         │
│  ─ Issues HIGH → ticket inmediato                       │
│  ─ Issues MEDIUM → sprint actual o siguiente            │
│  ─ Issues LOW → backlog priorizado                      │
│  ─ Re-auditoria tras remediacion de nivel C             │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Supresiones y Excepciones

El archivo `suppressions.json` permite marcar hallazgos aceptados como riesgo conocido:

```json
{
  "suppressions": [
    {
      "rule": "SEC-01",
      "file": "config/test-fixtures.ts",
      "reason": "Credenciales de test, no produccion",
      "approvedBy": "security-lead",
      "expiresAt": "2026-06-01"
    }
  ]
}
```

**Requisitos para supresiones:**
- Debe incluir `reason` explicando por que se acepta el riesgo.
- Debe incluir `approvedBy` identificando al responsable.
- Supresiones de reglas HIGH deben incluir `expiresAt` con fecha de revision.
- Supresiones expiradas se reactivan automaticamente en la siguiente auditoria.

---

## 9. Integracion con Guidelines del Proyecto

Cuando el proyecto auditado contiene `guidelines.md` en su raiz:

1. El `GuidelinesLoader` lo inyecta como contexto en todos los scanners AI.
2. Los scanners AI verifican coherencia entre el codigo y las guidelines.
3. **Desviaciones de guidelines propias del proyecto** se reportan como hallazgos adicionales.
4. Las guidelines del proyecto **no pueden relajar** los criterios HIGH de este marco normativo.
5. Las guidelines del proyecto **pueden endurecer** criterios (ej: exigir cobertura > 50%).

**Jerarquia de autoridad:**
```
Marco Normativo (este documento)
  └─ guidelines.md del proyecto
       └─ suppressions.json (excepciones documentadas)
```

---

## 10. Checklist de Conformidad Rapida

Para uso en code reviews y antes de solicitar auditoria formal:

- [ ] No hay credenciales hardcodeadas en el codigo fuente
- [ ] JWT usa `verify()` con secreto robusto y expiracion
- [ ] Passwords se hashean con algoritmo moderno (bcrypt/scrypt/argon2)
- [ ] Todas las rutas sensibles tienen control de acceso
- [ ] No hay dependencias con CVEs criticos sin parchear
- [ ] Estructura de directorios sigue convencion del framework
- [ ] No hay God Objects ni dependencias circulares
- [ ] Funciones no exceden 50 lineas ni 3 niveles de anidamiento
- [ ] No hay bloques try/catch vacios
- [ ] No hay operaciones sincronas bloqueantes en servidor
- [ ] No hay consultas N+1
- [ ] Conexiones y recursos se cierran correctamente
- [ ] Existe framework de testing configurado
- [ ] Ratio de tests es ≥ 10% (minimo) o ≥ 30% (deseable)
- [ ] Existe README.md con instrucciones de setup
- [ ] Linter esta configurado y activo

---

## 11. Glosario

| Termino | Definicion |
|---------|-----------|
| **GoF** | Gang of Four — los 23 patrones de diseno clasicos de Gamma, Helm, Johnson, Vlissides |
| **SOLID** | Cinco principios de diseno orientado a objetos: SRP, OCP, LSP, ISP, DIP |
| **God Object** | Clase que concentra demasiadas responsabilidades, violando SRP |
| **N+1** | Antipatron donde se ejecuta 1 query inicial + N queries adicionales en un loop |
| **CVE** | Common Vulnerabilities and Exposures — identificador unico de vulnerabilidad conocida |
| **Supresion** | Hallazgo aceptado como riesgo conocido y documentado |
| **Scanner** | Modulo de analisis que detecta un tipo especifico de problema |
| **Severidad** | Nivel de impacto de un hallazgo: HIGH, MEDIUM, LOW |
| **Guidelines** | Documento del proyecto que establece convenciones y decisiones arquitectonicas propias |

---

## 12. Historial de Versiones

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-02-24 | Version inicial del marco normativo |
