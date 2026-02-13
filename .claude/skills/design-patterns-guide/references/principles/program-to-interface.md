# Programar hacia una Interfaz, no hacia una Implementacion

## Intencion
Este principio establece que se debe depender de abstracciones y no de clases concretas. El objetivo es lograr un diseno flexible donde se pueda extender y modificar el comportamiento del sistema sin romper el codigo existente, desacoplando las dependencias entre objetos.

## Problema
- Las clases estan acopladas directamente a clases concretas, lo que impide reemplazar implementaciones
- Agregar un nuevo tipo de objeto requiere modificar el codigo cliente que lo utiliza
- No se puede extender el sistema facilmente sin tocar codigo existente
- El codigo de alto nivel conoce demasiados detalles sobre las clases concretas que utiliza

## Solucion
En lugar de hacer que una clase dependa directamente de otra clase concreta, se debe:

1. Determinar que metodos necesita un objeto del otro
2. Describir esos metodos en una interfaz o clase abstracta
3. Hacer que la clase dependencia implemente esa interfaz
4. Hacer que la clase cliente dependa de la interfaz en lugar de la clase concreta

Esto permite que cualquier objeto que implemente la interfaz pueda ser utilizado, haciendo la conexion mucho mas flexible.

## Pseudocodigo

### Antes (sin aplicar el principio)
```pseudocode
class Company
    method createSoftware() is
        Designer d = new Designer()
        d.designArchitecture()
        Programmer p = new Programmer()
        p.writeCode()
        Tester t = new Tester()
        t.testSoftware()
```

### Despues (aplicando el principio)
```pseudocode
interface Employee
    method doWork()

class Designer implements Employee
    method doWork() is
        // disenar arquitectura

class Programmer implements Employee
    method doWork() is
        // escribir codigo

abstract class Company
    abstract method getEmployees(): Employee[]

    method createSoftware() is
        employees = getEmployees()
        foreach (Employee e in employees)
            e.doWork()

class GameDevCompany extends Company
    method getEmployees() is
        return [new Designer(), new Artist()]

class OutsourcingCompany extends Company
    method getEmployees() is
        return [new Programmer(), new Tester()]
```

## Aplicabilidad
- **Usar cuando:** se necesita que el sistema sea extensible con nuevos tipos sin modificar codigo existente; multiples implementaciones deben poder intercambiarse; se construye una libreria o framework que otros usaran; se quiere facilitar las pruebas unitarias mediante mocks.
- **No usar cuando:** solo existe una implementacion y no se prevee agregar mas; el costo de la abstraccion adicional no se justifica en un proyecto pequeno o un prototipo rapido; la interfaz resultaria demasiado generica y perderia semantica.

## Relaciones con otros patrones/principios
- Es la base del patron **Factory Method**: al declarar metodos abstractos para crear objetos, la clase base trabaja con interfaces mientras las subclases concretas definen que objetos crear.
- Se relaciona directamente con el **Principio de Inversion de Dependencias (DIP)**: ambos promueven depender de abstracciones.
- Complementa el principio **Favorecer Composicion sobre Herencia**: al depender de interfaces, es mas facil componer objetos en tiempo de ejecucion.
- Facilita la aplicacion del patron **Strategy**: las estrategias se definen como interfaces que pueden intercambiarse.
