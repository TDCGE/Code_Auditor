# Principio de Responsabilidad Unica (SRP)

## Intencion
Una clase debe tener una sola razon para cambiar. Este principio busca reducir la complejidad haciendo que cada clase sea responsable de una unica parte de la funcionalidad del software, y que esa responsabilidad este completamente encapsulada dentro de la clase.

## Problema
- Una clase crece tanto que ya no se pueden recordar sus detalles
- La navegacion del codigo se vuelve lenta y confusa
- Se deben escanear clases enteras para encontrar funcionalidades especificas
- Al modificar un aspecto de la clase, se corre el riesgo de romper otros aspectos no relacionados
- Una clase tiene multiples razones para cambiar (por ejemplo, manejar datos de empleados y generar reportes)

## Solucion
Hacer que cada clase sea responsable de una sola parte de la funcionalidad. Si una clase tiene multiples razones para cambiar, se deben extraer las responsabilidades adicionales a clases separadas. Cada comportamiento distinto debe residir en su propia clase, con sus propios campos y metodos auxiliares.

## Pseudocodigo

### Antes (sin aplicar el principio)
```pseudocode
class Employee
    - name

    method getName() is
        return name

    method printTimeSheetReport() is
        // logica para formatear e imprimir
        // el reporte de horas trabajadas
        // Esta responsabilidad NO pertenece a Employee
```

### Despues (aplicando el principio)
```pseudocode
class Employee
    - name

    method getName() is
        return name

class TimeSheetReport
    method print(employee) is
        // logica para formatear e imprimir
        // el reporte de horas trabajadas
        // Ahora esta responsabilidad tiene su propia clase
```

## Aplicabilidad
- **Usar cuando:** una clase tiene mas de una razon para cambiar; resulta dificil concentrarse en aspectos especificos de la clase de forma aislada; la clase acumula metodos auxiliares y campos que pertenecen a diferentes funcionalidades; diferentes partes de la clase cambian por razones o en momentos distintos.
- **No usar cuando:** el programa es pequeno (200 lineas) y la separacion agregaria complejidad innecesaria; la clase es cohesiva y todas sus partes realmente trabajan juntas para un unico proposito; dividir la clase generaria demasiadas clases diminutas que complicarian la comprension del sistema.

## Relaciones con otros patrones/principios
- Es una aplicacion directa de **Encapsular lo que Varia**: al separar responsabilidades, se aislan las partes que cambian por diferentes razones.
- Complementa el **Principio Abierto/Cerrado**: clases con una sola responsabilidad son mas faciles de extender sin modificar.
- Se relaciona con el patron **Facade**: cuando una clase tiene demasiadas responsabilidades, se puede usar una fachada para simplificar la interaccion con multiples clases resultantes de la separacion.
- Apoya el **Principio de Segregacion de Interfaces (ISP)**: interfaces enfocadas en una responsabilidad evitan que los clientes dependan de metodos que no necesitan.
