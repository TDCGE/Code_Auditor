# Memento

## Intencion
Permite guardar y restaurar el estado previo de un objeto sin revelar los detalles de su implementacion. Resuelve el problema de crear snapshots del estado de un objeto respetando su encapsulacion, de modo que solo el propio objeto pueda producir y consumir dichos snapshots.

## Problema
Al implementar la funcionalidad de "deshacer" en un editor de texto, se necesita guardar el estado del editor antes de cada operacion. El enfoque directo (copiar todos los campos del objeto) falla porque: (1) la mayoria de los objetos reales tienen campos privados inaccesibles desde fuera, y (2) si se hacen publicos los campos para poder copiarlos, cualquier cambio futuro en la clase del editor romperia todas las clases que dependen de la estructura del snapshot.

## Solucion
El patron Memento delega la creacion de snapshots al propio objeto originador (originator), que tiene acceso completo a su estado. El snapshot se almacena en un objeto especial llamado *memento*, cuyo contenido no es accesible a ningun otro objeto excepto el que lo produjo. Otros objetos (caretakers) interactuan con el memento mediante una interfaz limitada que solo permite obtener metadatos (fecha de creacion, nombre de operacion), pero no el estado original contenido en el snapshot.

## Estructura
- **Participantes**:
  - **Originator**: La clase que puede producir snapshots de su propio estado y restaurarse a partir de ellos. Tiene acceso completo al memento.
  - **Memento**: Objeto de valor que actua como snapshot del estado del originador. Es practica comun hacerlo inmutable, pasando los datos una sola vez via el constructor.
  - **Caretaker**: Sabe "cuando" y "por que" capturar el estado del originador, y cuando restaurarlo. Almacena una pila de mementos. Trabaja con el memento solo a traves de una interfaz limitada (no puede alterar el estado guardado).

## Pseudocodigo

```pseudocode
// El originador contiene datos importantes que pueden cambiar.
// Define metodos para guardar y restaurar su estado.
class Editor is
    private field text, curX, curY, selectionWidth

    method setText(text) is
        this.text = text

    method setCursor(x, y) is
        this.curX = x
        this.curY = y

    method setSelectionWidth(width) is
        this.selectionWidth = width

    // Guarda el estado actual en un memento.
    method createSnapshot(): Snapshot is
        // El memento es inmutable; el originador pasa su
        // estado a traves de los parametros del constructor.
        return new Snapshot(this, text, curX, curY, selectionWidth)

// El memento almacena el estado pasado del editor.
class Snapshot is
    private field editor: Editor
    private field text, curX, curY, selectionWidth

    constructor Snapshot(editor, text, curX, curY, selectionWidth) is
        this.editor = editor
        this.text = text
        this.curX = curX
        this.curY = curY
        this.selectionWidth = selectionWidth

    // Restaura el estado del editor vinculado.
    method restore() is
        editor.setText(text)
        editor.setCursor(curX, curY)
        editor.setSelectionWidth(selectionWidth)

// Un objeto Command puede actuar como caretaker.
// Obtiene un memento justo antes de cambiar el estado
// del originador. Cuando se solicita deshacer, restaura
// el estado desde el memento.
class Command is
    private field backup: Snapshot

    method makeBackup() is
        backup = editor.createSnapshot()

    method undo() is
        if (backup != null)
            backup.restore()
```

## Aplicabilidad
- **Usar cuando:** se necesita producir snapshots del estado de un objeto para poder restaurar un estado previo (funcionalidad de deshacer/rehacer).
- **Usar cuando:** se trabaja con transacciones que necesitan rollback en caso de error.
- **Usar cuando:** el acceso directo a los campos/getters/setters del objeto viola su encapsulacion y se necesita una forma segura de capturar el estado.
- **No usar cuando:** el estado del objeto es trivial y puede copiarse facilmente sin necesidad de un patron formal.
- **No usar cuando:** los mementos se crearian con demasiada frecuencia, consumiendo grandes cantidades de memoria RAM.

## Ventajas y Desventajas
- Ventaja: Se pueden producir snapshots del estado del objeto sin violar su encapsulacion.
- Ventaja: Se puede simplificar el codigo del originador dejando que el caretaker mantenga el historial de estados.
- Desventaja: La aplicacion puede consumir mucha RAM si los clientes crean mementos con demasiada frecuencia.
- Desventaja: Los caretakers deben rastrear el ciclo de vida del originador para poder destruir mementos obsoletos.
- Desventaja: La mayoria de los lenguajes dinamicos (PHP, Python, JavaScript) no pueden garantizar que el estado dentro del memento permanezca intacto.

## Relaciones con otros patrones
- Se puede usar **Command** y **Memento** juntos para implementar "deshacer": los comandos ejecutan operaciones sobre un objeto, mientras que los mementos guardan el estado de ese objeto justo antes de ejecutar el comando.
- Se puede usar **Memento** junto con **Iterator** para capturar el estado actual de la iteracion y revertirlo si es necesario.
- A veces **Prototype** puede ser una alternativa mas simple a **Memento**, cuando el estado del objeto que se quiere almacenar en el historial es sencillo y no tiene enlaces a recursos externos (o estos son faciles de restablecer).
