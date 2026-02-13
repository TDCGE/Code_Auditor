# Principio de Segregacion de Interfaces (ISP)

## Intencion
Los clientes no deben verse forzados a depender de metodos que no utilizan. Este principio busca que las interfaces sean lo suficientemente estrechas para que las clases cliente no tengan que implementar comportamientos que no necesitan, dividiendo interfaces "gordas" en interfaces mas granulares y especificas.

## Problema
- Una interfaz tiene demasiados metodos y no todas las clases que la implementan necesitan todos ellos
- Al agregar un nuevo proveedor o implementacion, se descubre que algunos metodos de la interfaz no aplican y se deben dejar como stubs vacios
- Un cambio en un metodo de una interfaz grande afecta a clientes que ni siquiera usan ese metodo
- Las clases implementan metodos que no tienen sentido para ellas, solo para satisfacer el contrato de la interfaz

## Solucion
Dividir las interfaces grandes en interfaces mas pequenas y especificas. Cada interfaz debe agrupar metodos que esten cohesivamente relacionados. Las clases que necesitan todas las funcionalidades pueden implementar multiples interfaces. Las clases que solo necesitan un subconjunto implementan unicamente las interfaces relevantes.

## Pseudocodigo

### Antes (sin aplicar el principio)
```pseudocode
interface CloudProvider
    method storeFile(name)
    method getFile(name)
    method createServer(region)
    method listServers(region)
    method getCDNAddress()

class Amazon implements CloudProvider
    method storeFile(name) is // ... implementacion completa
    method getFile(name) is // ... implementacion completa
    method createServer(region) is // ... implementacion completa
    method listServers(region) is // ... implementacion completa
    method getCDNAddress() is // ... implementacion completa

class Dropbox implements CloudProvider
    method storeFile(name) is // ... implementacion completa
    method getFile(name) is // ... implementacion completa
    method createServer(region) is // No implementado (stub vacio)
    method listServers(region) is // No implementado (stub vacio)
    method getCDNAddress() is // No implementado (stub vacio)
```

### Despues (aplicando el principio)
```pseudocode
interface CloudStorageProvider
    method storeFile(name)
    method getFile(name)

interface CloudHostingProvider
    method createServer(region)
    method listServers(region)

interface CDNProvider
    method getCDNAddress()

class Amazon implements CloudStorageProvider, CloudHostingProvider, CDNProvider
    method storeFile(name) is // ...
    method getFile(name) is // ...
    method createServer(region) is // ...
    method listServers(region) is // ...
    method getCDNAddress() is // ...

class Dropbox implements CloudStorageProvider
    method storeFile(name) is // ...
    method getFile(name) is // ...
    // Solo implementa lo que realmente soporta
```

## Aplicabilidad
- **Usar cuando:** una interfaz tiene metodos que algunas implementaciones dejan vacios o lanzan excepciones; diferentes clientes usan diferentes subconjuntos de una interfaz grande; se quiere minimizar el impacto de cambios en la interfaz sobre clientes que no usan los metodos modificados; se integran multiples proveedores con diferentes capacidades.
- **No usar cuando:** la interfaz ya es pequena y cohesiva; dividirla mas generaria demasiadas micro-interfaces que complican el codigo; todos los implementadores realmente necesitan todos los metodos de la interfaz; el sistema es simple y la granularidad adicional no aporta beneficio.

## Relaciones con otros patrones/principios
- Complementa el **Principio de Responsabilidad Unica**: asi como las clases deben tener una sola responsabilidad, las interfaces deben agrupar solo metodos cohesivos.
- Apoya el **Principio de Sustitucion de Liskov**: interfaces mas pequenas reducen la probabilidad de que una implementacion tenga que violar el contrato con metodos vacios o excepciones.
- Se relaciona con el patron **Adapter**: cuando se necesita adaptar una interfaz grande a una mas especifica, el adaptador puede ayudar.
- Facilita la **Inversion de Dependencias**: interfaces granulares permiten que los modulos de alto nivel dependan solo de las abstracciones que realmente necesitan.
