# Visitor

## Intencion

Visitor es un patron de diseno de comportamiento que permite separar algoritmos de los objetos sobre los cuales operan. Permite agregar nuevos comportamientos a una jerarquia de clases existente sin modificar el codigo de esas clases.

## Problema

Un equipo desarrolla una aplicacion que trabaja con informacion geografica estructurada como un grafo enorme. Cada nodo puede representar una ciudad, industria, zona turistica, etc. Se necesita exportar el grafo a formato XML, pero el arquitecto del sistema se niega a modificar las clases de nodos existentes porque el codigo ya esta en produccion. Ademas, no tiene sentido poner la logica de exportacion XML dentro de las clases de nodos, cuya responsabilidad principal es trabajar con geodatos. Peor aun, si despues se pide exportar a otro formato, habria que cambiar esas clases fragiles otra vez.

## Solucion

El patron Visitor sugiere colocar el nuevo comportamiento en una clase separada llamada *visitor*, en lugar de integrarlo en las clases existentes. El objeto original que debia ejecutar el comportamiento se pasa como argumento a uno de los metodos del visitor. La clase visitor puede definir multiples metodos, cada uno tomando argumentos de diferentes tipos.

Para resolver el problema de seleccionar el metodo correcto del visitor, el patron usa una tecnica llamada **Double Dispatch**: en lugar de que el cliente seleccione la version del metodo, delegamos esa eleccion a los objetos que pasamos al visitor como argumento. Los objetos "aceptan" un visitor y le indican que metodo debe ejecutarse. Si se extrae una interfaz comun para todos los visitors, todos los nodos existentes pueden trabajar con cualquier visitor que se introduzca en la aplicacion.

## Estructura

- **Visitor**: Interfaz que declara un conjunto de metodos de visita que pueden tomar elementos concretos de la estructura de objetos como argumentos (`visit(e: ElementA)`, `visit(e: ElementB)`).
- **Concrete Visitor (Visitor Concreto)**: Implementa varias versiones del mismo comportamiento, adaptadas para diferentes clases de elementos concretos.
- **Element (Elemento)**: Interfaz que declara un metodo `accept(v: Visitor)` para "aceptar" visitantes.
- **Concrete Element (Elemento Concreto)**: Debe implementar el metodo de aceptacion, redirigiendo la llamada al metodo apropiado del visitor correspondiente a su clase (`v.visitX(this)`).
- **Client**: Generalmente representa una coleccion u otra estructura compleja (por ejemplo, un arbol Composite). Trabaja con objetos a traves de la interfaz abstracta del elemento.

## Pseudocodigo

```pseudocode
// La interfaz del elemento declara un metodo `accept` que toma
// la interfaz base del visitor como argumento.
interface Shape is
    method move(x, y)
    method draw()
    method accept(v: Visitor)

// Cada elemento concreto implementa `accept` llamando al metodo
// del visitor que corresponde a su clase.
class Dot implements Shape is
    method accept(v: Visitor) is
        v.visitDot(this)

class Circle implements Shape is
    method accept(v: Visitor) is
        v.visitCircle(this)

class Rectangle implements Shape is
    method accept(v: Visitor) is
        v.visitRectangle(this)

class CompoundShape implements Shape is
    method accept(v: Visitor) is
        v.visitCompoundShape(this)

// La interfaz Visitor declara metodos de visita por cada clase
// de elemento. La firma del metodo permite identificar la clase exacta.
interface Visitor is
    method visitDot(d: Dot)
    method visitCircle(c: Circle)
    method visitRectangle(r: Rectangle)
    method visitCompoundShape(cs: CompoundShape)

// Los visitors concretos implementan varias versiones del algoritmo
// que pueden trabajar con todas las clases de elementos concretos.
class XMLExportVisitor implements Visitor is
    method visitDot(d: Dot) is
        // Exportar ID y coordenadas del centro del punto.
    method visitCircle(c: Circle) is
        // Exportar ID, coordenadas del centro y radio.
    method visitRectangle(r: Rectangle) is
        // Exportar ID, coordenadas superior-izquierda, ancho y alto.
    method visitCompoundShape(cs: CompoundShape) is
        // Exportar ID de la forma y lista de IDs de sus hijos.

// El cliente puede ejecutar operaciones del visitor sobre cualquier
// conjunto de elementos sin conocer sus clases concretas.
class Application is
    field allShapes: array of Shapes

    method export() is
        exportVisitor = new XMLExportVisitor()
        foreach (shape in allShapes) do
            shape.accept(exportVisitor)
```

## Aplicabilidad

- **Usar cuando:** se necesita ejecutar una operacion sobre todos los elementos de una estructura de objetos compleja (por ejemplo, un arbol de objetos).
- **Usar cuando:** se desea limpiar la logica de negocio de comportamientos auxiliares, manteniendo las clases principales enfocadas en su trabajo principal.
- **Usar cuando:** un comportamiento tiene sentido solo en algunas clases de una jerarquia, pero no en otras.
- **No usar cuando:** la jerarquia de elementos cambia frecuentemente, ya que se deben actualizar todos los visitors cada vez que se agrega o elimina una clase.
- **No usar cuando:** los visitors necesitan acceso a campos y metodos privados de los elementos con los que trabajan.

## Ventajas y Desventajas

- Principio de Abierto/Cerrado: se puede introducir un nuevo comportamiento que trabaje con objetos de diferentes clases sin cambiar esas clases.
- Principio de Responsabilidad Unica: se pueden mover multiples versiones del mismo comportamiento a una misma clase.
- Un objeto visitor puede acumular informacion util mientras trabaja con varios objetos, lo cual es practico al recorrer estructuras complejas como arboles de objetos.
- Se deben actualizar todos los visitors cada vez que una clase se agrega o elimina de la jerarquia de elementos.
- Los visitors pueden carecer del acceso necesario a campos y metodos privados de los elementos.

## Relaciones con otros patrones

- Se puede tratar a **Visitor** como una version poderosa del patron **Command**. Sus objetos pueden ejecutar operaciones sobre diversos objetos de diferentes clases.
- Se puede usar **Visitor** para ejecutar una operacion sobre un arbol **Composite** completo.
- Se puede usar **Visitor** junto con **Iterator** para recorrer una estructura de datos compleja y ejecutar alguna operacion sobre sus elementos, aunque todos tengan clases diferentes.
