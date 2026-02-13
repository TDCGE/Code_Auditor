# Factory Method

## Intencion

Factory Method es un patron de diseno creacional que proporciona una interfaz para crear objetos en una superclase, pero permite a las subclases alterar el tipo de objetos que se crearan. Desacopla el codigo de construccion del producto del codigo que realmente usa el producto.

## Problema

Imagina que estas desarrollando una aplicacion de logistica. La primera version solo maneja transporte por camion, asi que la mayor parte del codigo vive dentro de la clase `Truck`. Con el tiempo, recibes peticiones para incorporar transporte maritimo. Agregar `Ship` al codigo existente requeriria modificar toda la base de codigo, y cada nuevo tipo de transporte futuro repetiria el problema. El resultado seria un codigo plagado de condicionales que cambian el comportamiento segun la clase de transporte.

## Solucion

El patron Factory Method sugiere reemplazar las llamadas directas de construccion de objetos (usando `new`) por llamadas a un metodo fabrica especial. Los objetos siguen creandose con `new`, pero la llamada se hace desde dentro del metodo fabrica. Los objetos retornados se denominan *productos*. Las subclases pueden sobrescribir el metodo fabrica para cambiar el tipo de producto creado, siempre que los productos compartan una interfaz o clase base comun.

## Estructura

- **Product (interfaz)**: Declara la interfaz comun a todos los objetos que pueden ser producidos por el creador y sus subclases.
- **Concrete Products**: Implementaciones diferentes de la interfaz Product (ej. `Truck`, `Ship`).
- **Creator**: Clase que declara el metodo fabrica que retorna objetos de tipo Product. Puede ser abstracto o tener una implementacion por defecto. Su responsabilidad principal no es crear productos, sino contener logica de negocio relacionada.
- **Concrete Creators**: Sobrescriben el metodo fabrica base para retornar un tipo diferente de producto (ej. `RoadLogistics`, `SeaLogistics`).

## Pseudocodigo

```pseudocode
// La clase creadora declara el metodo fabrica
class Dialog is
    abstract method createButton():Button

    method render() is
        Button okButton = createButton()
        okButton.onClick(closeDialog)
        okButton.render()

// Creadores concretos sobrescriben el metodo fabrica
class WindowsDialog extends Dialog is
    method createButton():Button is
        return new WindowsButton()

class WebDialog extends Dialog is
    method createButton():Button is
        return new HTMLButton()

// Interfaz del producto
interface Button is
    method render()
    method onClick(f)

// Productos concretos
class WindowsButton implements Button is
    method render(a, b) is
        // Renderizar boton estilo Windows.
    method onClick(f) is
        // Bindear evento click nativo del SO.

class HTMLButton implements Button is
    method render(a, b) is
        // Retornar representacion HTML del boton.
    method onClick(f) is
        // Bindear evento click del navegador.

// El cliente selecciona el creador segun la configuracion
class Application is
    field dialog: Dialog

    method initialize() is
        config = readApplicationConfigFile()
        if (config.OS == "Windows") then
            dialog = new WindowsDialog()
        else if (config.OS == "Web") then
            dialog = new WebDialog()
        else
            throw new Exception("Error! SO desconocido.")

    method main() is
        this.initialize()
        dialog.render()
```

## Aplicabilidad

- **Usar cuando:** no conoces de antemano los tipos exactos y dependencias de los objetos con los que tu codigo debe trabajar; cuando quieres dar a los usuarios de tu biblioteca o framework una forma de extender sus componentes internos; cuando quieres reutilizar objetos existentes en lugar de reconstruirlos cada vez (ahorro de recursos).
- **No usar cuando:** solo existe un tipo de producto y no se prevee extension; la jerarquia de clases es innecesariamente compleja para el problema; el objeto es simple y no justifica la indirecta adicional.

## Ventajas y Desventajas

- Se evita el acoplamiento fuerte entre el creador y los productos concretos.
- *Principio de Responsabilidad Unica*: se centraliza el codigo de creacion en un solo lugar.
- *Principio Abierto/Cerrado*: se pueden introducir nuevos tipos de productos sin romper el codigo cliente existente.
- El codigo puede volverse mas complicado al requerir muchas subclases nuevas para implementar el patron.

## Relaciones con otros patrones

- Muchos disenos comienzan con **Factory Method** (menos complicado, mas personalizable via subclases) y evolucionan hacia **Abstract Factory**, **Prototype** o **Builder** (mas flexibles, pero mas complicados).
- Las clases de **Abstract Factory** frecuentemente se basan en un conjunto de **Factory Methods**, pero tambien pueden usar **Prototype** para componer sus metodos.
- Se puede usar **Factory Method** junto con **Iterator** para que las subclases retornen diferentes tipos de iteradores compatibles con las colecciones.
- **Prototype** no se basa en herencia (sin sus desventajas), pero requiere inicializacion compleja del objeto clonado. **Factory Method** se basa en herencia pero no requiere un paso de inicializacion.
- **Factory Method** es una especializacion de **Template Method**. A su vez, un Factory Method puede servir como un paso dentro de un Template Method mas grande.
