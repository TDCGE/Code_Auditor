# Mediator

## Intencion
Reduce las dependencias caoticas entre objetos restringiendo las comunicaciones directas entre ellos y forzandolos a colaborar unicamente a traves de un objeto mediador. Centraliza la logica de interaccion compleja en un solo lugar, facilitando el mantenimiento y la reutilizacion de componentes individuales.

## Problema
En un formulario de dialogo con multiples controles (campos de texto, checkboxes, botones), los elementos interactuan entre si de forma directa: un checkbox puede mostrar/ocultar campos, un boton debe validar todos los campos antes de enviar. Esta comunicacion directa entre componentes los acopla fuertemente, haciendo imposible reutilizarlos en otros contextos sin arrastrar todas sus dependencias.

## Solucion
El patron sugiere eliminar toda comunicacion directa entre componentes que se desean hacer independientes. En lugar de eso, los componentes colaboran indirectamente llamando a un objeto mediador que redirige las llamadas a los componentes apropiados. Los componentes dependen solo de una clase mediadora en lugar de estar acoplados a docenas de otros componentes. Se puede extraer una interfaz comun del mediador para que los componentes funcionen con cualquier dialogo que la implemente.

## Estructura
- **Participantes**:
  - **Component**: Clases que contienen logica de negocio. Cada componente tiene una referencia al mediador (declarada con el tipo de la interfaz Mediator). El componente no conoce la clase concreta del mediador.
  - **Mediator (interfaz)**: Declara los metodos de comunicacion con los componentes, generalmente un unico metodo `notify(sender, event)`.
  - **ConcreteMediator**: Encapsula las relaciones entre los componentes. Mantiene referencias a todos los componentes que gestiona y a veces administra su ciclo de vida.
  - Los componentes no deben conocer a otros componentes. Solo notifican al mediador cuando algo importante ocurre.

## Pseudocodigo

```pseudocode
// Interfaz del mediador
interface Mediator is
    method notify(sender: Component, event: string)

// Mediador concreto: dialogo de autenticacion
class AuthenticationDialog implements Mediator is
    private field title: string
    private field loginOrRegisterChkBx: Checkbox
    private field loginUsername, loginPassword: Textbox
    private field registrationUsername, registrationPassword,
                  registrationEmail: Textbox
    private field okBtn, cancelBtn: Button

    constructor AuthenticationDialog() is
        // Crear todos los componentes y pasar el mediador
        // actual a sus constructores para establecer enlaces.

    method notify(sender, event) is
        if (sender == loginOrRegisterChkBx and event == "check")
            if (loginOrRegisterChkBx.checked)
                title = "Log in"
                // 1. Mostrar componentes de login.
                // 2. Ocultar componentes de registro.
            else
                title = "Register"
                // 1. Mostrar componentes de registro.
                // 2. Ocultar componentes de login.

        if (sender == okBtn && event == "click")
            if (loginOrRegisterChkBx.checked)
                // Intentar login con credenciales.
            else
                // Crear cuenta con datos de registro.

// Clase base de componentes
class Component is
    field dialog: Mediator

    constructor Component(dialog) is
        this.dialog = dialog

    method click() is
        dialog.notify(this, "click")

    method keypress() is
        dialog.notify(this, "keypress")

// Componentes concretos no se comunican entre si
class Button extends Component is
    // ...

class Textbox extends Component is
    // ...

class Checkbox extends Component is
    method check() is
        dialog.notify(this, "check")
```

## Aplicabilidad
- **Usar cuando:** es dificil cambiar algunas clases porque estan fuertemente acopladas a muchas otras clases.
- **Usar cuando:** no se puede reutilizar un componente en un programa diferente porque depende demasiado de otros componentes.
- **Usar cuando:** se crean muchas subclases de componentes solo para reutilizar comportamiento basico en distintos contextos.
- **No usar cuando:** las interacciones entre componentes son simples y directas.
- **No usar cuando:** centralizar la logica crearia un objeto mediador excesivamente complejo (God Object).

## Ventajas y Desventajas
- Ventaja: *Principio de Responsabilidad Unica*: se extraen las comunicaciones entre componentes a un solo lugar.
- Ventaja: *Principio Abierto/Cerrado*: se pueden introducir nuevos mediadores sin cambiar los componentes existentes.
- Ventaja: Se reduce el acoplamiento entre componentes del programa.
- Ventaja: Se pueden reutilizar componentes individuales mas facilmente.
- Desventaja: Con el tiempo, un mediador puede evolucionar en un God Object que centraliza demasiada logica.

## Relaciones con otros patrones
- **Chain of Responsibility**, **Command**, **Mediator** y **Observer** abordan distintas formas de conectar emisores y receptores de solicitudes.
- **Facade** y **Mediator** tienen trabajos similares: organizan la colaboracion entre clases acopladas. Pero Facade define una interfaz simplificada sin agregar funcionalidad nueva (el subsistema no conoce al facade), mientras que Mediator centraliza la comunicacion y los componentes solo conocen al mediador.
- La diferencia entre **Mediator** y **Observer** suele ser sutil. El objetivo de Mediator es eliminar dependencias mutuas entre componentes (dependen de un unico mediador). El objetivo de Observer es establecer conexiones dinamicas unidireccionales. Una implementacion popular de Mediator usa Observer internamente: el mediador actua como publisher y los componentes como subscribers.
