---
name: design-patterns-guide
description: >
  Enforces software design patterns (GoF) and SOLID/OOP principles during development.
  Use when writing new code, refactoring, reviewing architecture, or designing classes and interfaces.
  Guides pattern selection, validates implementations, and suggests improvements based on
  established design principles.
user-invocable: true
---

# Guia de Patrones de Diseno y Principios SOLID

## Instrucciones para Claude

Cuando esta skill se active, sigue estas directrices:

1. **Analiza el contexto** antes de sugerir patrones. Identifica el problema real que el usuario intenta resolver.
2. **Consulta los archivos de referencia** solo cuando necesites detalles especificos de un patron o principio. Usa la matriz de decision rapida (abajo) para identificar candidatos.
3. **Evita la sobre-ingenieria**: No sugieras patrones si el codigo es simple y funcional. Tres lineas similares son mejores que una abstraccion prematura.
4. **Prioriza principios sobre patrones**: Los principios SOLID y OOP son la base; los patrones son herramientas para implementarlos.
5. **Se especifico**: Cuando sugieras un patron, explica *por que* aplica al caso concreto, no solo *que* es el patron.
6. **Lee el archivo de referencia correspondiente** antes de dar explicaciones detalladas o pseudocodigo sobre un patron especifico.

---

## Matriz de Decision Rapida

### Cuando necesitas CREAR objetos

| Situacion | Patron Sugerido | Referencia |
|---|---|---|
| Crear objetos sin especificar clase concreta | Factory Method | `references/creational/factory-method.md` |
| Crear familias de objetos relacionados | Abstract Factory | `references/creational/abstract-factory.md` |
| Construir objetos complejos paso a paso | Builder | `references/creational/builder.md` |
| Clonar objetos existentes | Prototype | `references/creational/prototype.md` |
| Garantizar una unica instancia global | Singleton | `references/creational/singleton.md` |

### Cuando necesitas ESTRUCTURAR clases

| Situacion | Patron Sugerido | Referencia |
|---|---|---|
| Hacer compatibles interfaces incompatibles | Adapter | `references/structural/adapter.md` |
| Separar abstraccion de implementacion | Bridge | `references/structural/bridge.md` |
| Tratar objetos individuales y compuestos uniformemente | Composite | `references/structural/composite.md` |
| Agregar responsabilidades dinamicamente | Decorator | `references/structural/decorator.md` |
| Simplificar interfaz de un subsistema complejo | Facade | `references/structural/facade.md` |
| Compartir estado entre muchos objetos similares | Flyweight | `references/structural/flyweight.md` |
| Controlar acceso a un objeto | Proxy | `references/structural/proxy.md` |

### Cuando necesitas COMPORTAMIENTO entre objetos

| Situacion | Patron Sugerido | Referencia |
|---|---|---|
| Pasar solicitudes por una cadena de manejadores | Chain of Responsibility | `references/behavioral/chain-of-responsibility.md` |
| Encapsular solicitudes como objetos | Command | `references/behavioral/command.md` |
| Recorrer elementos sin exponer estructura interna | Iterator | `references/behavioral/iterator.md` |
| Reducir dependencias caoticas entre objetos | Mediator | `references/behavioral/mediator.md` |
| Guardar y restaurar estado de un objeto | Memento | `references/behavioral/memento.md` |
| Notificar cambios a multiples objetos | Observer | `references/behavioral/observer.md` |
| Cambiar comportamiento segun estado interno | State | `references/behavioral/state.md` |
| Intercambiar algoritmos en tiempo de ejecucion | Strategy | `references/behavioral/strategy.md` |
| Definir esqueleto de algoritmo, delegar pasos | Template Method | `references/behavioral/template-method.md` |
| Agregar operaciones sin modificar clases existentes | Visitor | `references/behavioral/visitor.md` |

### Cuando necesitas aplicar PRINCIPIOS de diseno

| Sintoma en el codigo | Principio a aplicar | Referencia |
|---|---|---|
| Cambios en un lugar rompen cosas en otro | Encapsular lo que varia | `references/principles/encapsulate-what-varies.md` |
| Codigo depende de clases concretas | Programar hacia interfaces | `references/principles/program-to-interface.md` |
| Jerarquia de herencia rigida y fragil | Composicion sobre herencia | `references/principles/favor-composition-over-inheritance.md` |
| Clase tiene multiples razones para cambiar | SRP | `references/principles/single-responsibility-principle.md` |
| Modificar clase existente para agregar funcionalidad | OCP | `references/principles/open-closed-principle.md` |
| Subclase no puede sustituir a su padre | LSP | `references/principles/liskov-substitution-principle.md` |
| Clientes dependen de metodos que no usan | ISP | `references/principles/interface-segregation-principle.md` |
| Modulos de alto nivel dependen de detalles | DIP | `references/principles/dependency-inversion-principle.md` |

---

## Directrices Anti Sobre-Ingenieria

Antes de sugerir un patron, verifica:

- **El problema existe HOY?** No disenar para requisitos hipoteticos futuros.
- **El codigo se repetira 3+ veces?** Si es solo 1-2 veces, la duplicacion puede ser aceptable.
- **La abstraccion simplifica o complica?** Si el patron agrega mas complejidad que la que resuelve, no lo uses.
- **El equipo lo entendera?** Un patron desconocido para el equipo puede ser peor que codigo simple.

### Regla general
> Si el codigo funciona, es legible y no viola principios SOLID de forma evidente, **no lo cambies solo para aplicar un patron**.

---

## Indice Completo de Referencias

### Principios de Diseno (8)
1. [Encapsular lo que varia](references/principles/encapsulate-what-varies.md)
2. [Programar hacia una interfaz](references/principles/program-to-interface.md)
3. [Favorecer composicion sobre herencia](references/principles/favor-composition-over-inheritance.md)
4. [Principio de Responsabilidad Unica (SRP)](references/principles/single-responsibility-principle.md)
5. [Principio Abierto/Cerrado (OCP)](references/principles/open-closed-principle.md)
6. [Principio de Sustitucion de Liskov (LSP)](references/principles/liskov-substitution-principle.md)
7. [Principio de Segregacion de Interfaces (ISP)](references/principles/interface-segregation-principle.md)
8. [Principio de Inversion de Dependencias (DIP)](references/principles/dependency-inversion-principle.md)

### Patrones Creacionales (5)
1. [Factory Method](references/creational/factory-method.md)
2. [Abstract Factory](references/creational/abstract-factory.md)
3. [Builder](references/creational/builder.md)
4. [Prototype](references/creational/prototype.md)
5. [Singleton](references/creational/singleton.md)

### Patrones Estructurales (7)
1. [Adapter](references/structural/adapter.md)
2. [Bridge](references/structural/bridge.md)
3. [Composite](references/structural/composite.md)
4. [Decorator](references/structural/decorator.md)
5. [Facade](references/structural/facade.md)
6. [Flyweight](references/structural/flyweight.md)
7. [Proxy](references/structural/proxy.md)

### Patrones de Comportamiento (10)
1. [Chain of Responsibility](references/behavioral/chain-of-responsibility.md)
2. [Command](references/behavioral/command.md)
3. [Iterator](references/behavioral/iterator.md)
4. [Mediator](references/behavioral/mediator.md)
5. [Memento](references/behavioral/memento.md)
6. [Observer](references/behavioral/observer.md)
7. [State](references/behavioral/state.md)
8. [Strategy](references/behavioral/strategy.md)
9. [Template Method](references/behavioral/template-method.md)
10. [Visitor](references/behavioral/visitor.md)
