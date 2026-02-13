# State

## Intencion

State es un patron de diseno de comportamiento que permite a un objeto alterar su comportamiento cuando cambia su estado interno. Desde el exterior, parece como si el objeto hubiera cambiado de clase. Esta estrechamente relacionado con el concepto de Maquina de Estados Finitos.

## Problema

En cualquier momento dado, existe un numero finito de estados en los que un programa puede encontrarse. Dentro de cada estado, el programa se comporta de manera diferente. Las maquinas de estado generalmente se implementan con muchos operadores condicionales (`if` o `switch`) que seleccionan el comportamiento apropiado segun el estado actual. Por ejemplo, una clase `Document` con estados Draft, Moderation y Published, donde el metodo `publish()` se comporta diferente en cada estado. A medida que se agregan mas estados, los metodos contienen condicionales monstruosos que son muy dificiles de mantener, y cualquier cambio en la logica de transicion puede requerir modificar condicionales en todos los metodos.

## Solucion

El patron State sugiere crear nuevas clases para todos los estados posibles de un objeto y extraer todos los comportamientos especificos de estado en esas clases. El objeto original, llamado *contexto*, almacena una referencia a uno de los objetos de estado que representa su estado actual, y delega todo el trabajo relacionado con el estado a ese objeto. Para transicionar a otro estado, se reemplaza el objeto de estado activo por otro que represente el nuevo estado. Esto solo es posible si todas las clases de estado siguen la misma interfaz y el contexto trabaja con ellas a traves de esa interfaz.

## Estructura

- **Context (Contexto)**: Almacena una referencia a uno de los objetos de estado concretos y le delega todo el trabajo especifico del estado. Expone un setter `changeState(state)` para cambiar el objeto de estado.
- **State (Estado)**: Interfaz que declara los metodos especificos del estado (`doThis()`, `doThat()`).
- **Concrete States (Estados Concretos)**: Proporcionan sus propias implementaciones para los metodos del estado. Pueden almacenar una retro-referencia al contexto para obtener informacion e iniciar transiciones de estado.
- **Client**: Crea el estado inicial y lo pasa al contexto.

## Pseudocodigo

```pseudocode
// El AudioPlayer actua como contexto
class AudioPlayer is
    field state: State
    field UI, volume, playlist, currentSong

    constructor AudioPlayer() is
        this.state = new ReadyState(this)
        UI = new UserInterface()
        UI.lockButton.onClick(this.clickLock)
        UI.playButton.onClick(this.clickPlay)

    method changeState(state: State) is
        this.state = state

    // Metodos de UI delegan al estado activo
    method clickLock() is
        state.clickLock()
    method clickPlay() is
        state.clickPlay()

    method startPlayback() is
        // ...
    method stopPlayback() is
        // ...

// Clase base abstracta del estado
abstract class State is
    protected field player: AudioPlayer

    constructor State(player) is
        this.player = player

    abstract method clickLock()
    abstract method clickPlay()
    abstract method clickNext()
    abstract method clickPrevious()

// Estados concretos
class LockedState extends State is
    method clickLock() is
        if (player.playing)
            player.changeState(new PlayingState(player))
        else
            player.changeState(new ReadyState(player))
    method clickPlay() is
        // Bloqueado, no hacer nada.
    method clickNext() is
        // Bloqueado, no hacer nada.

class ReadyState extends State is
    method clickLock() is
        player.changeState(new LockedState(player))
    method clickPlay() is
        player.startPlayback()
        player.changeState(new PlayingState(player))
    method clickNext() is
        player.nextSong()

class PlayingState extends State is
    method clickLock() is
        player.changeState(new LockedState(player))
    method clickPlay() is
        player.stopPlayback()
        player.changeState(new ReadyState(player))
    method clickNext() is
        if (event.doubleclick)
            player.nextSong()
        else
            player.fastForward(5)
```

## Aplicabilidad

- **Usar cuando:** un objeto se comporta de manera diferente dependiendo de su estado actual, el numero de estados es enorme y el codigo especifico del estado cambia frecuentemente.
- **Usar cuando:** una clase esta contaminada con condicionales masivos que alteran su comportamiento segun los valores actuales de sus campos.
- **Usar cuando:** hay mucho codigo duplicado entre estados y transiciones similares de una maquina de estados basada en condiciones.
- **No usar cuando:** la maquina de estados tiene solo unos pocos estados o rara vez cambia; el patron seria excesivo.

## Ventajas y Desventajas

- Principio de Responsabilidad Unica: el codigo de cada estado se organiza en clases separadas.
- Principio de Abierto/Cerrado: se pueden introducir nuevos estados sin cambiar las clases de estado existentes ni el contexto.
- Simplifica el codigo del contexto al eliminar condicionales voluminosos de la maquina de estados.
- Puede ser excesivo si la maquina de estados tiene pocos estados o rara vez cambia.

## Relaciones con otros patrones

- **Bridge**, **State** y **Strategy** (y en cierta medida **Adapter**) tienen estructuras muy similares basadas en composicion, delegando trabajo a otros objetos. Sin embargo, resuelven problemas diferentes.
- **State** puede considerarse una extension de **Strategy**. Ambos patrones se basan en composicion y cambian el comportamiento del contexto delegando trabajo a objetos auxiliares. La diferencia clave es que en State, los estados concretos pueden conocerse entre si e iniciar transiciones, mientras que las estrategias casi nunca saben unas de otras.
