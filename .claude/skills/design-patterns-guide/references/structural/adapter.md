# Adapter

*Tambien conocido como: Wrapper*

## Intencion

Adapter es un patron de diseno estructural que permite que objetos con interfaces incompatibles colaboren entre si. Actua como un traductor intermedio que convierte la interfaz de un objeto para que otro objeto pueda entenderla sin modificar el codigo original de ninguno de los dos.

## Problema

Imagina que estas creando una aplicacion de monitoreo del mercado de valores. La app descarga datos en formato XML de multiples fuentes y los muestra en graficos. En algun momento decides integrar una biblioteca de analisis de terceros, pero esta solo trabaja con datos en formato JSON. No puedes modificar la biblioteca porque no tienes acceso a su codigo fuente, y cambiarla podria romper otro codigo existente que depende de ella.

## Solucion

Se crea un objeto adaptador que convierte la interfaz de un objeto para que otro pueda entenderlo. El adaptador envuelve uno de los objetos para ocultar la complejidad de la conversion. El objeto envuelto ni siquiera es consciente del adaptador.

El funcionamiento es:
1. El adaptador obtiene una interfaz compatible con uno de los objetos existentes.
2. Usando esta interfaz, el objeto existente puede llamar de forma segura los metodos del adaptador.
3. Al recibir una llamada, el adaptador pasa la solicitud al segundo objeto en el formato y orden que este espera.

Existen dos variantes: **Adaptador de objetos** (usa composicion, envuelve el servicio) y **Adaptador de clases** (usa herencia multiple, hereda de ambas interfaces).

## Estructura

- **Client**: clase que contiene la logica de negocio existente del programa.
- **Client Interface**: protocolo que otras clases deben seguir para colaborar con el codigo cliente.
- **Service**: clase util (generalmente de terceros o legacy) con interfaz incompatible.
- **Adapter**: clase capaz de trabajar tanto con el cliente como con el servicio. Implementa la interfaz del cliente mientras envuelve el objeto servicio.

## Pseudocodigo

```pseudocode
// Clases con interfaces compatibles: RoundHole y RoundPeg
class RoundHole is
    constructor RoundHole(radius) { ... }
    method getRadius() is
        // Retorna el radio del agujero.
    method fits(peg: RoundPeg) is
        return this.getRadius() >= peg.getRadius()

class RoundPeg is
    constructor RoundPeg(radius) { ... }
    method getRadius() is
        // Retorna el radio de la clavija.

// Clase incompatible: SquarePeg
class SquarePeg is
    constructor SquarePeg(width) { ... }
    method getWidth() is
        // Retorna el ancho de la clavija cuadrada.

// Adaptador: permite encajar clavijas cuadradas en agujeros redondos
class SquarePegAdapter extends RoundPeg is
    private field peg: SquarePeg
    constructor SquarePegAdapter(peg: SquarePeg) is
        this.peg = peg
    method getRadius() is
        // Pretende ser una clavija redonda con un radio que
        // pueda contener la clavija cuadrada.
        return peg.getWidth() * Math.sqrt(2) / 2

// Codigo cliente
hole = new RoundHole(5)
small_sqpeg_adapter = new SquarePegAdapter(new SquarePeg(5))
large_sqpeg_adapter = new SquarePegAdapter(new SquarePeg(10))
hole.fits(small_sqpeg_adapter) // true
hole.fits(large_sqpeg_adapter) // false
```

## Aplicabilidad

- **Usar cuando:** se quiere utilizar una clase existente cuya interfaz no es compatible con el resto del codigo; se necesita reutilizar varias subclases que carecen de funcionalidad comun que no se puede agregar a la superclase.
- **No usar cuando:** las interfaces ya son compatibles y no necesitan traduccion; se puede modificar directamente la clase de servicio para que coincida con la interfaz esperada.

## Ventajas y Desventajas

- Principio de Responsabilidad Unica: separa la conversion de interfaz de la logica de negocio principal.
- Principio Abierto/Cerrado: se pueden introducir nuevos adaptadores sin romper el codigo cliente existente.
- La complejidad general del codigo aumenta al introducir nuevas interfaces y clases intermedias.

## Relaciones con otros patrones

- **Bridge** se disena desde el inicio para desarrollar partes de forma independiente; **Adapter** se usa con aplicaciones existentes para hacer que clases incompatibles trabajen juntas.
- **Adapter** cambia la interfaz de un objeto existente; **Decorator** mejora un objeto sin cambiar su interfaz. Ademas, Decorator soporta composicion recursiva, lo cual no es posible con Adapter.
- **Adapter** proporciona una interfaz diferente al objeto envuelto, **Proxy** proporciona la misma interfaz, y **Decorator** una interfaz mejorada.
- **Facade** define una nueva interfaz para un subsistema completo, mientras que **Adapter** intenta hacer utilizable una interfaz existente de un solo objeto.
- **Bridge**, **State**, **Strategy** (y en cierto grado **Adapter**) tienen estructuras muy similares basadas en composicion, pero resuelven problemas diferentes.
