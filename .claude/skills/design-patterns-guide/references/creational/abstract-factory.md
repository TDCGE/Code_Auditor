# Abstract Factory

## Intencion

Abstract Factory es un patron de diseno creacional que permite producir familias de objetos relacionados sin especificar sus clases concretas. Garantiza que los productos creados por una fabrica sean compatibles entre si, manteniendo el codigo cliente independiente de las implementaciones concretas.

## Problema

Imagina que desarrollas un simulador de tienda de muebles. Tu codigo consiste en clases que representan una familia de productos relacionados: `Chair`, `Sofa`, `CoffeeTable`. Estos productos vienen en variantes: `Modern`, `Victorian`, `ArtDeco`. Necesitas crear objetos de muebles individuales que coincidan con otros objetos de la misma familia (un sofa moderno no combina con sillas victorianas). Ademas, no quieres modificar el codigo existente cada vez que se agregan nuevos productos o familias, ya que los proveedores actualizan sus catalogos frecuentemente.

## Solucion

Abstract Factory sugiere declarar explicitamente interfaces para cada producto distinto de la familia (ej. `Chair`, `Sofa`, `CoffeeTable`). Todas las variantes de productos implementan esas interfaces. Luego se declara la *Abstract Factory* -- una interfaz con metodos de creacion para todos los productos de la familia (ej. `createChair`, `createSofa`, `createCoffeeTable`). Para cada variante, se crea una clase fabrica separada que implementa la interfaz (ej. `ModernFurnitureFactory`, `VictorianFurnitureFactory`). El codigo cliente trabaja con fabricas y productos a traves de sus interfaces abstractas.

## Estructura

- **Abstract Products**: Declaran interfaces para un conjunto de productos distintos pero relacionados que forman una familia (ej. `Button`, `Checkbox`).
- **Concrete Products**: Implementaciones concretas de los productos abstractos, agrupados por variantes. Cada producto abstracto debe implementarse en todas las variantes (ej. `WinButton`, `MacButton`).
- **Abstract Factory (interfaz)**: Declara un conjunto de metodos para crear cada uno de los productos abstractos (ej. `GUIFactory`).
- **Concrete Factories**: Implementan los metodos de creacion de la fabrica abstracta. Cada fabrica concreta corresponde a una variante especifica (ej. `WinFactory`, `MacFactory`).
- **Client**: Trabaja con cualquier variante de fabrica/producto a traves de las interfaces abstractas.

## Pseudocodigo

```pseudocode
// Interfaz de la fabrica abstracta
interface GUIFactory is
    method createButton():Button
    method createCheckbox():Checkbox

// Fabricas concretas producen familias de productos compatibles
class WinFactory implements GUIFactory is
    method createButton():Button is
        return new WinButton()
    method createCheckbox():Checkbox is
        return new WinCheckbox()

class MacFactory implements GUIFactory is
    method createButton():Button is
        return new MacButton()
    method createCheckbox():Checkbox is
        return new MacCheckbox()

// Interfaces de productos abstractos
interface Button is
    method paint()

interface Checkbox is
    method paint()

// Productos concretos
class WinButton implements Button is
    method paint() is
        // Renderizar boton estilo Windows.

class MacButton implements Button is
    method paint() is
        // Renderizar boton estilo macOS.

class WinCheckbox implements Checkbox is
    method paint() is
        // Renderizar checkbox estilo Windows.

class MacCheckbox implements Checkbox is
    method paint() is
        // Renderizar checkbox estilo macOS.

// El cliente trabaja solo con tipos abstractos
class Application is
    private field factory: GUIFactory
    private field button: Button

    constructor Application(factory: GUIFactory) is
        this.factory = factory

    method createUI() is
        this.button = factory.createButton()

    method paint() is
        button.paint()

// La aplicacion selecciona la fabrica segun configuracion
class ApplicationConfigurator is
    method main() is
        config = readApplicationConfigFile()
        if (config.OS == "Windows") then
            factory = new WinFactory()
        else if (config.OS == "Mac") then
            factory = new MacFactory()
        else
            throw new Exception("Error! SO desconocido.")
        Application app = new Application(factory)
```

## Aplicabilidad

- **Usar cuando:** tu codigo necesita trabajar con varias familias de productos relacionados, pero no quieres que dependa de las clases concretas de esos productos (pueden ser desconocidas de antemano o simplemente quieres permitir extensibilidad futura); cuando tienes una clase con un conjunto de Factory Methods que desdibujan su responsabilidad principal.
- **No usar cuando:** los productos de las diferentes familias no estan relacionados entre si; solo hay una familia de productos y no se preveen nuevas variantes; la complejidad adicional de interfaces y clases no se justifica para el problema.

## Ventajas y Desventajas

- Se garantiza que los productos obtenidos de una fabrica son compatibles entre si.
- Se evita el acoplamiento fuerte entre productos concretos y el codigo cliente.
- *Principio de Responsabilidad Unica*: se centraliza el codigo de creacion de productos.
- *Principio Abierto/Cerrado*: se pueden introducir nuevas variantes de productos sin romper el codigo existente.
- El codigo puede volverse mas complicado de lo necesario, ya que se introducen muchas interfaces y clases nuevas junto con el patron.

## Relaciones con otros patrones

- Muchos disenos comienzan con **Factory Method** y evolucionan hacia **Abstract Factory**, **Prototype** o **Builder**.
- **Builder** se enfoca en construir objetos complejos paso a paso. **Abstract Factory** se especializa en crear familias de objetos relacionados. Abstract Factory retorna el producto inmediatamente, mientras que Builder permite ejecutar pasos de construccion adicionales antes de obtener el producto.
- Las clases de **Abstract Factory** frecuentemente se basan en un conjunto de **Factory Methods**, pero tambien pueden usar **Prototype** para componer los metodos.
- **Abstract Factory** puede servir como alternativa a **Facade** cuando solo se quiere ocultar la forma en que se crean los objetos del subsistema desde el codigo cliente.
- Se puede usar **Abstract Factory** junto con **Bridge** cuando algunas abstracciones definidas por Bridge solo funcionan con implementaciones especificas.
- **Abstract Factories**, **Builders** y **Prototypes** pueden todos implementarse como **Singletons**.
