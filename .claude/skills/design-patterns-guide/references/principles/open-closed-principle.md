# Principio Abierto/Cerrado (OCP)

## Intencion
Las clases deben estar abiertas para extension pero cerradas para modificacion. El objetivo principal es evitar que el codigo existente se rompa cuando se implementan nuevas funcionalidades. Una clase esta "abierta" si se puede extender (crear subclases, agregar nuevos comportamientos) y "cerrada" si esta lista para ser usada por otras clases sin necesidad de modificar su codigo fuente.

## Problema
- Cada vez que se agrega una nueva funcionalidad, se debe modificar codigo existente que ya fue probado y revisado
- Modificar una clase existente arriesga introducir bugs en funcionalidades que ya funcionaban
- Los metodos contienen cadenas de condicionales (`if/else`, `switch`) que crecen cada vez que se agrega una nueva variante
- El codigo de una clase debe cambiar cada vez que se agregan nuevos tipos de objetos

## Solucion
En lugar de modificar el codigo de una clase directamente, crear subclases o implementar interfaces que extiendan el comportamiento original. Se puede aplicar el patron Strategy para extraer comportamientos variables a clases separadas con una interfaz comun. El codigo cliente trabaja con la interfaz, y nuevas implementaciones se agregan sin tocar el codigo existente.

## Pseudocodigo

### Antes (sin aplicar el principio)
```pseudocode
class Order
    - lineItems
    - shipping

    method getShippingCost() is
        if (shipping == "ground")
            // Envio terrestre gratis en pedidos grandes
            if (getTotal() > 100)
                return 0
            return max(10, getTotalWeight() * 1.5)

        if (shipping == "air")
            // Envio aereo: $3 por kilo, minimo $20
            return max(20, getTotalWeight() * 3)
        // Se debe modificar este metodo para cada nuevo tipo de envio
```

### Despues (aplicando el principio)
```pseudocode
interface Shipping
    method getCost(order)
    method getDate(order)

class Ground implements Shipping
    method getCost(order) is
        if (order.getTotal() > 100)
            return 0
        return max(10, order.getTotalWeight() * 1.5)

class Air implements Shipping
    method getCost(order) is
        return max(20, order.getTotalWeight() * 3)

class Order
    - shipping: Shipping

    method getShippingCost() is
        return shipping.getCost(this)
    // Agregar un nuevo tipo de envio NO requiere modificar Order
```

## Aplicabilidad
- **Usar cuando:** la clase contiene condicionales que cambian frecuentemente al agregar nuevas variantes; se necesita agregar nuevos comportamientos sin arriesgar funcionalidades existentes; el codigo ya esta probado, revisado y en produccion; se construyen frameworks o librerias que otros consumiran.
- **No usar cuando:** hay un bug en la clase -- simplemente hay que corregirlo, no crear una subclase para ello; la clase es simple y estable sin variantes previsibles; aplicar el principio agregaria capas de abstraccion innecesarias en un contexto simple.

## Relaciones con otros patrones/principios
- Se implementa frecuentemente mediante el patron **Strategy**: los comportamientos variables se extraen a clases con una interfaz comun.
- Complementa el **Principio de Responsabilidad Unica**: clases con una sola responsabilidad son mas faciles de mantener cerradas para modificacion.
- Se relaciona con el **Principio de Inversion de Dependencias**: al depender de abstracciones (interfaces), se facilita la extension sin modificacion.
- Aplica directamente **Encapsular lo que Varia**: lo que varia se extrae a clases separadas, dejando el codigo estable intacto.
