# Proxy

## Intencion

Proxy es un patron de diseno estructural que permite proporcionar un sustituto o marcador de posicion para otro objeto. Un proxy controla el acceso al objeto original, permitiendo realizar algo antes o despues de que la solicitud llegue al objeto real. Es ideal para agregar logica de acceso sin modificar la clase del servicio.

## Problema

Se tiene un objeto masivo que consume una gran cantidad de recursos del sistema. Se necesita de vez en cuando, pero no siempre. Se podria implementar inicializacion lazy (crear el objeto solo cuando se necesita), pero todos los clientes del objeto necesitarian ejecutar codigo de inicializacion diferida, lo que causaria mucha duplicacion de codigo. Ademas, puede que no sea posible modificar la clase directamente si es parte de una biblioteca de terceros cerrada.

## Solucion

Se crea una nueva clase proxy con la misma interfaz que el objeto de servicio original. Se actualiza la aplicacion para pasar el proxy a todos los clientes del objeto original. Al recibir una solicitud, el proxy crea el objeto de servicio real y le delega todo el trabajo.

La ventaja es que si se necesita ejecutar algo antes o despues de la logica primaria de la clase, el proxy permite hacerlo sin cambiar esa clase. Como el proxy implementa la misma interfaz que la clase original, puede pasarse a cualquier cliente que espere un objeto de servicio real.

## Estructura

- **Service Interface**: declara la interfaz del servicio. El proxy debe seguir esta interfaz para poder disfrazarse como un objeto de servicio.
- **Service**: clase que proporciona logica de negocio util.
- **Proxy**: tiene un campo de referencia que apunta al objeto de servicio. Despues de que el proxy termina su procesamiento (lazy init, logging, control de acceso, caching, etc.), pasa la solicitud al objeto de servicio. Generalmente gestiona el ciclo de vida completo de su servicio.
- **Client**: debe trabajar con servicios y proxies a traves de la misma interfaz, para poder pasar un proxy a cualquier codigo que espere un objeto de servicio.

## Pseudocodigo

```pseudocode
// Interfaz del servicio remoto
interface ThirdPartyYouTubeLib is
    method listVideos()
    method getVideoInfo(id)
    method downloadVideo(id)

// Implementacion concreta del servicio
class ThirdPartyYouTubeClass implements ThirdPartyYouTubeLib is
    method listVideos() is
        // Enviar solicitud API a YouTube.
    method getVideoInfo(id) is
        // Obtener metadata de algun video.
    method downloadVideo(id) is
        // Descargar un archivo de video de YouTube.

// Proxy con caching que implementa la misma interfaz
class CachedYouTubeClass implements ThirdPartyYouTubeLib is
    private field service: ThirdPartyYouTubeLib
    private field listCache, videoCache
    field needReset

    constructor CachedYouTubeClass(service: ThirdPartyYouTubeLib) is
        this.service = service

    method listVideos() is
        if (listCache == null || needReset)
            listCache = service.listVideos()
        return listCache

    method getVideoInfo(id) is
        if (videoCache == null || needReset)
            videoCache = service.getVideoInfo(id)
        return videoCache

    method downloadVideo(id) is
        if (!downloadExists(id) || needReset)
            service.downloadVideo(id)

// El cliente trabaja con el proxy a traves de la interfaz
class YouTubeManager is
    protected field service: ThirdPartyYouTubeLib
    constructor YouTubeManager(service: ThirdPartyYouTubeLib) is
        this.service = service
    method renderVideoPage(id) is
        info = service.getVideoInfo(id)
    method renderListPanel() is
        list = service.listVideos()

// La aplicacion configura el proxy transparentemente
class Application is
    method init() is
        aYouTubeService = new ThirdPartyYouTubeClass()
        aYouTubeProxy = new CachedYouTubeClass(aYouTubeService)
        manager = new YouTubeManager(aYouTubeProxy)
        manager.reactOnUserInput()
```

## Aplicabilidad

- **Usar cuando:**
  - **Inicializacion lazy (proxy virtual):** se tiene un objeto pesado que desperdicia recursos al estar siempre activo.
  - **Control de acceso (proxy de proteccion):** solo clientes especificos deben poder usar el servicio.
  - **Ejecucion local de servicio remoto (proxy remoto):** el objeto de servicio esta en un servidor remoto.
  - **Logging (proxy de logging):** se quiere mantener un historial de solicitudes al servicio.
  - **Caching (proxy de caching):** se necesitan cachear resultados de solicitudes recurrentes.
  - **Referencia inteligente (smart reference):** se necesita liberar un objeto pesado cuando ningun cliente lo use.
- **No usar cuando:** no se necesita ninguna logica adicional antes o despues de la solicitud; el acceso directo al servicio es suficiente y la indirection del proxy solo agregaria latencia innecesaria.

## Ventajas y Desventajas

- Se puede controlar el objeto de servicio sin que los clientes lo sepan.
- Se puede gestionar el ciclo de vida del servicio cuando los clientes no se preocupan por ello.
- El proxy funciona incluso si el servicio no esta listo o disponible.
- Principio Abierto/Cerrado: se pueden introducir nuevos proxies sin cambiar el servicio ni los clientes.
- El codigo puede volverse mas complicado al introducir muchas clases nuevas.
- La respuesta del servicio podria retrasarse por la indirection del proxy.

## Relaciones con otros patrones

- **Adapter** proporciona una interfaz diferente al objeto envuelto, **Proxy** proporciona la misma interfaz, y **Decorator** una interfaz mejorada.
- **Facade** es similar a **Proxy** en que ambos almacenan en buffer una entidad compleja e la inicializan por su cuenta. Sin embargo, Proxy tiene la misma interfaz que su objeto de servicio, lo que los hace intercambiables.
- **Decorator** y **Proxy** tienen estructuras similares, pero intenciones muy diferentes. Ambos se basan en composicion, pero Proxy generalmente gestiona el ciclo de vida de su servicio por su cuenta, mientras que la composicion de Decorators siempre la controla el cliente.
