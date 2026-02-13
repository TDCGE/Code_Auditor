# Principio de Inversion de Dependencias (DIP)

## Intencion
Las clases de alto nivel no deben depender de las clases de bajo nivel. Ambas deben depender de abstracciones. Las abstracciones no deben depender de los detalles, sino los detalles de las abstracciones. Este principio busca invertir la direccion de las dependencias para que la logica de negocio no se vea afectada por cambios en los componentes de bajo nivel.

## Problema
- Las clases de logica de negocio (alto nivel) dependen directamente de clases utilitarias o de infraestructura (bajo nivel)
- Un cambio en una clase de bajo nivel (ej. nueva version de base de datos) rompe o afecta a las clases de alto nivel
- La logica de negocio no puede reutilizarse con diferentes implementaciones de bajo nivel
- Es dificil probar las clases de alto nivel de forma aislada porque estan acopladas a implementaciones concretas

## Solucion
Se aplica en tres pasos:

1. Describir interfaces para las operaciones de bajo nivel que las clases de alto nivel necesitan, usando terminos de negocio (ej. `openReport(file)` en vez de `openFile(x), readBytes(n)`)
2. Hacer que las clases de alto nivel dependan de esas interfaces en lugar de las clases concretas de bajo nivel
3. Hacer que las clases de bajo nivel implementen esas interfaces, invirtiendo asi la direccion de la dependencia original

## Pseudocodigo

### Antes (sin aplicar el principio)
```pseudocode
// Alto nivel depende directamente de bajo nivel
class BudgetReport
    - database: MySQLDatabase

    method open(date) is
        // usa directamente metodos de MySQL
        database.insert()
        database.update()

    method save() is
        database.update()

class MySQLDatabase
    method insert() is // ...
    method update() is // ...
    method delete() is // ...
// Si cambiamos de MySQL a MongoDB, debemos modificar BudgetReport
```

### Despues (aplicando el principio)
```pseudocode
// Interfaz de alto nivel definida en terminos de negocio
interface Database
    method insert()
    method update()
    method delete()

class BudgetReport
    - database: Database  // depende de la abstraccion

    method open(date) is
        database.insert()
        database.update()

    method save() is
        database.update()

// Las clases de bajo nivel implementan la interfaz
class MySQL implements Database
    method insert() is // ...
    method update() is // ...
    method delete() is // ...

class MongoDB implements Database
    method insert() is // ...
    method update() is // ...
    method delete() is // ...
// Se puede cambiar la base de datos sin tocar BudgetReport
```

## Aplicabilidad
- **Usar cuando:** las clases de logica de negocio dependen directamente de clases de infraestructura (base de datos, sistema de archivos, APIs externas); se necesita poder intercambiar implementaciones de bajo nivel sin afectar la logica de negocio; se quiere facilitar las pruebas unitarias mediante mocks o stubs; se esta desarrollando un sistema que debe ser independiente de la tecnologia de persistencia o comunicacion.
- **No usar cuando:** el sistema es un prototipo rapido donde la flexibilidad no es prioritaria; solo existe y existira una unica implementacion de bajo nivel; la capa de abstraccion adicional no aporta valor en un modulo simple y aislado.

## Relaciones con otros patrones/principios
- Se complementa directamente con el **Principio Abierto/Cerrado**: al depender de abstracciones, se pueden extender las clases de bajo nivel sin romper las clases de alto nivel existentes.
- Aplica **Programar hacia una Interfaz**: las clases de alto nivel programan hacia interfaces definidas en terminos de negocio.
- Se relaciona con los patrones **Abstract Factory** y **Factory Method**: estos patrones facilitan la creacion de objetos concretos sin que la logica de negocio conozca las clases especificas.
- Complementa la **Segregacion de Interfaces**: las interfaces de alto nivel deben ser granulares y enfocadas en lo que realmente necesita la logica de negocio.
