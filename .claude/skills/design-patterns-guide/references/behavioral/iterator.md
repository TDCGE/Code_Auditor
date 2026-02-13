# Iterator

## Intencion
Permite recorrer los elementos de una coleccion sin exponer su representacion interna (lista, pila, arbol, grafo, etc.). Extrae el comportamiento de recorrido en un objeto separado llamado *iterador*, proporcionando una interfaz uniforme para traversar distintas estructuras de datos.

## Problema
Las colecciones pueden almacenar elementos en listas simples, pero tambien en pilas, arboles, grafos y otras estructuras complejas. Se necesitan distintos algoritmos de recorrido (profundidad, anchura, aleatorio). Agregar estos algoritmos directamente a la coleccion difumina su responsabilidad principal (almacenamiento eficiente) y el codigo cliente queda acoplado a clases de coleccion especificas.

## Solucion
El patron extrae el comportamiento de recorrido a un objeto *iterador* separado. El iterador encapsula los detalles del recorrido (posicion actual, cuantos elementos faltan, etc.). Varios iteradores pueden recorrer la misma coleccion simultaneamente de forma independiente. Todos los iteradores implementan la misma interfaz, haciendo que el codigo cliente sea compatible con cualquier tipo de coleccion o algoritmo de recorrido.

## Estructura
- **Participantes**:
  - **Iterator (interfaz)**: Declara las operaciones necesarias para recorrer una coleccion: `getNext()`, `hasMore()`.
  - **ConcreteIterator**: Implementa el algoritmo de recorrido especifico. Mantiene su propio estado de iteracion (posicion actual, cache).
  - **IterableCollection (interfaz)**: Declara el metodo `createIterator()` que retorna un iterador compatible.
  - **ConcreteCollection**: Retorna instancias de iteradores concretos cuando el cliente lo solicita.
  - **Client**: Trabaja con colecciones e iteradores a traves de sus interfaces, sin acoplarse a clases concretas.

## Pseudocodigo

```pseudocode
// Interfaz de coleccion con metodo fabrica para iteradores
interface SocialNetwork is
    method createFriendsIterator(profileId): ProfileIterator
    method createCoworkersIterator(profileId): ProfileIterator

class Facebook implements SocialNetwork is
    method createFriendsIterator(profileId) is
        return new FacebookIterator(this, profileId, "friends")
    method createCoworkersIterator(profileId) is
        return new FacebookIterator(this, profileId, "coworkers")

// Interfaz comun de iteradores
interface ProfileIterator is
    method getNext(): Profile
    method hasMore(): bool

// Iterador concreto
class FacebookIterator implements ProfileIterator is
    private field facebook: Facebook
    private field profileId, type: string
    private field currentPosition
    private field cache: array of Profile

    constructor FacebookIterator(facebook, profileId, type) is
        this.facebook = facebook
        this.profileId = profileId
        this.type = type

    private method lazyInit() is
        if (cache == null)
            cache = facebook.socialGraphRequest(profileId, type)

    method getNext() is
        if (hasMore())
            currentPosition++
            return cache[currentPosition]

    method hasMore() is
        lazyInit()
        return currentPosition < cache.length

// El cliente recibe un iterador, no la coleccion completa
class SocialSpammer is
    method send(iterator: ProfileIterator, message: string) is
        while (iterator.hasMore())
            profile = iterator.getNext()
            System.sendEmail(profile.getEmail(), message)

class Application is
    field network: SocialNetwork
    field spammer: SocialSpammer

    method sendSpamToFriends(profile) is
        iterator = network.createFriendsIterator(profile.getId())
        spammer.send(iterator, "Mensaje importante")
```

## Aplicabilidad
- **Usar cuando:** la coleccion tiene una estructura de datos compleja y se desea ocultar su complejidad a los clientes (por conveniencia o seguridad).
- **Usar cuando:** se quiere reducir la duplicacion de codigo de recorrido en la aplicacion.
- **Usar cuando:** se necesita que el codigo pueda recorrer distintas estructuras de datos o cuando los tipos de estructuras son desconocidos de antemano.
- **No usar cuando:** la aplicacion solo trabaja con colecciones simples donde un bucle basico es suficiente.
- **No usar cuando:** el rendimiento es critico y el overhead de un iterador no se justifica frente al acceso directo a la coleccion.

## Ventajas y Desventajas
- Ventaja: *Principio de Responsabilidad Unica*: se separa el codigo de recorrido del codigo de la coleccion y del cliente.
- Ventaja: *Principio Abierto/Cerrado*: se pueden implementar nuevos tipos de colecciones e iteradores sin romper el codigo existente.
- Ventaja: Se puede iterar la misma coleccion en paralelo, ya que cada iterador mantiene su propio estado.
- Ventaja: Se puede pausar una iteracion y reanudarla cuando sea necesario.
- Desventaja: Puede ser excesivo si la aplicacion solo trabaja con colecciones simples.
- Desventaja: Usar un iterador puede ser menos eficiente que acceder directamente a los elementos de colecciones especializadas.

## Relaciones con otros patrones
- Se pueden usar **Iterators** para recorrer arboles **Composite**.
- Se puede usar **Factory Method** junto con **Iterator** para que las subclases de coleccion retornen tipos de iteradores compatibles.
- Se puede usar **Memento** junto con **Iterator** para capturar el estado actual de la iteracion y revertirlo si es necesario.
- Se puede usar **Visitor** junto con **Iterator** para recorrer una estructura de datos compleja y ejecutar alguna operacion sobre sus elementos, incluso si tienen clases diferentes.
