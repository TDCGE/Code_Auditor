# Command

## Intencion
Convierte una solicitud en un objeto independiente que contiene toda la informacion sobre dicha solicitud. Esta transformacion permite pasar solicitudes como argumentos de metodos, retrasar o encolar la ejecucion de una solicitud, y soportar operaciones reversibles (undo/redo).

## Problema
Al desarrollar un editor de texto con una barra de herramientas, se crean multiples subclases de botones (SaveButton, CopyButton, etc.) cada una con su logica de negocio embebida. Esto genera duplicacion de codigo cuando la misma operacion (por ejemplo, copiar) se invoca desde un boton, un menu contextual y un atajo de teclado. Ademas, el codigo GUI queda fuertemente acoplado a la logica de negocio.

## Solucion
El patron sugiere extraer los detalles de cada solicitud (el objeto receptor, el nombre del metodo y los argumentos) en una clase *command* separada con un unico metodo `execute()`. Los objetos GUI (botones, menus, atajos) almacenan una referencia al comando y lo ejecutan al ser activados, sin conocer que objeto de negocio recibira la solicitud ni como se procesara. Los comandos actuan como capa intermedia que desacopla la interfaz grafica de la logica de negocio.

## Estructura
- **Participantes**:
  - **Command (interfaz)**: Declara el metodo `execute()`.
  - **ConcreteCommand**: Implementa `execute()` delegando al receptor. Almacena los parametros necesarios y una referencia al receptor.
  - **Sender/Invoker**: Almacena una referencia al comando y lo dispara en lugar de enviar la solicitud directamente al receptor.
  - **Receiver**: Contiene la logica de negocio real. Cualquier objeto puede actuar como receptor.
  - **Client**: Crea los comandos concretos, los configura con receptores y los asocia a los senders.

## Pseudocodigo

```pseudocode
// Clase base de comandos
abstract class Command is
    protected field app: Application
    protected field editor: Editor
    protected field backup: text

    constructor Command(app: Application, editor: Editor) is
        this.app = app
        this.editor = editor

    method saveBackup() is
        backup = editor.text

    method undo() is
        editor.text = backup

    abstract method execute()

class CopyCommand extends Command is
    method execute() is
        app.clipboard = editor.getSelection()
        return false

class CutCommand extends Command is
    method execute() is
        saveBackup()
        app.clipboard = editor.getSelection()
        editor.deleteSelection()
        return true

class PasteCommand extends Command is
    method execute() is
        saveBackup()
        editor.replaceSelection(app.clipboard)
        return true

class UndoCommand extends Command is
    method execute() is
        app.undo()
        return false

// Historial de comandos (pila)
class CommandHistory is
    private field history: array of Command
    method push(c: Command) is
        // Agregar comando al final del historial.
    method pop(): Command is
        // Obtener el comando mas reciente del historial.

// Clase Application (Sender/Invoker)
class Application is
    field clipboard: string
    field editors: array of Editors
    field activeEditor: Editor
    field history: CommandHistory

    method executeCommand(command) is
        if (command.execute)
            history.push(command)

    method undo() is
        command = history.pop()
        if (command != null)
            command.undo()
```

## Aplicabilidad
- **Usar cuando:** se quiere parametrizar objetos con operaciones (pasar comandos como argumentos, almacenarlos, intercambiarlos en runtime).
- **Usar cuando:** se necesita encolar operaciones, programar su ejecucion o ejecutarlas remotamente (los comandos son serializables).
- **Usar cuando:** se quiere implementar operaciones reversibles (undo/redo) mediante un historial de comandos con backups de estado.
- **No usar cuando:** las operaciones son simples y directas sin necesidad de desacoplamiento, colas o deshacer.
- **No usar cuando:** agregar una capa intermedia de comandos introduce complejidad innecesaria.

## Ventajas y Desventajas
- Ventaja: *Principio de Responsabilidad Unica*: se desacoplan las clases que invocan operaciones de las que las ejecutan.
- Ventaja: *Principio Abierto/Cerrado*: se pueden introducir nuevos comandos sin modificar el codigo cliente.
- Ventaja: Se puede implementar undo/redo.
- Ventaja: Se puede implementar ejecucion diferida de operaciones.
- Ventaja: Se pueden componer comandos simples en comandos compuestos.
- Desventaja: El codigo puede volverse mas complejo al introducir una capa adicional entre emisores y receptores.

## Relaciones con otros patrones
- **Chain of Responsibility**, **Command**, **Mediator** y **Observer** son distintas formas de conectar emisores y receptores.
- Se puede usar **Command** y **Memento** juntos para implementar "deshacer": los comandos ejecutan operaciones y los mementos guardan el estado previo.
- **Command** y **Strategy** pueden parecer similares (ambos parametrizan un objeto con una accion), pero Command convierte una operacion en objeto para diferir/encolar/registrar, mientras que Strategy describe distintas formas de hacer lo mismo.
- **Prototype** puede ayudar a guardar copias de Commands en el historial.
- **Visitor** puede verse como una version potente de Command, ejecutando operaciones sobre objetos de distintas clases.
