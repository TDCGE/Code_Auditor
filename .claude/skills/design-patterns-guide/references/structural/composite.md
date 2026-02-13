# Composite

*Tambien conocido como: Object Tree*

## Intencion

Composite es un patron de diseno estructural que permite componer objetos en estructuras de arbol y luego trabajar con esas estructuras como si fueran objetos individuales. Permite al codigo cliente tratar de manera uniforme tanto elementos simples como contenedores complejos a traves de una interfaz comun.

## Problema

El patron Composite tiene sentido cuando el modelo central de la aplicacion puede representarse como un arbol. Por ejemplo, imagina dos tipos de objetos: `Products` y `Boxes`. Una `Box` puede contener varios `Products` y otras `Boxes` mas pequenas. Si se quiere calcular el precio total de un pedido que contiene productos sueltos y cajas anidadas con mas productos, el enfoque directo resulta complicado porque se necesita conocer las clases concretas, los niveles de anidacion y otros detalles.

## Solucion

Composite sugiere trabajar con `Products` y `Boxes` a traves de una interfaz comun que declara un metodo para calcular el precio total. Para un producto, simplemente retorna su precio. Para una caja, recorre cada elemento que contiene, pregunta su precio y retorna el total. Si uno de los elementos es otra caja, se invoca recursivamente el mismo proceso hasta que se calculan todos los componentes internos.

## Estructura

- **Component** (interfaz): describe operaciones comunes tanto para elementos simples como complejos del arbol.
- **Leaf**: elemento basico del arbol que no tiene sub-elementos. Generalmente realiza la mayor parte del trabajo real.
- **Composite** (Container): elemento que tiene sub-elementos (hojas u otros contenedores). Trabaja con sus hijos solo a traves de la interfaz del componente. Al recibir una solicitud, delega el trabajo a sus sub-elementos, procesa resultados intermedios y retorna el resultado final.
- **Client**: trabaja con todos los elementos a traves de la interfaz del componente, tanto con elementos simples como complejos.

## Pseudocodigo

```pseudocode
// La interfaz del componente declara operaciones comunes
interface Graphic is
    method move(x, y)
    method draw()

// Clase hoja: representa objetos finales de la composicion
class Dot implements Graphic is
    field x, y
    constructor Dot(x, y) { ... }
    method move(x, y) is
        this.x += x, this.y += y
    method draw() is
        // Dibuja un punto en X e Y.

class Circle extends Dot is
    field radius
    constructor Circle(x, y, radius) { ... }
    method draw() is
        // Dibuja un circulo en X e Y con radio R.

// Clase compuesta: puede contener otros componentes
class CompoundGraphic implements Graphic is
    field children: array of Graphic
    method add(child: Graphic) is
        // Agrega un hijo al arreglo de hijos.
    method remove(child: Graphic) is
        // Elimina un hijo del arreglo de hijos.
    method move(x, y) is
        foreach (child in children) do
            child.move(x, y)
    method draw() is
        // 1. Para cada hijo: dibujar el componente.
        // 2. Dibujar un rectangulo delimitador.

// Codigo cliente
class ImageEditor is
    field all: CompoundGraphic
    method load() is
        all = new CompoundGraphic()
        all.add(new Dot(1, 2))
        all.add(new Circle(5, 3, 10))
    method groupSelected(components: array of Graphic) is
        group = new CompoundGraphic()
        foreach (component in components) do
            group.add(component)
            all.remove(component)
        all.add(group)
        all.draw()
```

## Aplicabilidad

- **Usar cuando:** se necesita implementar una estructura de objetos tipo arbol; se quiere que el codigo cliente trate de forma uniforme tanto elementos simples como compuestos.
- **No usar cuando:** la funcionalidad de las clases difiere demasiado entre si, lo que obligaria a sobre-generalizar la interfaz del componente; el modelo de datos no tiene una estructura jerarquica natural.

## Ventajas y Desventajas

- Se trabaja con estructuras de arbol complejas de forma conveniente usando polimorfismo y recursion.
- Principio Abierto/Cerrado: se pueden introducir nuevos tipos de elementos sin romper el codigo existente que trabaja con el arbol.
- Puede ser dificil proporcionar una interfaz comun para clases cuya funcionalidad difiere demasiado, lo que lleva a sobre-generalizar la interfaz.

## Relaciones con otros patrones

- Se puede usar **Builder** para crear arboles **Composite** complejos, ya que sus pasos de construccion pueden programarse para trabajar recursivamente.
- **Chain of Responsibility** se usa frecuentemente junto con **Composite**: cuando un componente hoja recibe una solicitud, puede pasarla a traves de la cadena de componentes padre hasta la raiz del arbol.
- Se pueden usar **Iterators** para recorrer arboles **Composite**.
- Se puede usar **Visitor** para ejecutar una operacion sobre un arbol **Composite** completo.
- Los nodos hoja compartidos del arbol **Composite** pueden implementarse como **Flyweights** para ahorrar RAM.
- **Composite** y **Decorator** tienen diagramas de estructura similares (composicion recursiva), pero **Decorator** solo tiene un hijo y agrega responsabilidades, mientras que **Composite** "suma" los resultados de sus hijos. Sin embargo, pueden cooperar: se puede usar **Decorator** para extender el comportamiento de un objeto especifico dentro del arbol **Composite**.
