# Facade

## Intencion

Facade es un patron de diseno estructural que proporciona una interfaz simplificada a una biblioteca, un framework o cualquier otro conjunto complejo de clases. Reduce la complejidad visible para el cliente ofreciendo un punto de acceso unico y sencillo a la funcionalidad de un subsistema.

## Problema

Imagina que debes hacer que tu codigo trabaje con un amplio conjunto de objetos que pertenecen a una biblioteca o framework sofisticado. Normalmente, necesitarias inicializar todos esos objetos, rastrear dependencias, ejecutar metodos en el orden correcto, etc. Como resultado, la logica de negocio de tus clases quedaria fuertemente acoplada a los detalles de implementacion de las clases de terceros, haciendola dificil de comprender y mantener.

## Solucion

Una fachada es una clase que proporciona una interfaz simple a un subsistema complejo con muchas partes moviles. Puede ofrecer funcionalidad limitada en comparacion con trabajar directamente con el subsistema, pero incluye solo las funcionalidades que los clientes realmente necesitan.

Es especialmente util cuando se necesita integrar la aplicacion con una biblioteca sofisticada de la que solo se usa una pequena parte de su funcionalidad.

## Estructura

- **Facade**: proporciona acceso conveniente a una parte particular de la funcionalidad del subsistema. Sabe a donde dirigir las solicitudes del cliente y como operar todas las partes moviles.
- **Additional Facade** (opcional): se puede crear para evitar contaminar una sola fachada con funcionalidades no relacionadas. Puede ser usada tanto por clientes como por otras fachadas.
- **Complex Subsystem**: consiste en docenas de objetos diversos. Las clases del subsistema no son conscientes de la existencia de la fachada y trabajan entre si directamente.
- **Client**: usa la fachada en lugar de llamar directamente a los objetos del subsistema.

## Pseudocodigo

```pseudocode
// Clases del framework complejo de terceros
class VideoFile
// ...

class OggCompressionCodec
// ...

class MPEG4CompressionCodec
// ...

class CodecFactory
// ...

class BitrateReader
// ...

class AudioMixer
// ...

// Fachada que oculta la complejidad del framework
class VideoConverter is
    method convert(filename, format):File is
        file = new VideoFile(filename)
        sourceCodec = new CodecFactory.extract(file)
        if (format == "mp4")
            destinationCodec = new MPEG4CompressionCodec()
        else
            destinationCodec = new OggCompressionCodec()
        buffer = BitrateReader.read(filename, sourceCodec)
        result = BitrateReader.convert(buffer, destinationCodec)
        result = (new AudioMixer()).fix(result)
        return new File(result)

// Codigo cliente: simple y desacoplado del subsistema
class Application is
    method main() is
        convertor = new VideoConverter()
        mp4 = convertor.convert("funny-cats-video.ogg", "mp4")
        mp4.save()
```

## Aplicabilidad

- **Usar cuando:** se necesita una interfaz limitada pero directa a un subsistema complejo; se quiere estructurar un subsistema en capas, creando fachadas como puntos de entrada para cada nivel.
- **No usar cuando:** el subsistema ya es simple y no necesita una capa adicional; los clientes necesitan acceso completo a toda la funcionalidad del subsistema y una fachada limitaria innecesariamente.

## Ventajas y Desventajas

- Se puede aislar el codigo de la complejidad de un subsistema.
- Se facilita el mantenimiento: al actualizar el subsistema, solo se modifica la fachada.
- Se reduce el acoplamiento entre el cliente y las clases del subsistema.
- Una fachada puede convertirse en un "objeto dios" acoplado a todas las clases de la aplicacion.

## Relaciones con otros patrones

- **Facade** define una nueva interfaz para objetos existentes, mientras que **Adapter** intenta hacer utilizable la interfaz existente. Adapter generalmente envuelve un solo objeto, mientras que Facade trabaja con un subsistema completo.
- **Abstract Factory** puede servir como alternativa a **Facade** cuando solo se quiere ocultar la forma en que se crean los objetos del subsistema.
- **Flyweight** muestra como crear muchos objetos pequenos, mientras que **Facade** muestra como crear un solo objeto que represente un subsistema completo.
- **Facade** y **Mediator** tienen trabajos similares: organizar la colaboracion entre clases acopladas. Facade simplifica la interfaz sin agregar funcionalidad nueva; Mediator centraliza la comunicacion entre componentes.
- Una clase **Facade** puede a menudo transformarse en un **Singleton**, ya que un solo objeto fachada es suficiente en la mayoria de los casos.
- **Facade** es similar a **Proxy** en que ambos almacenan en buffer una entidad compleja. Sin embargo, Proxy tiene la misma interfaz que su objeto de servicio, lo que los hace intercambiables.
