# Prototype

## Intencion

Prototype (tambien conocido como Clone) es un patron de diseno creacional que permite copiar objetos existentes sin hacer que tu codigo dependa de sus clases. Delega el proceso de clonacion a los propios objetos que se estan clonando, mediante una interfaz comun.

## Problema

Supongamos que tienes un objeto y quieres crear una copia exacta de el. Primero, debes crear un nuevo objeto de la misma clase. Luego, recorrer todos los campos del objeto original y copiar sus valores al nuevo objeto. Pero hay un problema: no todos los objetos pueden copiarse asi, porque algunos campos pueden ser privados y no visibles desde fuera del objeto. Ademas, al necesitar conocer la clase del objeto para crear un duplicado, tu codigo se vuelve dependiente de esa clase. A veces solo conoces la interfaz que el objeto sigue, pero no su clase concreta.

## Solucion

El patron Prototype delega el proceso de clonacion a los propios objetos. Declara una interfaz comun para todos los objetos que soportan clonacion, tipicamente con un unico metodo `clone`. La implementacion de `clone` crea un nuevo objeto de la clase actual y copia todos los valores de los campos del objeto original al nuevo. Se pueden copiar incluso campos privados porque la mayoria de lenguajes permiten que los objetos accedan a campos privados de otros objetos de la misma clase. Un objeto que soporta clonacion se llama *prototipo*. Cuando los objetos tienen docenas de campos y cientos de configuraciones posibles, clonarlos puede ser una alternativa a la creacion de subclases.

## Estructura

- **Prototype (interfaz)**: Declara los metodos de clonacion. En la mayoria de casos, es un unico metodo `clone`.
- **Concrete Prototype**: Implementa el metodo de clonacion. Ademas de copiar los datos del objeto original al clon, puede manejar casos limite como clonar objetos enlazados y desenredar dependencias recursivas.
- **SubclassPrototype**: Las subclases pueden extender el metodo clone llamando al constructor padre con `super` y luego copiando sus propios campos adicionales.
- **Client**: Puede producir una copia de cualquier objeto que siga la interfaz prototype.
- **Prototype Registry** (opcional): Proporciona acceso facil a prototipos frecuentemente usados. Almacena un conjunto de objetos pre-construidos listos para ser copiados (mapa `nombre -> prototipo`).

## Pseudocodigo

```pseudocode
// Prototipo base
abstract class Shape is
    field X: int
    field Y: int
    field color: string

    // Constructor regular
    constructor Shape() is
        // ...

    // Constructor prototipo: inicializa nuevo objeto con valores del existente
    constructor Shape(source: Shape) is
        this()
        this.X = source.X
        this.Y = source.Y
        this.color = source.color

    abstract method clone():Shape

// Prototipo concreto: Rectangle
class Rectangle extends Shape is
    field width: int
    field height: int

    constructor Rectangle(source: Rectangle) is
        super(source)
        this.width = source.width
        this.height = source.height

    method clone():Shape is
        return new Rectangle(this)

// Prototipo concreto: Circle
class Circle extends Shape is
    field radius: int

    constructor Circle(source: Circle) is
        super(source)
        this.radius = source.radius

    method clone():Shape is
        return new Circle(this)

// Uso en el cliente
class Application is
    field shapes: array of Shape

    constructor Application() is
        Circle circle = new Circle()
        circle.X = 10
        circle.Y = 10
        circle.radius = 20
        shapes.add(circle)

        Circle anotherCircle = circle.clone()
        shapes.add(anotherCircle)

        Rectangle rectangle = new Rectangle()
        rectangle.width = 10
        rectangle.height = 20
        shapes.add(rectangle)

    method businessLogic() is
        Array shapesCopy = new Array of Shapes
        // Clonamos sin conocer los tipos concretos
        foreach (s in shapes) do
            shapesCopy.add(s.clone())
```

## Aplicabilidad

- **Usar cuando:** tu codigo no debe depender de las clases concretas de los objetos que necesitas copiar; quieres reducir el numero de subclases que solo difieren en la forma en que inicializan sus objetos (usar prototipos pre-configurados como alternativa a la instanciacion de subclases).
- **No usar cuando:** los objetos son simples y faciles de construir desde cero; los objetos contienen referencias circulares complejas que dificultan la clonacion; no se necesitan copias de objetos en el sistema.

## Ventajas y Desventajas

- Se pueden clonar objetos sin acoplarse a sus clases concretas.
- Se elimina el codigo de inicializacion repetido en favor de clonar prototipos pre-construidos.
- Se pueden producir objetos complejos de forma mas conveniente.
- Se obtiene una alternativa a la herencia al manejar configuraciones preestablecidas para objetos complejos.
- Clonar objetos complejos que tienen referencias circulares puede ser muy complicado.

## Relaciones con otros patrones

- Muchos disenos comienzan con **Factory Method** y evolucionan hacia **Abstract Factory**, **Prototype** o **Builder**.
- Las clases de **Abstract Factory** frecuentemente se basan en **Factory Methods**, pero tambien pueden usar **Prototype** para componer los metodos.
- **Prototype** puede ayudar cuando se necesitan guardar copias de **Commands** en un historial.
- Los disenos que usan mucho **Composite** y **Decorator** a menudo se benefician de **Prototype**, ya que permite clonar estructuras complejas en lugar de reconstruirlas desde cero.
- **Prototype** no se basa en herencia (sin sus desventajas), pero requiere una inicializacion complicada del objeto clonado. **Factory Method** se basa en herencia pero no requiere inicializacion.
- A veces **Prototype** puede ser una alternativa mas simple a **Memento** cuando el estado del objeto a almacenar es sencillo.
- **Abstract Factories**, **Builders** y **Prototypes** pueden todos implementarse como **Singletons**.
