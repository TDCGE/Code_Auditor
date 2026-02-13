# Principio de Sustitucion de Liskov (LSP)

## Intencion
Al extender una clase, se debe poder pasar objetos de la subclase en lugar de objetos de la clase padre sin romper el codigo cliente. La subclase debe permanecer compatible con el comportamiento de la superclase, extendiendo el comportamiento base en lugar de reemplazarlo por algo completamente diferente.

## Problema
- Una subclase sobrescribe un metodo y lanza una excepcion que el codigo cliente no espera
- Una subclase restringe los parametros que acepta un metodo, rompiendo el codigo que funcionaba con la clase padre
- Una subclase retorna un tipo mas general que lo esperado por el codigo cliente
- El codigo cliente necesita verificar el tipo concreto del objeto (usando `instanceof`) para evitar errores
- Al sustituir un objeto de la superclase por uno de la subclase, el programa falla o se comporta inesperadamente

## Solucion
El principio define un conjunto de reglas formales que las subclases deben cumplir:

1. **Tipos de parametros** de un metodo de la subclase deben coincidir o ser mas abstractos que los de la superclase
2. **Tipo de retorno** de un metodo de la subclase debe coincidir o ser un subtipo del retorno de la superclase
3. **No lanzar excepciones** que el metodo base no esperaria lanzar
4. **No fortalecer precondiciones**: no exigir mas restricciones en los parametros
5. **No debilitar postcondiciones**: mantener las garantias que el metodo base ofrece
6. **Preservar invariantes** de la superclase
7. **No modificar valores de campos privados** de la superclase

## Pseudocodigo

### Antes (sin aplicar el principio)
```pseudocode
class Document
    - data
    - filename

    method open() is // ...
    method save() is // ...

class ReadOnlyDocument extends Document
    method save() is
        throw new Exception("No se puede guardar un archivo de solo lectura.")

class Project
    - documents: Document[]

    method saveAll() is
        foreach (doc in documents)
            if (!doc instanceof ReadOnlyDocument)  // Violacion: verificacion de tipo
                doc.save()
```

### Despues (aplicando el principio)
```pseudocode
class Document
    - data
    - filename

    method open() is // ...

class WritableDocument extends Document
    method save() is // ...

class Project
    - allDocs: Document[]
    - writableDocs: WritableDocument[]

    method openAll() is
        foreach (doc in allDocs)
            doc.open()

    method saveAll() is
        foreach (doc in writableDocs)
            doc.save()
```

## Aplicabilidad
- **Usar cuando:** se disenan jerarquias de herencia y se quiere garantizar que las subclases sean intercambiables; se desarrollan librerias o frameworks donde otros usaran las clases; se necesita polimorfismo confiable donde cualquier subtipo funcione correctamente; el codigo cliente trabaja con tipos base y no debe conocer subtipos concretos.
- **No usar cuando:** no se usa herencia en el diseno; la jerarquia es extremadamente simple y controlada internamente; se prefiere composicion sobre herencia, lo que evita los problemas de sustitucion.

## Relaciones con otros patrones/principios
- Complementa el **Principio Abierto/Cerrado**: si las subclases no son sustituibles, el codigo cliente se vuelve dependiente de tipos concretos, violando OCP.
- Se relaciona con **Programar hacia una Interfaz**: al trabajar con interfaces, se espera que cualquier implementacion sea intercambiable.
- Apoya el **Principio de Segregacion de Interfaces**: interfaces mas pequenas y especificas reducen el riesgo de que una implementacion viole LSP.
- Refuerza **Favorecer Composicion sobre Herencia**: cuando es dificil cumplir LSP con herencia, la composicion puede ser una mejor alternativa.
