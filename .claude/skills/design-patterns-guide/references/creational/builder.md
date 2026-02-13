# Builder

## Intencion

Builder es un patron de diseno creacional que permite construir objetos complejos paso a paso. El patron permite producir diferentes tipos y representaciones de un objeto usando el mismo codigo de construccion. Separa la construccion de un objeto complejo de su representacion.

## Problema

Imagina un objeto complejo que requiere una inicializacion laboriosa, paso a paso, de muchos campos y objetos anidados. Dicho codigo de inicializacion suele estar enterrado dentro de un constructor monstruoso con muchos parametros, o peor aun, disperso por todo el codigo cliente. Por ejemplo, para crear un objeto `House`: una casa simple necesita paredes, piso, puerta, ventanas y techo. Pero si quieres una casa mas grande con jardin, piscina, calefaccion, etc., la solucion de crear subclases para cada combinacion genera una explosion de subclases. La alternativa de un constructor gigante con todos los parametros posibles produce llamadas ilegibles donde la mayoria de parametros no se usan.

## Solucion

El patron Builder sugiere extraer el codigo de construccion del objeto de su propia clase y moverlo a objetos separados llamados *builders*. La construccion se organiza en un conjunto de pasos (`buildWalls`, `buildDoor`, etc.). Para crear un objeto, se ejecuta una serie de estos pasos sobre un builder. Solo se llaman los pasos necesarios para la configuracion particular deseada. Diferentes builders pueden implementar los mismos pasos de manera diferente para producir distintas representaciones. Opcionalmente, se puede extraer la secuencia de llamadas a los pasos en una clase separada llamada *Director*, que define el orden de ejecucion.

## Estructura

- **Builder (interfaz)**: Declara los pasos de construccion comunes a todos los tipos de builders (ej. `reset`, `setSeats`, `setEngine`, `setGPS`).
- **Concrete Builders**: Proporcionan implementaciones diferentes de los pasos de construccion. Pueden producir productos que no siguen la interfaz comun (ej. `CarBuilder`, `CarManualBuilder`).
- **Products**: Son los objetos resultantes. Los productos construidos por diferentes builders no tienen que pertenecer a la misma jerarquia de clases o interfaz (ej. `Car`, `Manual`).
- **Director**: Define el orden en que se ejecutan los pasos de construccion. Permite crear y reutilizar configuraciones especificas de productos. Es opcional.
- **Client**: Asocia un builder con el director, inicia la construccion y obtiene el resultado del builder.

## Pseudocodigo

```pseudocode
// Interfaz del builder
interface Builder is
    method reset()
    method setSeats(...)
    method setEngine(...)
    method setTripComputer(...)
    method setGPS(...)

// Builder concreto para autos
class CarBuilder implements Builder is
    private field car:Car

    constructor CarBuilder() is
        this.reset()

    method reset() is
        this.car = new Car()

    method setSeats(...) is
        // Establecer numero de asientos.
    method setEngine(...) is
        // Instalar motor.
    method setTripComputer(...) is
        // Instalar computadora de viaje.
    method setGPS(...) is
        // Instalar GPS.

    method getProduct():Car is
        product = this.car
        this.reset()
        return product

// Builder concreto para manuales
class CarManualBuilder implements Builder is
    private field manual:Manual

    constructor CarManualBuilder() is
        this.reset()

    method reset() is
        this.manual = new Manual()

    method setSeats(...) is
        // Documentar caracteristicas de asientos.
    method setEngine(...) is
        // Agregar instrucciones del motor.
    method setTripComputer(...) is
        // Agregar instrucciones de computadora de viaje.
    method setGPS(...) is
        // Agregar instrucciones del GPS.

    method getProduct():Manual is
        // Retornar el manual y resetear el builder.

// El Director define el orden de los pasos
class Director is
    private field builder:Builder

    method setBuilder(builder:Builder)
        this.builder = builder

    method constructSportsCar(builder: Builder) is
        builder.reset()
        builder.setSeats(2)
        builder.setEngine(new SportEngine())
        builder.setTripComputer(true)
        builder.setGPS(true)

    method constructSUV(builder: Builder) is
        // ...

// Uso desde el cliente
class Application is
    method makeCar() is
        director = new Director()

        CarBuilder builder = new CarBuilder()
        director.constructSportsCar(builder)
        Car car = builder.getProduct()

        CarManualBuilder builder = new CarManualBuilder()
        director.constructSportsCar(builder)
        Manual manual = builder.getProduct()
```

## Aplicabilidad

- **Usar cuando:** quieres eliminar un "constructor telescopico" (constructor con muchos parametros opcionales); quieres que tu codigo pueda crear diferentes representaciones de algun producto (ej. casas de piedra y de madera); quieres construir arboles Composite u otros objetos complejos paso a paso.
- **No usar cuando:** el objeto es simple y tiene pocos campos; no se necesitan diferentes representaciones del mismo producto; el overhead de clases adicionales no se justifica.

## Ventajas y Desventajas

- Se pueden construir objetos paso a paso, diferir pasos de construccion o ejecutar pasos recursivamente.
- Se puede reutilizar el mismo codigo de construccion al crear varias representaciones de productos.
- *Principio de Responsabilidad Unica*: se aisla el codigo de construccion complejo de la logica de negocio del producto.
- La complejidad general del codigo aumenta ya que el patron requiere crear multiples clases nuevas.

## Relaciones con otros patrones

- Muchos disenos comienzan con **Factory Method** y evolucionan hacia **Abstract Factory**, **Prototype** o **Builder**.
- **Builder** se enfoca en construir objetos complejos paso a paso. **Abstract Factory** se especializa en crear familias de objetos relacionados. Abstract Factory retorna el producto inmediatamente, mientras que Builder permite pasos adicionales antes de obtener el producto.
- Se puede usar **Builder** para crear arboles **Composite** complejos, ya que sus pasos de construccion pueden programarse para trabajar recursivamente.
- Se puede combinar **Builder** con **Bridge**: la clase director juega el rol de la abstraccion, mientras que los diferentes builders actuan como implementaciones.
- **Abstract Factories**, **Builders** y **Prototypes** pueden todos implementarse como **Singletons**.
