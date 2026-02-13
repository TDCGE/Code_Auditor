# Singleton

## Intencion

Singleton es un patron de diseno creacional que garantiza que una clase tenga una unica instancia, al mismo tiempo que proporciona un punto de acceso global a dicha instancia. Centraliza el control de un recurso compartido en un solo objeto.

## Problema

El patron Singleton resuelve dos problemas simultaneamente (violando el Principio de Responsabilidad Unica). Primero, **asegurar que una clase tenga una sola instancia**: esto es comun cuando se necesita controlar el acceso a un recurso compartido, como una base de datos o un archivo. Si creas un objeto y luego decides crear otro nuevo, recibes el que ya fue creado en lugar de uno nuevo. Este comportamiento es imposible de lograr con un constructor regular, ya que un constructor siempre debe retornar un nuevo objeto. Segundo, **proporcionar un punto de acceso global a esa instancia**: al igual que una variable global, permite acceder al objeto desde cualquier parte del programa, pero protege la instancia de ser sobrescrita por otro codigo.

## Solucion

Todas las implementaciones del Singleton comparten dos pasos en comun:

1. Hacer el constructor por defecto **privado**, para evitar que otros objetos usen el operador `new` con la clase Singleton.
2. Crear un **metodo de creacion estatico** que actua como constructor. Internamente, este metodo llama al constructor privado para crear un objeto y lo guarda en un campo estatico. Todas las llamadas siguientes a este metodo retornan el objeto en cache.

## Estructura

- **Singleton**: La clase que declara el metodo estatico `getInstance` que retorna la misma instancia de su propia clase. El constructor debe estar oculto del codigo cliente. Llamar a `getInstance` debe ser la unica forma de obtener el objeto Singleton.

## Pseudocodigo

```pseudocode
// La clase Database define el metodo getInstance que permite
// a los clientes acceder a la misma instancia de la conexion
// a base de datos a lo largo de todo el programa.
class Database is
    private static field instance: Database

    // El constructor del singleton debe ser siempre privado
    private constructor Database() is
        // Codigo de inicializacion, como la conexion
        // real a un servidor de base de datos.
        // ...

    // El metodo estatico que controla el acceso a la instancia
    public static method getInstance() is
        if (Database.instance == null) then
            acquireThreadLock() and then
                // Asegurar que la instancia no fue inicializada
                // por otro hilo mientras este esperaba el lock.
                if (Database.instance == null) then
                    Database.instance = new Database()
        return Database.instance

    // Logica de negocio que se ejecuta sobre la instancia
    public method query(sql) is
        // Todas las consultas a la BD pasan por este metodo.
        // Se puede implementar throttling o caching aqui.
        // ...

// Uso desde el cliente
class Application is
    method main() is
        Database foo = Database.getInstance()
        foo.query("SELECT ...")
        // ...
        Database bar = Database.getInstance()
        bar.query("SELECT ...")
        // La variable 'bar' contendra el mismo objeto
        // que la variable 'foo'.
```

## Aplicabilidad

- **Usar cuando:** una clase en tu programa deberia tener una sola instancia disponible para todos los clientes (ej. un objeto de base de datos compartido por diferentes partes del programa); cuando necesitas un control mas estricto sobre variables globales (a diferencia de las variables globales, Singleton garantiza que solo hay una instancia y protege contra sobrescritura).
- **No usar cuando:** multiples instancias del objeto son necesarias o deseables; la testabilidad del codigo es una prioridad alta (Singleton dificulta el mocking y unit testing); el uso de Singleton enmascara un mal diseno donde los componentes del programa se conocen demasiado entre si.

## Ventajas y Desventajas

- Se garantiza que una clase tiene una unica instancia.
- Se obtiene un punto de acceso global a dicha instancia.
- El objeto singleton se inicializa solo cuando se solicita por primera vez (inicializacion perezosa).
- Viola el *Principio de Responsabilidad Unica* al resolver dos problemas al mismo tiempo.
- Puede enmascarar un mal diseno cuando los componentes del programa se conocen demasiado entre si.
- Requiere tratamiento especial en entornos multihilo para evitar que multiples hilos creen el singleton varias veces.
- Puede dificultar el testing unitario del codigo cliente, ya que muchos frameworks de testing dependen de herencia para producir objetos mock, y el constructor privado del singleton lo complica.

## Relaciones con otros patrones

- Una clase **Facade** frecuentemente puede transformarse en un **Singleton**, ya que un unico objeto facade es suficiente en la mayoria de casos.
- **Flyweight** se pareceria a **Singleton** si de alguna forma se redujeran todos los estados compartidos de los objetos a un solo objeto flyweight. Pero hay dos diferencias fundamentales: (1) solo debe haber una instancia Singleton, mientras que Flyweight puede tener multiples instancias con diferentes estados intrinsecos; (2) el objeto Singleton puede ser mutable, mientras que los objetos Flyweight son inmutables.
- **Abstract Factories**, **Builders** y **Prototypes** pueden todos implementarse como **Singletons**.
