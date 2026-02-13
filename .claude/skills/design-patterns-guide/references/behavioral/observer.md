# Observer

*Tambien conocido como: Event-Subscriber, Listener*

## Intencion

Observer es un patron de diseno de comportamiento que permite definir un mecanismo de suscripcion para notificar a multiples objetos sobre cualquier evento que ocurra en el objeto que estan observando. Establece una dependencia uno-a-muchos entre objetos, de modo que cuando un objeto cambia de estado, todos sus dependientes son notificados automaticamente.

## Problema

Imagina que tienes dos tipos de objetos: un `Cliente` y una `Tienda`. El cliente esta interesado en un producto que pronto estara disponible. El cliente podria visitar la tienda todos los dias para verificar la disponibilidad, pero la mayoria de esos viajes serian inutiles. Por otro lado, la tienda podria enviar correos a todos los clientes cada vez que hay un nuevo producto, pero esto molestaria a quienes no estan interesados. Hay un conflicto: o el cliente pierde tiempo verificando, o la tienda desperdicia recursos notificando a los clientes equivocados.

## Solucion

El patron Observer sugiere agregar un mecanismo de suscripcion a la clase publicadora (publisher) para que objetos individuales puedan suscribirse o desuscribirse de un flujo de eventos. Este mecanismo consiste en: 1) un arreglo para almacenar referencias a los objetos suscriptores, y 2) metodos publicos para agregar y eliminar suscriptores de esa lista. Cuando ocurre un evento importante, el publicador recorre sus suscriptores y llama al metodo de notificacion en cada uno. Todos los suscriptores implementan la misma interfaz para que el publicador no este acoplado a sus clases concretas.

## Estructura

- **Publisher (Publicador)**: Emite eventos de interes. Contiene una lista de suscriptores y metodos `subscribe()`, `unsubscribe()` y `notifySubscribers()`.
- **Subscriber (Suscriptor)**: Interfaz que declara el metodo de notificacion `update(context)`.
- **Concrete Subscribers (Suscriptores Concretos)**: Realizan acciones en respuesta a las notificaciones del publicador. Implementan la interfaz Subscriber.
- **Client**: Crea los objetos publicador y suscriptor por separado y registra los suscriptores.

## Pseudocodigo

```pseudocode
// Clase base del publicador con gestion de suscripciones
class EventManager is
    private field listeners: hash map de tipos de evento y listeners

    method subscribe(eventType, listener) is
        listeners.add(eventType, listener)

    method unsubscribe(eventType, listener) is
        listeners.remove(eventType, listener)

    method notify(eventType, data) is
        foreach (listener in listeners.of(eventType)) do
            listener.update(data)

// Publicador concreto que usa composicion para la suscripcion
class Editor is
    public field events: EventManager
    private field file: File

    constructor Editor() is
        events = new EventManager()

    method openFile(path) is
        this.file = new File(path)
        events.notify("open", file.name)

    method saveFile() is
        file.write()
        events.notify("save", file.name)

// Interfaz del suscriptor
interface EventListener is
    method update(filename)

// Suscriptores concretos
class LoggingListener implements EventListener is
    private field log: File
    private field message: string

    method update(filename) is
        log.write(replace('%s', filename, message))

class EmailAlertsListener implements EventListener is
    private field email: string
    private field message: string

    method update(filename) is
        system.email(email, replace('%s', filename, message))

// Configuracion de la aplicacion
class Application is
    method config() is
        editor = new Editor()
        logger = new LoggingListener("/path/to/log.txt", "Someone has opened the file: %s")
        editor.events.subscribe("open", logger)
        emailAlerts = new EmailAlertsListener("admin@example.com", "Someone has changed the file: %s")
        editor.events.subscribe("save", emailAlerts)
```

## Aplicabilidad

- **Usar cuando:** los cambios en el estado de un objeto requieren cambiar otros objetos, y el conjunto real de objetos es desconocido de antemano o cambia dinamicamente.
- **Usar cuando:** algunos objetos de tu app deben observar a otros, pero solo por un tiempo limitado o en casos especificos.
- **No usar cuando:** los suscriptores necesitan ser notificados en un orden especifico garantizado (los suscriptores se notifican en orden aleatorio).
- **No usar cuando:** solo hay un observador fijo y conocido de antemano; la indirecta del patron agrega complejidad innecesaria.

## Ventajas y Desventajas

- Principio de Abierto/Cerrado: se pueden introducir nuevas clases suscriptoras sin cambiar el codigo del publicador.
- Se pueden establecer relaciones entre objetos en tiempo de ejecucion.
- Los suscriptores son notificados en orden aleatorio, lo cual puede ser impredecible.

## Relaciones con otros patrones

- **Chain of Responsibility**, **Command**, **Mediator** y **Observer** abordan distintas formas de conectar emisores y receptores de solicitudes. Observer permite que los receptores se suscriban y desuscriban dinamicamente.
- La diferencia entre **Mediator** y **Observer** suele ser sutil. Mediator elimina dependencias mutuas centralizando la comunicacion. Observer establece conexiones unidireccionales dinamicas. Una implementacion popular de Mediator se basa en Observer, donde el mediador actua como publicador y los componentes como suscriptores.
