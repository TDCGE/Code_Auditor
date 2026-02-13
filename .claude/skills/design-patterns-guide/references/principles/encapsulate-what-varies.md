# Encapsular lo que Varia

## Intencion
Este principio busca minimizar el efecto causado por los cambios en el software. La idea central es identificar las partes de la aplicacion que varian y separarlas de lo que permanece constante, aislando el codigo cambiante en modulos independientes para proteger al resto del codigo de efectos adversos.

## Problema
- Un metodo contiene logica que cambia frecuentemente mezclada con logica estable
- Cambios en una parte del codigo provocan efectos secundarios inesperados en otras partes
- Cada vez que se necesita modificar un aspecto variable, se debe tocar codigo que no deberia cambiar
- Una clase acumula responsabilidades que evolucionan a ritmos diferentes

## Solucion
Aislar las partes del programa que varian en modulos independientes. Esto se puede hacer en dos niveles:

**A nivel de metodo:** Extraer la logica variable a un metodo separado.
**A nivel de clase:** Cuando la logica variable crece demasiado, extraerla a una clase dedicada que encapsule esa responsabilidad.

## Pseudocodigo

### Antes (sin aplicar el principio)
```pseudocode
method getOrderTotal(order) is
    total = 0
    foreach item in order.lineItems
        total += item.price * item.quantity

    if (order.country == "US")
        total += total * 0.07  // US sales tax
    else if (order.country == "EU")
        total += total * 0.20  // European VAT

    return total
```

### Despues (aplicando el principio)
```pseudocode
method getOrderTotal(order) is
    total = 0
    foreach item in order.lineItems
        total += item.price * item.quantity

    total += total * getTaxRate(order.country)
    return total

method getTaxRate(country) is
    if (country == "US")
        return 0.07
    else if (country == "EU")
        return 0.20
    else
        return 0
```

A nivel de clase, se puede delegar el calculo de impuestos a un objeto `TaxCalculator` separado:

```pseudocode
class Order
    - taxCalculator
    - lineItems, country, state, city

    method getOrderTotal() is
        total = 0
        foreach item in lineItems
            subtotal = item.price * item.quantity
            total += subtotal * taxCalc.getTaxRate(country, state, item.product)
        return total
```

## Aplicabilidad
- **Usar cuando:** logica de negocio cambia frecuentemente (ej. impuestos, descuentos, validaciones); un metodo mezcla logica estable con logica variable; se necesita preparar el codigo para futuros cambios previsibles; diferentes aspectos de una clase cambian por razones distintas.
- **No usar cuando:** el codigo es simple y estable sin cambios previsibles; la separacion introduce complejidad innecesaria en un programa pequeno; la logica variable es trivial (una o dos lineas) y no justifica la extraccion.

## Relaciones con otros patrones/principios
- Es la base del **Principio de Responsabilidad Unica (SRP)**: si encapsulas lo que varia, naturalmente cada clase tendra una sola razon para cambiar.
- Se relaciona con el patron **Strategy**: al encapsular comportamiento variable en clases separadas con una interfaz comun, se aplica directamente este patron.
- Complementa el **Principio Abierto/Cerrado**: al aislar lo que varia, el codigo estable queda cerrado a modificaciones pero abierto a extensiones.
