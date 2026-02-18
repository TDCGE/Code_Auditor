# Nuevos requerimientos para herramienta

## Contexto actual

Actualmente, la herramienta auditora de proyectos de vibe coding se enfoca en una fase 'post' desarrollo del software pensado.

Se está desarrollando un plugin ``tecnical-knowledge`` con el cual se darán directrices a los desarrolladores para una etapa inicial del desarrollo. El conocimiento del plugin tine como base técnica las skills `project-bootstrapper`, `best-practices` y `design-patterns-guide`. 

## Requerimientos Nuevos

- La herramienta DEBE ser capaz de alinearse completamente con las instrucciones y recomendaciones que el plugin de al desarrollador (de esta forma no hay incoherencias). Para esto, se evalua que el plugin genere un reporte de lo que se ha desarrollado hasta el momento, destacando en el mismo:
  - Decisiones de arquitectura:
    - La estructura a nivel de directorios del proyecto
    - La configuración de Git
    - La documentación
    - El setup de testing
    - Las herramientas de calidad de codigo
    - El manejo de dependencias
    - El workflow de desarrollo
    - El setup de CI/CD
  - Patrones de diseño y programación utilizados
  - Principios de programación utilizados
  - Decisiones de seguridad
  
  El nombre tentativo de este archivo es `guidelines.md`. Con este archivo donde se compacta todo lo desarrollado, se espera que la herramienta sea capaz de learla y comprenderla (con IA), para así dar auditoria al código sin entrar en incoherencias (por ejemplo: algo que sugirió Claude al principio, ahora el auditor dice que está mal, etc.).

- La herramienta se pueda utilizar en cualquier repositorio de github, directamente en github.com, como parte de una GitHub Action personalizada.