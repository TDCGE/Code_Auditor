# Template Method

## Intencion

Template Method es un patron de diseno de comportamiento que define el esqueleto de un algoritmo en la superclase, pero permite que las subclases sobreescriban pasos especificos del algoritmo sin cambiar su estructura general. Permite reutilizar la estructura del algoritmo mientras se personalizan ciertos pasos.

## Problema

Al crear una aplicacion de mineria de datos que analiza documentos corporativos en varios formatos (DOC, CSV, PDF), se descubrio que las tres clases de procesamiento tenian mucho codigo similar. El codigo para tratar con los distintos formatos de datos era diferente, pero el codigo de procesamiento y analisis de datos era casi identico. Ademas, el codigo del cliente tenia muchos condicionales que seleccionaban el curso de accion segun la clase del objeto de procesamiento. Si las tres clases tuvieran una interfaz comun o una clase base, se podrian eliminar esos condicionales usando polimorfismo.

## Solucion

El patron Template Method sugiere descomponer un algoritmo en una serie de pasos, convertir esos pasos en metodos, y colocar una serie de llamadas a estos metodos dentro de un unico *metodo plantilla*. Los pasos pueden ser `abstract` (obligatorios para las subclases) o tener una implementacion por defecto (opcionales). Para usar el algoritmo, el cliente proporciona su propia subclase, implementa todos los pasos abstractos y sobreescribe los opcionales (pero no el metodo plantilla en si).

Existen dos tipos de pasos:
- **Pasos abstractos**: deben ser implementados por cada subclase.
- **Pasos opcionales**: ya tienen una implementacion por defecto, pero pueden sobreescribirse.

Tambien existe un tercer tipo llamado *hooks*: pasos opcionales con cuerpo vacio que se colocan antes y despues de pasos cruciales del algoritmo, proporcionando puntos de extension adicionales.

## Estructura

- **Abstract Class (Clase Abstracta)**: Declara los metodos que actuan como pasos del algoritmo, asi como el metodo plantilla que llama a estos metodos en un orden especifico. Los pasos pueden ser declarados `abstract` o tener una implementacion por defecto.
- **Concrete Classes (Clases Concretas)**: Pueden sobreescribir todos los pasos, pero no el metodo plantilla en si.

## Pseudocodigo

```pseudocode
// La clase abstracta define un metodo plantilla con el esqueleto
// del algoritmo, compuesto de llamadas a operaciones primitivas
// abstractas. Las subclases concretas implementan estas operaciones.
class GameAI is
    // El metodo plantilla define el esqueleto del algoritmo.
    method turn() is
        collectResources()
        buildStructures()
        buildUnits()
        attack()

    // Algunos pasos pueden implementarse en la clase base.
    method collectResources() is
        foreach (s in this.builtStructures) do
            s.collect()

    // Otros se definen como abstractos.
    abstract method buildStructures()
    abstract method buildUnits()

    method attack() is
        enemy = closestEnemy()
        if (enemy == null)
            sendScouts(map.center)
        else
            sendWarriors(enemy.position)

    abstract method sendScouts(position)
    abstract method sendWarriors(position)

// Las clases concretas implementan todas las operaciones abstractas
// pero no pueden sobreescribir el metodo plantilla.
class OrcsAI extends GameAI is
    method buildStructures() is
        if (there are some resources) then
            // Construir granjas, cuarteles, fortaleza.

    method buildUnits() is
        if (there are plenty of resources) then
            if (there are no scouts)
                // Construir peon, agregarlo al grupo de exploradores.
            else
                // Construir grunt, agregarlo al grupo de guerreros.

    method sendScouts(position) is
        if (scouts.length > 0) then
            // Enviar exploradores a la posicion.

    method sendWarriors(position) is
        if (warriors.length > 5) then
            // Enviar guerreros a la posicion.

// Las subclases tambien pueden sobreescribir operaciones con
// implementacion por defecto.
class MonstersAI extends GameAI is
    method collectResources() is
        // Los monstruos no recolectan recursos.
    method buildStructures() is
        // Los monstruos no construyen estructuras.
    method buildUnits() is
        // Los monstruos no construyen unidades.
```

## Aplicabilidad

- **Usar cuando:** se desea permitir a los clientes extender solo pasos particulares de un algoritmo, pero no el algoritmo completo ni su estructura.
- **Usar cuando:** se tienen varias clases que contienen algoritmos casi identicos con algunas diferencias menores, y se necesita modificar todas las clases cuando el algoritmo cambia.
- **No usar cuando:** el algoritmo no tiene una estructura comun que pueda descomponerse en pasos.
- **No usar cuando:** las subclases necesitan cambiar la estructura del algoritmo, no solo sus pasos individuales.

## Ventajas y Desventajas

- Se puede permitir a los clientes sobreescribir solo ciertas partes de un algoritmo grande, haciendolos menos afectados por cambios en otras partes.
- Se puede extraer el codigo duplicado a una superclase.
- Algunos clientes pueden verse limitados por el esqueleto proporcionado del algoritmo.
- Se podria violar el Principio de Sustitucion de Liskov al suprimir la implementacion por defecto de un paso en una subclase.
- Los metodos plantilla tienden a ser mas dificiles de mantener cuantos mas pasos tienen.

## Relaciones con otros patrones

- **Factory Method** es una especializacion de **Template Method**. Al mismo tiempo, un Factory Method puede servir como un paso en un Template Method mas grande.
- **Template Method** se basa en herencia: permite alterar partes de un algoritmo extendiendo esas partes en subclases. **Strategy** se basa en composicion: permite alterar partes del comportamiento del objeto suministrando diferentes estrategias. Template Method trabaja a nivel de clase (estatico); Strategy trabaja a nivel de objeto (dinamico, en tiempo de ejecucion).
