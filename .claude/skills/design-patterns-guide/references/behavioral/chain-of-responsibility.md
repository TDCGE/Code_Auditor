# Chain of Responsibility

## Intencion
Permite pasar solicitudes a lo largo de una cadena de manejadores (handlers). Al recibir una solicitud, cada manejador decide si la procesa o si la pasa al siguiente manejador en la cadena. Desacopla al emisor de la solicitud de sus receptores concretos.

## Problema
En un sistema de pedidos en linea se necesitan multiples verificaciones secuenciales: autenticacion, autorizacion, validacion de datos, cache, etc. Al implementar todas estas verificaciones dentro de un solo bloque de codigo, el sistema se vuelve fragil, dificil de mantener y con alto acoplamiento. Cambiar una verificacion afecta a las demas, y reutilizar verificaciones individuales en otros contextos requiere duplicar codigo.

## Solucion
El patron transforma cada verificacion en un objeto independiente llamado *handler*. Cada handler tiene un metodo para procesar la solicitud y una referencia al siguiente handler en la cadena. La solicitud viaja por la cadena hasta que un handler la procesa o hasta que llega al final. Un handler puede decidir no pasar la solicitud mas adelante, deteniendo el procesamiento.

## Estructura
- **Participantes**:
  - **Handler (interfaz)**: Declara el metodo `handle(request)` y opcionalmente `setNext(handler)` para construir la cadena.
  - **BaseHandler (clase abstracta)**: Implementa el comportamiento por defecto de almacenar la referencia al siguiente handler y delegar la solicitud si existe.
  - **ConcreteHandlers**: Contienen la logica real de procesamiento. Deciden si procesan la solicitud y si la pasan al siguiente.
  - **Client**: Compone la cadena y envia solicitudes al primer handler (o a cualquier handler de la cadena).

## Pseudocodigo

```pseudocode
interface ComponentWithContextualHelp is
    method showHelp()

abstract class Component implements ComponentWithContextualHelp is
    field tooltipText: string
    protected field container: Container

    method showHelp() is
        if (tooltipText != null)
            // Mostrar tooltip.
        else
            container.showHelp()

abstract class Container extends Component is
    protected field children: array of Component
    method add(child) is
        children.add(child)
        child.container = this

class Button extends Component is
    // ...

class Panel extends Container is
    field modalHelpText: string
    method showHelp() is
        if (modalHelpText != null)
            // Mostrar ventana modal con texto de ayuda.
        else
            super.showHelp()

class Dialog extends Container is
    field wikiPageURL: string
    method showHelp() is
        if (wikiPageURL != null)
            // Abrir pagina wiki de ayuda.
        else
            super.showHelp()

// Cliente
class Application is
    method createUI() is
        dialog = new Dialog("Budget Reports")
        dialog.wikiPageURL = "http://..."
        panel = new Panel(0, 0, 400, 800)
        panel.modalHelpText = "Este panel hace..."
        ok = new Button(250, 760, 50, 20, "OK")
        ok.tooltipText = "Este boton OK..."
        panel.add(ok)
        dialog.add(panel)

    method onF1KeyPress() is
        component = this.getComponentAtMouseCoords()
        component.showHelp()
```

## Aplicabilidad
- **Usar cuando:** el programa debe procesar distintos tipos de solicitudes de varias maneras, pero los tipos exactos y su secuencia no se conocen de antemano.
- **Usar cuando:** es esencial ejecutar varios handlers en un orden particular.
- **Usar cuando:** el conjunto de handlers y su orden deben poder cambiar en tiempo de ejecucion.
- **No usar cuando:** cada solicitud siempre tiene un unico receptor conocido de antemano (no se necesita cadena).
- **No usar cuando:** el procesamiento no es secuencial ni delegable.

## Ventajas y Desventajas
- Ventaja: Se puede controlar el orden de manejo de solicitudes.
- Ventaja: *Principio de Responsabilidad Unica*: se desacoplan las clases que invocan operaciones de las que las ejecutan.
- Ventaja: *Principio Abierto/Cerrado*: se pueden agregar nuevos handlers sin modificar el codigo cliente existente.
- Desventaja: Algunas solicitudes pueden quedar sin procesar si ningun handler las maneja.

## Relaciones con otros patrones
- **Chain of Responsibility**, **Command**, **Mediator** y **Observer** abordan distintas formas de conectar emisores y receptores de solicitudes.
- Se usa frecuentemente junto con **Composite**: cuando un componente hoja recibe una solicitud, puede pasarla a traves de la cadena de componentes padres hasta la raiz del arbol.
- Los handlers en CoR pueden implementarse como **Commands**, ejecutando diferentes operaciones sobre el mismo contexto.
- **Chain of Responsibility** y **Decorator** tienen estructuras de clases similares (composicion recursiva), pero los handlers de CoR pueden ejecutar operaciones independientemente y detener la cadena, mientras que los Decorators extienden el comportamiento manteniendo la interfaz base.
