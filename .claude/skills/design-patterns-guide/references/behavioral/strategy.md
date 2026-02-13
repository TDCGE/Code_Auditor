# Strategy

## Intencion

Strategy es un patron de diseno de comportamiento que permite definir una familia de algoritmos, colocar cada uno en una clase separada y hacer que sus objetos sean intercambiables. Permite seleccionar un algoritmo en tiempo de ejecucion sin modificar el codigo del contexto.

## Problema

Al desarrollar una aplicacion de navegacion, la primera version solo podia construir rutas por carretera. Con cada actualizacion se agregaron rutas a pie, transporte publico, ciclistas y rutas turisticas. Cada vez que se anadio un nuevo algoritmo de enrutamiento, la clase principal del navegador duplico su tamano. Cualquier cambio en uno de los algoritmos afectaba a toda la clase, aumentando el riesgo de errores. Ademas, el trabajo en equipo se volvio ineficiente porque multiples desarrolladores modificaban la misma clase enorme, generando conflictos de merge constantes.

## Solucion

El patron Strategy sugiere tomar una clase que hace algo especifico de muchas maneras diferentes y extraer todos esos algoritmos en clases separadas llamadas *estrategias*. La clase original, llamada *contexto*, almacena una referencia a una de las estrategias y le delega el trabajo. El contexto no es responsable de seleccionar el algoritmo; en cambio, el cliente pasa la estrategia deseada al contexto. El contexto trabaja con todas las estrategias a traves de una interfaz generica que expone un unico metodo para ejecutar el algoritmo encapsulado.

## Estructura

- **Context (Contexto)**: Mantiene una referencia a una de las estrategias concretas. Se comunica con el objeto solo a traves de la interfaz de estrategia. Expone un setter `setStrategy()` para cambiar la estrategia.
- **Strategy (Estrategia)**: Interfaz comun a todas las estrategias concretas. Declara un metodo `execute(data)` que el contexto usa para ejecutar la estrategia.
- **Concrete Strategies (Estrategias Concretas)**: Implementan diferentes variaciones del algoritmo que el contexto utiliza.
- **Client**: Crea un objeto de estrategia especifico y lo pasa al contexto.

## Pseudocodigo

```pseudocode
// La interfaz de estrategia declara operaciones comunes
interface Strategy is
    method execute(a, b)

// Estrategias concretas implementan el algoritmo
class ConcreteStrategyAdd implements Strategy is
    method execute(a, b) is
        return a + b

class ConcreteStrategySubtract implements Strategy is
    method execute(a, b) is
        return a - b

class ConcreteStrategyMultiply implements Strategy is
    method execute(a, b) is
        return a * b

// El contexto define la interfaz de interes para clientes
class Context is
    private strategy: Strategy

    method setStrategy(Strategy strategy) is
        this.strategy = strategy

    // Delega el trabajo al objeto de estrategia
    method executeStrategy(int a, int b) is
        return strategy.execute(a, b)

// El cliente selecciona la estrategia concreta
class ExampleApplication is
    method main() is
        Create context object.
        Read first number.
        Read last number.
        Read the desired action from user input.

        if (action == addition) then
            context.setStrategy(new ConcreteStrategyAdd())
        if (action == subtraction) then
            context.setStrategy(new ConcreteStrategySubtract())
        if (action == multiplication) then
            context.setStrategy(new ConcreteStrategyMultiply())

        result = context.executeStrategy(First number, Second number)
        Print result.
```

## Aplicabilidad

- **Usar cuando:** se necesitan diferentes variantes de un algoritmo dentro de un objeto y se quiere poder cambiar de un algoritmo a otro en tiempo de ejecucion.
- **Usar cuando:** hay muchas clases similares que solo difieren en la forma en que ejecutan algun comportamiento.
- **Usar cuando:** se quiere aislar la logica de negocio de los detalles de implementacion de algoritmos que no son tan importantes en el contexto de esa logica.
- **Usar cuando:** la clase tiene un condicional masivo que cambia entre diferentes variantes del mismo algoritmo.
- **No usar cuando:** solo hay un par de algoritmos y rara vez cambian; no hay razon real para sobrecomplicar el programa con nuevas clases e interfaces.
- **No usar cuando:** los clientes no necesitan conocer las diferencias entre estrategias.

## Ventajas y Desventajas

- Se pueden intercambiar algoritmos dentro de un objeto en tiempo de ejecucion.
- Se pueden aislar los detalles de implementacion de un algoritmo del codigo que lo usa.
- Se puede reemplazar herencia con composicion.
- Principio de Abierto/Cerrado: se pueden introducir nuevas estrategias sin cambiar el contexto.
- Si solo hay un par de algoritmos que rara vez cambian, no hay razon para sobrecomplicar el programa.
- Los clientes deben conocer las diferencias entre estrategias para seleccionar la adecuada.
- En lenguajes con tipos funcionales, se pueden usar funciones anonimas en lugar de clases de estrategia, logrando el mismo efecto sin codigo adicional.

## Relaciones con otros patrones

- **Bridge**, **State** y **Strategy** (y en cierta medida **Adapter**) tienen estructuras muy similares basadas en composicion. Sin embargo, resuelven problemas diferentes.
- **Command** y **Strategy** pueden parecer similares porque ambos parametrizan un objeto con alguna accion. Pero Command convierte cualquier operacion en un objeto (para diferir ejecucion, encolar, etc.), mientras que Strategy describe diferentes formas de hacer lo mismo, permitiendo intercambiar algoritmos dentro de un contexto.
- **Decorator** permite cambiar la piel de un objeto, mientras que **Strategy** permite cambiar sus entranas.
- **Template Method** se basa en herencia: permite alterar partes de un algoritmo extendiendo esas partes en subclases. Strategy se basa en composicion: permite alterar partes del comportamiento del objeto suministrando diferentes estrategias. Template Method trabaja a nivel de clase (estatico); Strategy trabaja a nivel de objeto (dinamico, en tiempo de ejecucion).
- **State** puede considerarse una extension de **Strategy**. Ambos usan composicion, pero Strategy hace las estrategias completamente independientes, mientras que State permite dependencias entre estados concretos.
