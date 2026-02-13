# Decorator

*Tambien conocido como: Wrapper*

## Intencion

Decorator es un patron de diseno estructural que permite agregar nuevos comportamientos a objetos colocandolos dentro de objetos envolventes especiales (wrappers) que contienen esos comportamientos. Permite extender funcionalidad en tiempo de ejecucion sin modificar la clase original ni usar herencia.

## Problema

Imagina que trabajas en una biblioteca de notificaciones con una clase `Notifier` que envia correos electronicos. Los usuarios quieren tambien notificaciones por SMS, Facebook y Slack. Al crear subclases para cada tipo, surge el problema de combinar multiples canales (ej. SMS + Facebook + Slack), lo que genera una explosion combinatoria de subclases.

## Solucion

En lugar de herencia, se usa **Agregacion/Composicion**: un objeto tiene una referencia a otro y le delega trabajo. Un *wrapper* (decorator) envuelve al objeto objetivo, contiene los mismos metodos y delega todas las solicitudes que recibe. Sin embargo, puede alterar el resultado haciendo algo antes o despues de pasar la solicitud al objeto envuelto.

El campo de referencia del wrapper acepta cualquier objeto que siga la misma interfaz, lo que permite cubrir un objeto con multiples wrappers, agregando el comportamiento combinado de todos.

## Estructura

- **Component** (interfaz): declara la interfaz comun tanto para wrappers como para objetos envueltos.
- **Concrete Component**: clase de objetos que se envuelven. Define el comportamiento basico que puede ser alterado por decoradores.
- **Base Decorator**: tiene un campo para referenciar el objeto envuelto (declarado como tipo de la interfaz del componente). Delega todas las operaciones al objeto envuelto.
- **Concrete Decorators**: definen comportamientos extra que se agregan dinamicamente. Sobreescriben metodos del decorador base y ejecutan su comportamiento antes o despues de llamar al metodo padre.
- **Client**: puede envolver componentes en multiples capas de decoradores.

## Pseudocodigo

```pseudocode
// Interfaz del componente
interface DataSource is
    method writeData(data)
    method readData():data

// Componente concreto
class FileDataSource implements DataSource is
    constructor FileDataSource(filename) { ... }
    method writeData(data) is
        // Escribe datos al archivo.
    method readData():data is
        // Lee datos del archivo.

// Decorador base
class DataSourceDecorator implements DataSource is
    protected field wrappee: DataSource
    constructor DataSourceDecorator(source: DataSource) is
        wrappee = source
    method writeData(data) is
        wrappee.writeData(data)
    method readData():data is
        return wrappee.readData()

// Decoradores concretos
class EncryptionDecorator extends DataSourceDecorator is
    method writeData(data) is
        // 1. Encriptar datos.
        // 2. Pasar datos encriptados al writeData del wrappee.
    method readData():data is
        // 1. Obtener datos del readData del wrappee.
        // 2. Desencriptar si esta encriptado.
        // 3. Retornar resultado.

class CompressionDecorator extends DataSourceDecorator is
    method writeData(data) is
        // 1. Comprimir datos.
        // 2. Pasar datos comprimidos al writeData del wrappee.
    method readData():data is
        // 1. Obtener datos del readData del wrappee.
        // 2. Descomprimir si esta comprimido.
        // 3. Retornar resultado.

// Configuracion del cliente
class ApplicationConfigurator is
    method configurationExample() is
        source = new FileDataSource("salary.dat")
        if (enabledEncryption)
            source = new EncryptionDecorator(source)
        if (enabledCompression)
            source = new CompressionDecorator(source)
        // source ahora es: Encryption > Compression > FileDataSource
```

## Aplicabilidad

- **Usar cuando:** se necesita asignar comportamientos extra a objetos en tiempo de ejecucion sin romper el codigo que los usa; es incomodo o imposible extender el comportamiento de un objeto usando herencia (ej. clases `final`).
- **No usar cuando:** el orden de los decoradores importa mucho y es dificil de gestionar; el comportamiento no necesita cambiar en tiempo de ejecucion y la herencia simple es suficiente.

## Ventajas y Desventajas

- Se puede extender el comportamiento de un objeto sin crear nuevas subclases.
- Se pueden agregar o quitar responsabilidades de un objeto en tiempo de ejecucion.
- Se pueden combinar varios comportamientos envolviendo un objeto en multiples decoradores.
- Principio de Responsabilidad Unica: se puede dividir una clase monolitica en varias clases mas pequenas.
- Es dificil eliminar un wrapper especifico de la pila de wrappers.
- Es dificil implementar un decorador cuyo comportamiento no dependa del orden en la pila.
- El codigo de configuracion inicial de capas puede verse poco elegante.

## Relaciones con otros patrones

- **Adapter** cambia la interfaz de un objeto existente; **Decorator** mejora un objeto sin cambiar su interfaz. **Adapter** da una interfaz diferente, **Proxy** la misma, **Decorator** una mejorada.
- **Chain of Responsibility** y **Decorator** tienen estructuras similares (composicion recursiva), pero CoR puede detener la cadena y ejecuta operaciones independientes, mientras que Decorator extiende comportamiento manteniendo la interfaz base.
- **Composite** y **Decorator** son similares (composicion recursiva), pero Decorator solo tiene un hijo y agrega responsabilidades. Pueden cooperar entre si.
- **Decorator** cambia la "piel" de un objeto; **Strategy** cambia sus "entranas".
- **Decorator** y **Proxy** tienen estructuras similares pero intenciones diferentes. Proxy generalmente gestiona el ciclo de vida del servicio por su cuenta, mientras que la composicion de Decorators siempre la controla el cliente.
