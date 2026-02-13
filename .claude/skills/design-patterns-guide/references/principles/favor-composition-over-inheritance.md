# Favorecer Composicion sobre Herencia

## Intencion
Este principio sugiere que en lugar de reutilizar codigo mediante herencia (relacion "es un"), se prefiera la composicion (relacion "tiene un"). La composicion permite ensamblar comportamientos delegando trabajo a otros objetos, evitando los problemas inherentes a las jerarquias de herencia profundas.

## Problema
La herencia, aunque es la forma mas obvia de reutilizar codigo, tiene problemas serios que se manifiestan cuando el programa crece:

- Una subclase no puede reducir la interfaz de la superclase: debe implementar todos los metodos abstractos aunque no los use
- Al sobrescribir metodos, se debe asegurar compatibilidad con el comportamiento base
- La herencia rompe la encapsulacion de la superclase: los detalles internos quedan expuestos a las subclases
- Las subclases estan fuertemente acopladas a las superclases: cualquier cambio en la superclase puede romper las subclases
- Cuando hay multiples dimensiones de variacion, la herencia produce una explosion combinatoria de subclases

## Solucion
Utilizar composicion: en lugar de que los objetos implementen un comportamiento por si mismos, delegan ese trabajo a otros objetos. Las diferentes "dimensiones" de funcionalidad se extraen a sus propias jerarquias de clases, y el objeto principal referencia objetos de esas jerarquias. Se puede incluso reemplazar comportamientos en tiempo de ejecucion.

## Pseudocodigo

### Antes (sin aplicar el principio)
```pseudocode
// Explosion combinatoria con herencia
class Transport
class Truck extends Transport
class ElectricTruck extends Truck
class CombustionEngineTruck extends Truck
class AutopilotElectricTruck extends ElectricTruck
class AutopilotCombustionEngineTruck extends CombustionEngineTruck
class Car extends Transport
class ElectricCar extends Car
class CombustionEngineCar extends Car
class AutopilotElectricCar extends ElectricCar
class AutopilotCombustionEngineCar extends CombustionEngineCar
// ... la jerarquia crece exponencialmente
```

### Despues (aplicando el principio)
```pseudocode
interface Engine
    method move()

class CombustionEngine implements Engine
    method move() is // ...

class ElectricEngine implements Engine
    method move() is // ...

interface Driver
    method navigate()

class Robot implements Driver
    method navigate() is // ...

class Human implements Driver
    method navigate() is // ...

class Transport
    - engine: Engine
    - driver: Driver

    method deliver(destination, cargo) is
        engine.move()
        driver.navigate()
```

## Aplicabilidad
- **Usar cuando:** existen multiples dimensiones de variacion que causarian una explosion de subclases; se necesita cambiar comportamientos en tiempo de ejecucion; se quiere reutilizar comportamientos en clases no relacionadas jerarquicamente; las subclases solo necesitan parte de la funcionalidad de la superclase.
- **No usar cuando:** existe una relacion natural "es un" clara y estable; la jerarquia es simple y poco profunda (1-2 niveles); no hay necesidad de intercambiar comportamientos; la composicion agregaria complejidad innecesaria al diseno.

## Relaciones con otros patrones/principios
- Es la base del patron **Strategy**: los comportamientos se extraen a clases separadas con interfaces comunes y se componen en el objeto principal.
- Se relaciona con el patron **Bridge**: separa abstracciones de implementaciones usando composicion.
- Complementa **Encapsular lo que Varia**: cada dimension de variacion se encapsula en su propia jerarquia de clases.
- Apoya el principio de **Programar hacia una Interfaz**: los objetos compuestos se referencian mediante interfaces, no clases concretas.
