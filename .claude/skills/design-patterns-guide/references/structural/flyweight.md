# Flyweight

*Tambien conocido como: Cache*

## Intencion

Flyweight es un patron de diseno estructural que permite acomodar mas objetos en la cantidad disponible de RAM al compartir partes comunes del estado entre multiples objetos, en lugar de mantener todos los datos en cada objeto individual. Es una optimizacion pura enfocada en reducir el consumo de memoria.

## Problema

Imagina que creas un videojuego con un sistema de particulas. Cada particula (bala, misil, metralla) se representa como un objeto separado con campos como coordenadas, vector de movimiento, velocidad, color y sprite. Al tener millones de particulas en pantalla, cada una ocupando ~21KB (donde el sprite de 20KB y el color de 4B son los mas pesados), el programa consume ~21GB de RAM y se queda sin memoria.

## Solucion

Los campos color y sprite almacenan datos casi identicos entre particulas del mismo tipo (ej. todas las balas son iguales). Estos datos constantes se llaman **estado intrinseco** (inmutable, vive dentro del objeto). El resto del estado (coordenadas, vector, velocidad), que cambia constantemente y es unico por particula, se llama **estado extrinseco**.

Flyweight sugiere dejar de almacenar el estado extrinseco dentro del objeto y pasarlo a los metodos especificos que lo necesiten. Solo el estado intrinseco permanece en el objeto, permitiendo reutilizarlo en diferentes contextos. Asi, en lugar de millones de objetos pesados, se necesitan solo unos pocos flyweights (uno por tipo de particula), reduciendo el consumo de 21GB a ~32MB.

La **inmutabilidad** es clave: un flyweight debe inicializar su estado solo una vez via el constructor, sin exponer setters ni campos publicos.

Una **Flyweight Factory** gestiona un pool de flyweights existentes. Acepta el estado intrinseco deseado, busca un flyweight existente que coincida y lo retorna, o crea uno nuevo si no existe.

## Estructura

- **Flyweight**: contiene la porcion del estado del objeto original que puede compartirse entre multiples objetos. El estado almacenado internamente se llama *intrinseco*, y el que se pasa a los metodos se llama *extrinseco*.
- **Context**: contiene el estado extrinseco, unico para cada objeto original. Al emparejarse con un flyweight, representa el estado completo del objeto original.
- **Client**: calcula o almacena el estado extrinseco de los flyweights.
- **Flyweight Factory**: gestiona un pool de flyweights existentes. Los clientes no crean flyweights directamente; en su lugar, llaman a la fabrica pasando el estado intrinseco deseado.

## Pseudocodigo

```pseudocode
// El flyweight contiene el estado intrinseco (compartido)
class TreeType is
    field name
    field color
    field texture
    constructor TreeType(name, color, texture) { ... }
    method draw(canvas, x, y) is
        // 1. Crear bitmap del tipo, color y textura dados.
        // 2. Dibujar el bitmap en el canvas en coordenadas X e Y.

// La fabrica decide si reutilizar un flyweight existente o crear uno nuevo
class TreeFactory is
    static field treeTypes: collection of tree types
    static method getTreeType(name, color, texture) is
        type = treeTypes.find(name, color, texture)
        if (type == null)
            type = new TreeType(name, color, texture)
            treeTypes.add(type)
        return type

// El objeto contextual contiene el estado extrinseco
class Tree is
    field x, y
    field type: TreeType
    constructor Tree(x, y, type) { ... }
    method draw(canvas) is
        type.draw(canvas, this.x, this.y)

// El cliente crea arboles usando la fabrica de flyweights
class Forest is
    field trees: collection of Trees
    method plantTree(x, y, name, color, texture) is
        type = TreeFactory.getTreeType(name, color, texture)
        tree = new Tree(x, y, type)
        trees.add(tree)
    method draw(canvas) is
        foreach (tree in trees) do
            tree.draw(canvas)
```

## Aplicabilidad

- **Usar cuando:** el programa debe soportar una cantidad enorme de objetos que apenas caben en la RAM disponible; los objetos contienen estados duplicados que pueden extraerse y compartirse entre multiples objetos.
- **No usar cuando:** la aplicacion no tiene problemas de consumo de memoria; los objetos no contienen estado duplicado significativo que pueda compartirse; la complejidad adicional no se justifica.

## Ventajas y Desventajas

- Se puede ahorrar mucha RAM si el programa tiene toneladas de objetos similares.
- Se puede estar intercambiando RAM por ciclos de CPU cuando el estado extrinseco debe recalcularse cada vez que se llama a un metodo del flyweight.
- El codigo se vuelve mucho mas complicado. Los nuevos miembros del equipo se preguntaran por que el estado de una entidad esta separado de esa manera.

## Relaciones con otros patrones

- Se pueden implementar los nodos hoja compartidos del arbol **Composite** como **Flyweights** para ahorrar RAM.
- **Flyweight** muestra como crear muchos objetos pequenos, mientras que **Facade** muestra como crear un solo objeto que represente un subsistema completo.
- **Flyweight** se pareceria a **Singleton** si se lograra reducir todos los estados compartidos a un solo objeto flyweight. Pero hay dos diferencias fundamentales: (1) solo debe haber una instancia Singleton, mientras que Flyweight puede tener multiples instancias con diferentes estados intrinsecos; (2) el objeto Singleton puede ser mutable, los objetos Flyweight son inmutables.
