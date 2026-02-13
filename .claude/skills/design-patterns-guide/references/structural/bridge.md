# Bridge

## Intencion

Bridge es un patron de diseno estructural que permite dividir una clase grande, o un conjunto de clases estrechamente relacionadas, en dos jerarquias separadas -- abstraccion e implementacion -- que pueden desarrollarse de forma independiente una de la otra. Esto evita la explosion combinatoria de subclases al extender funcionalidad en multiples dimensiones.

## Problema

Supongamos que tienes una clase geometrica `Shape` con subclases `Circle` y `Square`. Quieres incorporar colores (`Red`, `Blue`), lo que te obliga a crear combinaciones como `RedCircle`, `BlueSquare`, etc. Agregar nuevas formas o colores hace crecer la jerarquia exponencialmente. Este problema ocurre cuando se intenta extender clases en dos dimensiones independientes (forma y color) usando solo herencia.

## Solucion

Bridge resuelve este problema cambiando de herencia a composicion de objetos. Se extrae una de las dimensiones en una jerarquia de clases separada, y las clases originales referencian un objeto de la nueva jerarquia en lugar de tener todo el estado y comportamiento internamente.

La **Abstraccion** es una capa de control de alto nivel que delega el trabajo real a la capa de **Implementacion** (tambien llamada plataforma). En aplicaciones reales, la abstraccion puede ser la GUI y la implementacion la API del sistema operativo subyacente.

## Estructura

- **Abstraction**: proporciona logica de control de alto nivel. Contiene una referencia a un objeto de implementacion y le delega el trabajo de bajo nivel.
- **Implementation** (interfaz): declara la interfaz comun para todas las implementaciones concretas. La abstraccion solo se comunica con la implementacion a traves de los metodos declarados aqui.
- **Concrete Implementations**: contienen codigo especifico de cada plataforma.
- **Refined Abstraction** (opcional): proporcionan variantes de la logica de control, trabajando con diferentes implementaciones via la interfaz general.
- **Client**: vincula el objeto de abstraccion con uno de los objetos de implementacion.

## Pseudocodigo

```pseudocode
// La "abstraccion" define la interfaz del "control"
class RemoteControl is
    protected field device: Device
    constructor RemoteControl(device: Device) is
        this.device = device
    method togglePower() is
        if (device.isEnabled()) then
            device.disable()
        else
            device.enable()
    method volumeDown() is
        device.setVolume(device.getVolume() - 10)
    method volumeUp() is
        device.setVolume(device.getVolume() + 10)
    method channelDown() is
        device.setChannel(device.getChannel() - 1)
    method channelUp() is
        device.setChannel(device.getChannel() + 1)

// Se extiende la abstraccion independientemente de los dispositivos
class AdvancedRemoteControl extends RemoteControl is
    method mute() is
        device.setVolume(0)

// La interfaz de "implementacion" declara metodos primitivos
interface Device is
    method isEnabled()
    method enable()
    method disable()
    method getVolume()
    method setVolume(percent)
    method getChannel()
    method setChannel(channel)

// Todos los dispositivos siguen la misma interfaz
class Tv implements Device is
    // ...

class Radio implements Device is
    // ...

// Codigo cliente
tv = new Tv()
remote = new RemoteControl(tv)
remote.togglePower()

radio = new Radio()
remote = new AdvancedRemoteControl(radio)
```

## Aplicabilidad

- **Usar cuando:** se quiere dividir y organizar una clase monolitica que tiene variantes de funcionalidad (ej. que trabaja con distintos servidores de base de datos); se necesita extender una clase en varias dimensiones ortogonales (independientes); se necesita poder cambiar implementaciones en tiempo de ejecucion.
- **No usar cuando:** la clase es altamente cohesiva y no tiene dimensiones independientes que separar; la complejidad adicional no se justifica por el tamano del proyecto.

## Ventajas y Desventajas

- Se pueden crear clases y aplicaciones independientes de la plataforma.
- El codigo cliente trabaja con abstracciones de alto nivel sin exponerse a detalles de plataforma.
- Principio Abierto/Cerrado: se pueden introducir nuevas abstracciones e implementaciones de forma independiente.
- Principio de Responsabilidad Unica: logica de alto nivel en la abstraccion, detalles de plataforma en la implementacion.
- Se puede complicar el codigo si se aplica a una clase que ya es altamente cohesiva.

## Relaciones con otros patrones

- **Bridge** se disena desde el inicio; **Adapter** se usa con aplicaciones existentes para hacer compatibles clases que de otro modo no lo serian.
- **Bridge**, **State**, **Strategy** (y en cierto grado **Adapter**) tienen estructuras similares basadas en composicion, pero resuelven problemas diferentes.
- Se puede usar **Abstract Factory** junto con **Bridge** cuando ciertas abstracciones solo pueden trabajar con implementaciones especificas.
- Se puede combinar **Builder** con **Bridge**: la clase director juega el rol de abstraccion y los diferentes builders actuan como implementaciones.
