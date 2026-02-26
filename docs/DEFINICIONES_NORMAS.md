# Definiciones y Normas — Glosario Tecnico del CGE-Verificator

**Version:** 1.0
**Fecha:** 2026-02-26
**Proposito:** Documento complementario al [Marco Normativo](./MARCO_NORMATIVO.md) que define cada concepto tecnico con definicion concisa y ejemplo practico. Sirve como referencia rapida para desarrolladores y auditores.

> Cada entrada indica la regla del marco normativo asociada (ej. `SEC-01`) cuando aplica.

---

## Indice

1. [Niveles de Severidad y Clasificacion](#1-niveles-de-severidad-y-clasificacion)
2. [Seguridad: Credenciales y Secretos](#2-seguridad-credenciales-y-secretos)
3. [Seguridad: Autenticacion y Control de Acceso](#3-seguridad-autenticacion-y-control-de-acceso)
4. [Seguridad: Cabeceras y Proteccion Web](#4-seguridad-cabeceras-y-proteccion-web)
5. [Seguridad: Vulnerabilidades y Dependencias](#5-seguridad-vulnerabilidades-y-dependencias)
6. [Arquitectura: Antipatrones Estructurales](#6-arquitectura-antipatrones-estructurales)
7. [Calidad de Codigo: Metricas y Olores](#7-calidad-de-codigo-metricas-y-olores)
8. [Rendimiento: Antipatrones y Estrategias](#8-rendimiento-antipatrones-y-estrategias)
9. [Testing: Cobertura y Calidad de Pruebas](#9-testing-cobertura-y-calidad-de-pruebas)
10. [Mantenibilidad: Documentacion y Herramientas](#10-mantenibilidad-documentacion-y-herramientas)
11. [Principios Fundamentales de Diseno](#11-principios-fundamentales-de-diseno)
12. [Principios SOLID](#12-principios-solid)
13. [Patrones Creacionales (GoF)](#13-patrones-creacionales-gof)
14. [Patrones Estructurales (GoF)](#14-patrones-estructurales-gof)
15. [Patrones de Comportamiento (GoF)](#15-patrones-de-comportamiento-gof)
16. [Compatibilidad de Navegador](#16-compatibilidad-de-navegador)
17. [Anti Sobre-Ingenieria](#17-anti-sobre-ingenieria)
18. [Referencias Cruzadas](#18-referencias-cruzadas)

---

## 1. Niveles de Severidad y Clasificacion

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **HIGH (Critico)** | Hallazgo que representa un riesgo grave e inmediato. Bloquea el despliegue a produccion y debe corregirse antes de merge a rama principal. Peso: 3. | `SEC-01`: Una API key de AWS hardcodeada en el codigo fuente expone la infraestructura a accesos no autorizados. |
| **MEDIUM (Medio)** | Hallazgo que representa un riesgo moderado. Requiere plan de accion y debe resolverse en el sprint actual o siguiente. Peso: 2. | `COD-01`: Una funcion de 80 lineas dificulta la comprension y el testing, pero no causa un fallo inmediato. |
| **LOW (Bajo)** | Recomendacion de mejora que no representa riesgo directo. Puede priorizarse en backlog sin bloquear entregas. Peso: 1. | `MAN-04`: Falta de configuracion de formatter; el codigo funciona pero el estilo es inconsistente. |

---

## 2. Seguridad: Credenciales y Secretos

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **Credencial hardcodeada** | Valor secreto (password, token, key) escrito directamente en el codigo fuente en vez de cargarse desde variables de entorno o un vault. `SEC-01` | `const dbPassword = "s3cr3t123";` en un archivo de configuracion commiteado al repositorio. |
| **API Key** | Clave unica que identifica y autoriza a un cliente para consumir un servicio externo. Si se expone, terceros pueden consumir el servicio en nombre del propietario. `SEC-01` | `const GEMINI_KEY = "AIzaSy...";` hardcodeada en lugar de usar `process.env.GEMINI_API_KEY`. |
| **AWS Access Key** | Par de credenciales (Access Key ID + Secret Access Key) que otorga acceso programatico a servicios de Amazon Web Services. Su exposicion puede comprometer toda la infraestructura cloud. `SEC-01` | `AKIA` seguido de 16 caracteres alfanumericos encontrado en un archivo `.ts`. |
| **Private Key** | Clave criptografica privada (RSA, EC, PGP) que debe mantenerse secreta. Su exposicion compromete la identidad digital y permite suplantacion o descifrado de datos. `SEC-01` | Bloque `-----BEGIN RSA PRIVATE KEY-----` encontrado en un archivo del repositorio. |
| **Correo corporativo hardcodeado** | Direccion de email de la organizacion escrita directamente en el codigo. Puede ser usada para phishing dirigido o ingenieria social. `SEC-02` | `const support = "admin@empresa.cl";` en lugar de cargarlo desde configuracion externa. |
| **Variables de entorno (`process.env`)** | Mecanismo del sistema operativo para inyectar configuracion sensible sin exponerla en el codigo fuente. El SecretScanner excluye lineas que usan `process.env` del analisis de secretos. | `const key = process.env.GEMINI_API_KEY;` — forma correcta de acceder a un secreto. |

---

## 3. Seguridad: Autenticacion y Control de Acceso

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **JWT (JSON Web Token)** | Estandar (RFC 7519) para transmitir claims entre partes como un objeto JSON firmado. Se usa para autenticacion stateless. `SEC-03` | `eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiam9obiJ9.signature` — token con header, payload y firma. |
| **`verify()` vs `decode()`** | `verify()` valida la firma criptografica del JWT, asegurando su integridad y autenticidad. `decode()` solo lee el payload sin validar la firma, permitiendo tokens falsificados. `SEC-03` | `jwt.verify(token, secret)` (correcto) vs `jwt.decode(token)` (inseguro, acepta cualquier token). |
| **Expiracion de token (`exp`)** | Claim del JWT que define su tiempo de vida. Sin expiracion, un token robado puede usarse indefinidamente. `SEC-03` | `jwt.sign({ user }, secret, { expiresIn: '1h' })` — el token expira en 1 hora. |
| **Hashing de passwords** | Transformacion unidireccional de una contrasenya en un digest irreversible. Debe usar algoritmos con salt y factor de trabajo (bcrypt, scrypt, argon2). `SEC-04` | `await bcrypt.hash(password, 12)` — genera hash con 12 rondas de salt. |
| **MD5/SHA1 (algoritmos prohibidos)** | Funciones de hash criptografico obsoletas con colisiones conocidas. No deben usarse para passwords ni firmas digitales. `SEC-04` | `crypto.createHash('md5').update(password)` — inseguro, vulnerable a ataques de fuerza bruta y rainbow tables. |
| **RBAC (Role-Based Access Control)** | Modelo de control de acceso donde los permisos se asignan a roles, y los usuarios reciben roles. Toda ruta sensible debe verificar el rol del usuario. `SEC-05` | Middleware `requireRole('admin')` que verifica `req.user.role` antes de permitir acceso a `/api/users/delete`. |
| **Cookies seguras** | Configuracion de cookies de sesion con atributos de seguridad: `httpOnly` (no accesible via JavaScript), `secure` (solo HTTPS), `sameSite` (proteccion CSRF). `SEC-06` | `Set-Cookie: session=abc; Secure; HttpOnly; SameSite=Strict` — configuracion correcta. |

---

## 4. Seguridad: Cabeceras y Proteccion Web

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **HTTPS / HSTS** | HTTPS cifra la comunicacion entre cliente y servidor via TLS. HSTS (HTTP Strict Transport Security) es una cabecera que fuerza al navegador a usar siempre HTTPS, previniendo ataques de downgrade. | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| **Content Security Policy (CSP)** | Cabecera HTTP que define las fuentes permitidas de scripts, estilos, imagenes y conexiones. Mitiga XSS al bloquear la ejecucion de codigo de fuentes no autorizadas. | `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'` — solo permite scripts del mismo origen o con nonce valido. |
| **X-Frame-Options** | Cabecera que controla si la pagina puede ser embebida en un `<iframe>`. Previene ataques de clickjacking donde un sitio malicioso superpone la pagina legitima. | `X-Frame-Options: DENY` — la pagina no puede ser embebida en ningun iframe. |
| **X-Content-Type-Options** | Cabecera que impide que el navegador interprete archivos con un tipo MIME diferente al declarado (MIME sniffing). Previene ejecucion de scripts disfrazados. | `X-Content-Type-Options: nosniff` — un archivo `.txt` no se ejecutara como JavaScript aunque contenga codigo. |
| **X-XSS-Protection** | Cabecera legacy que activa el filtro XSS integrado en navegadores antiguos. En navegadores modernos, CSP lo reemplaza. | `X-XSS-Protection: 1; mode=block` — bloquea la pagina si detecta un ataque XSS reflejado. |
| **Referrer-Policy** | Cabecera que controla cuanta informacion de la URL de origen se envia en la cabecera `Referer` al navegar a otro sitio. Protege URLs con datos sensibles. | `Referrer-Policy: strict-origin-when-cross-origin` — envia solo el origen (sin path) en peticiones cross-origin. |
| **Permissions-Policy** | Cabecera (antes Feature-Policy) que restringe el acceso a APIs del navegador como geolocalizacion, camara y microfono. Minimiza la superficie de ataque. | `Permissions-Policy: geolocation=(), camera=(), microphone=()` — deshabilita estas APIs completamente. |
| **Sanitizacion de input** | Proceso de limpiar o escapar datos proporcionados por el usuario antes de renderizarlos o procesarlos. Previene XSS y otras inyecciones. | `element.textContent = userInput` (seguro) vs `element.innerHTML = userInput` (vulnerable a XSS). |
| **Mixed content** | Carga de recursos HTTP en una pagina servida via HTTPS. El navegador puede bloquearlos o mostrar advertencias, y representan un vector de ataque man-in-the-middle. | `<img src="http://cdn.com/img.jpg">` en una pagina HTTPS — debe ser `https://cdn.com/img.jpg`. |

---

## 5. Seguridad: Vulnerabilidades y Dependencias

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **CVE (Common Vulnerabilities and Exposures)** | Identificador unico asignado a una vulnerabilidad de seguridad conocida y publicada. Permite rastrear y comunicar vulnerabilidades de forma estandarizada. `SEC-07` | `CVE-2021-44228` — vulnerabilidad critica de Log4Shell en Apache Log4j. |
| **`npm audit`** | Comando que analiza el arbol de dependencias del proyecto y reporta paquetes con vulnerabilidades conocidas, clasificadas por severidad. `SEC-07`, `SEC-08` | `npm audit` muestra 3 vulnerabilidades altas en `lodash@4.17.20`; `npm audit fix` las corrige automaticamente. |
| **Prototype pollution** | Vulnerabilidad donde un atacante modifica el prototipo base de objetos JavaScript (`Object.prototype`), afectando todas las instancias. Comun en funciones de merge profundo. `SEC-07` | `_.merge(target, userInput)` puede inyectar `{__proto__: {isAdmin: true}}` y elevar privilegios. |
| **Dependencia vulnerable** | Paquete de terceros incluido en el proyecto que tiene una vulnerabilidad de seguridad conocida (CVE) sin parchear. Las de severidad critica o alta bloquean despliegue. `SEC-07` | Una version antigua de `express` con un CVE de denegacion de servicio en su parser de headers. |
| **Plan de actualizacion** | Estrategia documentada para actualizar dependencias con vulnerabilidades moderadas. Incluye cronograma, pruebas de regresion y rollback plan. `SEC-08` | Documentar en el sprint backlog: "Actualizar `axios` de 0.21 a 1.x antes del 15/03 — requiere ajustar interceptors". |

---

## 6. Arquitectura: Antipatrones Estructurales

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **Estructura de directorios convencional** | Organizacion del proyecto siguiendo las convenciones del framework o ecosistema (`src/`, `tests/`, `docs/`, etc.). Facilita la navegacion y comprension del proyecto. `ARQ-01` | Un proyecto Node.js con `src/controllers/`, `src/services/`, `src/models/`, `tests/` y `package.json` en la raiz. |
| **God Object** | Clase o modulo que concentra demasiadas responsabilidades (mas de 3 distintas), violando SRP. Dificulta testing, genera alto acoplamiento y hace fragiles los cambios. `ARQ-02` | Clase `UserManager` que maneja autenticacion, envio de emails, acceso a base de datos, validacion de formularios y logging. |
| **Dependencia circular** | Situacion donde el modulo A importa el modulo B y el modulo B importa el modulo A (directa o transitivamente). Causa problemas de inicializacion y alto acoplamiento. `ARQ-03` | `UserService` importa `OrderService` para obtener pedidos, y `OrderService` importa `UserService` para validar usuarios. Solucion: extraer interfaz compartida o usar eventos. |
| **Dependencia inversa entre capas** | Violacion de la arquitectura por capas donde una capa inferior depende de una superior (ej. modelo importa controlador). Rompe el principio de dependencia unidireccional. `ARQ-04` | Un archivo en `src/models/User.ts` que hace `import { UserController } from '../controllers/UserController'`. |
| **Acoplamiento temporal** | Dependencia implicita en el orden de ejecucion de operaciones. Si las llamadas deben realizarse en secuencia especifica para funcionar, pero nada en la API lo fuerza. `ARQ-06` | `init()` debe llamarse antes de `connect()`, que debe llamarse antes de `query()`, pero el compilador no lo impide — un llamado en orden incorrecto causa fallos silenciosos. |

---

## 7. Calidad de Codigo: Metricas y Olores

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **Longitud de funcion** | Metrica que cuenta las lineas de codigo de una funcion. Funciones largas (>50 lineas) tienden a tener multiples responsabilidades y son dificiles de comprender y testear. `COD-01` | Una funcion `processOrder()` de 120 lineas que valida datos, calcula precios, aplica descuentos, actualiza inventario y envia email. Debe dividirse en funciones de responsabilidad unica. |
| **Profundidad de anidamiento** | Cantidad de niveles de bloques anidados (if, for, while, try) dentro de una funcion. Mas de 3 niveles dificulta la lectura y aumenta la complejidad cognitiva. `COD-02` | `if (user) { if (user.active) { for (order of orders) { if (order.valid) { ... } } } }` — 4 niveles. Refactorizar con early returns o funciones auxiliares. |
| **Complejidad ciclomatica** | Metrica que mide el numero de caminos linealmente independientes a traves de una funcion. Cada `if`, `else`, `case`, `&&`, `||` y `catch` incrementa el valor. Maximo recomendado: 10. `COD-03` | Funcion con 12 ramas condicionales tiene complejidad ciclomatica 12 — requiere al menos 12 tests para cobertura completa de caminos. |
| **Codigo duplicado** | Bloques de mas de 10 lineas identicas o casi identicas en diferentes partes del proyecto. Viola DRY y aumenta el riesgo de bugs por correcciones parciales. `COD-04` | La misma logica de validacion de email (15 lineas) copiada en `UserController`, `RegistrationService` y `ProfileForm`. Solucion: extraer a funcion compartida. |
| **Consistencia de nomenclatura** | Uso uniforme de una convencion de nombres dentro del proyecto. Mezclar `camelCase` con `snake_case` dificulta la lectura y busqueda de identificadores. `COD-05` | `getUserData()` junto a `get_order_list()` en el mismo proyecto. Elegir una convencion y aplicarla en todo el codigo. |
| **Exceso de parametros** | Funciones con mas de 4 parametros son dificiles de usar, recordar y testear. Indica que la funcion puede tener multiples responsabilidades o necesitar un objeto de configuracion. `COD-06` | `createUser(name, email, age, role, department, isActive)` — 6 parametros. Refactorizar a `createUser(options: CreateUserOptions)`. |
| **Bloque catch vacio** | Bloque `try/catch` que captura una excepcion pero no la maneja (ni registra, ni relanza, ni transforma). Silencia errores y oculta bugs. `COD-07` | `try { parseData(input); } catch (e) { }` — si `parseData` falla, el error desaparece y el programa continua con datos invalidos. |
| **Promesa sin manejo de rejection** | Promesa que no tiene `.catch()` ni esta dentro de `try/await`. Una rejection no manejada puede causar crashes silenciosos o `UnhandledPromiseRejection`. `COD-08` | `fetch('/api/data').then(r => r.json())` — si la peticion falla, la rejection no se captura. Corregir: `.catch(err => handleError(err))` o envolver en `try/await`. |

---

## 8. Rendimiento: Antipatrones y Estrategias

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **Consulta N+1** | Antipatron donde se ejecuta 1 consulta para obtener una lista y luego N consultas adicionales (una por cada elemento) para obtener datos relacionados. Causa degradacion exponencial. `REN-01` | `const users = await getUsers(); for (const u of users) { u.orders = await getOrders(u.id); }` — si hay 100 usuarios, se ejecutan 101 queries. Solucion: `JOIN` o `WHERE id IN (...)`. |
| **Paginacion** | Tecnica que divide resultados en paginas de tamanyo fijo para evitar cargar colecciones completas en memoria. Toda query que retorna colecciones debe incluirla. `REN-02` | `SELECT * FROM products LIMIT 20 OFFSET 40` — retorna la pagina 3 de 20 elementos. En APIs: `GET /api/products?page=3&limit=20`. |
| **Cierre de recursos** | Practica de liberar explicitamente conexiones a DB, streams, file handles y sockets cuando ya no se necesitan. Evita fugas de memoria y agotamiento de conexiones. `REN-03` | `const conn = await pool.getConnection(); try { ... } finally { conn.release(); }` — `finally` garantiza la liberacion incluso si hay error. |
| **Operacion sincrona bloqueante** | Operacion que detiene el event loop del servidor hasta completarse (lectura de archivos, calculo intensivo). Impide atender otras peticiones durante la espera. `REN-04` | `const data = fs.readFileSync('/large-file.csv')` en un endpoint HTTP — bloquea todas las peticiones concurrentes. Usar `fs.promises.readFile()` o streams. |
| **Estrategia de cache** | Mecanismo para almacenar resultados de operaciones costosas y reutilizarlos en peticiones posteriores. Reduce latencia y carga en servicios externos. `REN-05` | Cache en memoria con TTL: `const cached = cache.get(key); if (!cached) { result = await expensiveCall(); cache.set(key, result, 300); }`. |
| **Complejidad algoritmica O(n²)** | Algoritmo cuyo tiempo de ejecucion crece cuadraticamente con el tamanyo de la entrada. Debe justificarse cuando existen alternativas O(n log n) o mejores. `REN-06` | Buscar duplicados con doble loop anidado: `for (i) { for (j) { if (arr[i] === arr[j]) ... } }`. Alternativa O(n): usar un `Set`. |
| **Event delegation** | Tecnica de rendimiento que registra un unico event listener en un contenedor padre en vez de uno por cada elemento hijo. Reduce consumo de memoria y mejora rendimiento con listas dinamicas. | `container.addEventListener('click', e => { if (e.target.matches('.item')) handleClick(e); })` en lugar de un listener por cada `.item`. |

---

## 9. Testing: Cobertura y Calidad de Pruebas

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **Ratio test-a-codigo** | Proporcion entre archivos de test y archivos de codigo fuente. Indica el nivel de cobertura de pruebas del proyecto. Minimo aceptable: 10%; deseable: ≥30%. `TST-01`, `TST-02` | Proyecto con 50 archivos de codigo y 18 archivos de test = ratio 36%. Cumple el umbral deseable. |
| **Framework de testing** | Herramienta configurada y funcional para ejecutar tests automatizados (Jest, Mocha, Vitest, pytest, JUnit). Su ausencia impide validar la correctitud del codigo. `TST-03` | `jest.config.ts` presente con `testMatch: ['**/*.test.ts']` y script `"test": "jest"` en `package.json`. |
| **Assertions especificas** | Verificaciones de test que validan valores concretos en lugar de condiciones genericas. Dan mensajes de error claros y detectan regresiones con precision. `TST-04` | `expect(result).toEqual({ id: 1, name: 'John' })` (especifico) vs `expect(result).toBeTruthy()` (generico — cualquier objeto truthy pasa). |
| **Edge cases** | Casos limite que representan condiciones extremas o inusuales: valores nulos, colecciones vacias, limites numericos, entradas malformadas. Suelen revelar bugs ocultos. `TST-05` | Testear `divide(a, b)` con: `b = 0` (division por cero), `a = Number.MAX_SAFE_INTEGER` (overflow), `a = -0` (cero negativo), `b = NaN`. |
| **Test de comportamiento** | Test que verifica *que* hace el codigo (outputs observables) sin acoplarse a *como* lo hace (implementacion interna). Resistente a refactorizaciones. `TST-06` | `expect(cart.total()).toBe(150)` (comportamiento) vs `expect(cart._items.length).toBe(3)` (implementacion — se rompe si renombran `_items`). |
| **Mock / Stub** | Objetos simulados que reemplazan dependencias reales durante testing. Mocks verifican interacciones; stubs proveen respuestas predefinidas. Facilitan tests aislados y rapidos. | `jest.spyOn(emailService, 'send').mockResolvedValue(true)` — reemplaza el envio real de email con una respuesta simulada. |

---

## 10. Mantenibilidad: Documentacion y Herramientas

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **JSDoc / Docstrings / Javadoc** | Comentarios estructurados que documentan la firma, proposito y comportamiento de funciones y clases publicas. Alimentan editores (autocompletado) y generadores de documentacion. `MAN-01` | `/** @param {string} email - Email del usuario. @returns {boolean} True si el formato es valido. */` sobre una funcion `validateEmail()`. |
| **README.md** | Archivo en la raiz del proyecto que describe su proposito, requisitos, instrucciones de instalacion, ejecucion y contribucion. Primer punto de contacto para nuevos desarrolladores. `MAN-02` | README con secciones: Descripcion, Requisitos previos, Instalacion (`npm install`), Ejecucion (`npm start`), Testing (`npm test`). |
| **Linter** | Herramienta de analisis estatico que detecta errores, malas practicas y violaciones de estilo en codigo fuente sin ejecutarlo (ESLint, Pylint, Checkstyle). `MAN-03` | Archivo `.eslintrc.json` configurado con reglas `no-unused-vars`, `no-console`, `@typescript-eslint/strict` y script `"lint": "eslint src/"`. |
| **Formatter** | Herramienta que reformatea automaticamente el codigo segun reglas de estilo predefinidas (Prettier, Black, google-java-format). Garantiza consistencia visual sin debates. `MAN-04` | Archivo `.prettierrc` con `{ "semi": true, "singleQuote": true, "tabWidth": 2 }` y script `"format": "prettier --write src/"`. |
| **Dependencias cruzadas entre capas** | Imports entre modulos de capas arquitectonicas que deberian ser independientes. Deben minimizarse y documentarse explicitamente cuando existan. `MAN-05` | Un `service/` que importa directamente un `controller/` en vez de comunicarse a traves de interfaces o eventos. |
| **guidelines.md** | Archivo en la raiz del proyecto auditado que establece convenciones, decisiones arquitectonicas y estandares propios. El CGE-Verificator lo inyecta como contexto en los scanners AI. `MAN-06` | `guidelines.md` indicando: "Usar Repository Pattern para acceso a datos. Todas las APIs deben devolver formato `{ data, error, meta }`.". |

---

## 11. Principios Fundamentales de Diseno

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **Encapsular lo que varia** | Identificar los aspectos del codigo que cambian y separarlos de los que permanecen estables. Aislar la variabilidad en clases o modulos independientes limita el impacto de los cambios. | Una clase `TaxCalculator` que cambia segun el pais. Encapsular cada calculo en una estrategia (`ChileTax`, `USATax`) en vez de un `switch` que crece con cada pais nuevo. |
| **Programar hacia interfaces, no implementaciones** | Depender de abstracciones (interfaces, tipos abstractos) en vez de clases concretas. Permite intercambiar implementaciones sin afectar al codigo cliente. | `function notify(sender: MessageSender)` donde `MessageSender` es una interfaz, no la clase concreta `EmailSender`. Permite inyectar `SmsSender` o `SlackSender` sin cambiar la funcion. |
| **Composicion sobre herencia** | Preferir combinar objetos simples (has-a) sobre construir jerarquias de herencia (is-a). La composicion es mas flexible, evita jerarquias fragiles y permite combinar comportamientos en runtime. | En vez de `class FlyingSwimmingDuck extends FlyingDuck`, componer: `class Duck { fly: FlyBehavior; swim: SwimBehavior; }` — permite cambiar comportamientos independientemente. |

---

## 12. Principios SOLID

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **SRP — Single Responsibility Principle** | Cada clase debe tener una unica razon para cambiar, es decir, una sola responsabilidad. Reduce acoplamiento y facilita testing y mantenimiento. Reglas: `ARQ-02`, `COD-01`, `COD-06`. | Separar `UserService` (logica de negocio) de `UserRepository` (acceso a datos) y `UserValidator` (validacion). Cada uno cambia por razones independientes. |
| **OCP — Open/Closed Principle** | Las clases deben estar abiertas para extension pero cerradas para modificacion. Nueva funcionalidad se agrega creando nuevas clases, no modificando existentes. Reglas: `ARQ-05`, `ARQ-06`. | Agregar un nuevo tipo de descuento creando `class BlackFridayDiscount implements DiscountStrategy` en vez de agregar otro `case` al `switch` de `calculateDiscount()`. |
| **LSP — Liskov Substitution Principle** | Las subclases deben poder sustituir a sus clases base sin alterar el comportamiento esperado del programa. Precondiciones no se refuerzan, postcondiciones no se debilitan. Reglas: `ARQ-04`, `ARQ-05`. | Si `Rectangle` tiene `setWidth()` y `setHeight()`, `Square` no deberia heredar de `Rectangle` porque `setWidth()` en `Square` tambien cambia la altura, rompiendo las expectativas del cliente. |
| **ISP — Interface Segregation Principle** | Los clientes no deben depender de interfaces que no usan. Preferir muchas interfaces pequenyas y especificas sobre una interfaz grande y general. Reglas: `ARQ-02`, `COD-06`. | Separar `interface Printable { print(): void }` y `interface Scannable { scan(): void }` en vez de forzar `interface Machine { print(); scan(); fax(); }` donde una impresora simple debe implementar `fax()`. |
| **DIP — Dependency Inversion Principle** | Los modulos de alto nivel no deben depender de modulos de bajo nivel; ambos deben depender de abstracciones. Los detalles dependen de las abstracciones, no al reves. Reglas: `ARQ-03`, `ARQ-04`, `SEC-03`, `SEC-04`. | `class OrderService { constructor(private repo: OrderRepository) {} }` donde `OrderRepository` es una interfaz. En produccion se inyecta `PostgresOrderRepo`; en tests, `InMemoryOrderRepo`. |

---

## 13. Patrones Creacionales (GoF)

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **Factory Method** | Define una interfaz para crear objetos, pero permite a las subclases decidir que clase instanciar. Desacopla la construccion del uso, cumpliendo DIP y OCP. | `abstract class Dialog { abstract createButton(): Button; }` — `WindowsDialog` crea `WindowsButton`, `MacDialog` crea `MacButton`. El cliente usa `Dialog` sin conocer la plataforma. |
| **Abstract Factory** | Provee una interfaz para crear familias de objetos relacionados sin especificar sus clases concretas. Garantiza que los objetos creados sean compatibles entre si. | `interface UIFactory { createButton(): Button; createInput(): Input; }` — `DarkThemeFactory` crea componentes oscuros, `LightThemeFactory` crea componentes claros. |
| **Builder** | Separa la construccion de un objeto complejo de su representacion, permitiendo construirlo paso a paso. Util cuando un constructor tendria demasiados parametros. | `new QueryBuilder().select('name').from('users').where('active = true').limit(10).build()` — encadena pasos y produce el objeto final con `build()`. |
| **Prototype** | Crea nuevos objetos clonando una instancia existente en vez de construir desde cero. Util cuando la creacion es costosa o la configuracion es compleja. | `const template = { theme: 'dark', locale: 'es', permissions: [...] }; const userConfig = Object.create(template);` — clona la configuracion base y personaliza. |
| **Singleton** | Garantiza que una clase tenga exactamente una instancia y proporciona un punto de acceso global a ella. Usar con cautela: dificulta testing y acopla codigo. | `class Database { private static instance: Database; static getInstance() { if (!this.instance) this.instance = new Database(); return this.instance; } }` |

---

## 14. Patrones Estructurales (GoF)

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **Adapter** | Convierte la interfaz de una clase en otra que el cliente espera. Permite colaborar a clases con interfaces incompatibles sin modificarlas. | `class XmlToJsonAdapter implements JsonParser { parse(data) { return xmlLib.parse(data).toJSON(); } }` — adapta una libreria XML para usarse donde se espera JSON. |
| **Bridge** | Separa una abstraccion de su implementacion para que ambas puedan variar independientemente. Evita explosion combinatoria de clases cuando hay multiples dimensiones de variacion. | Separar `Shape` (circulo, cuadrado) de `Renderer` (OpenGL, SVG): `class Circle { constructor(private renderer: Renderer) {} draw() { this.renderer.renderCircle(); } }`. |
| **Composite** | Compone objetos en estructuras de arbol para representar jerarquias parte-todo. Permite tratar objetos individuales y compuestos de manera uniforme. | Sistema de archivos: `interface FileSystemItem { getSize(): number; }` implementado por `File` (hoja) y `Directory` (compuesto que contiene otros items y suma sus tamanios). |
| **Decorator** | Agrega responsabilidades a un objeto dinamicamente envolviendo al original. Alternativa flexible a la herencia para extender funcionalidad. Cumple OCP y LSP. | `new CompressionDecorator(new EncryptionDecorator(new FileWriter()))` — agrega compresion y encriptacion al escritor de archivos sin modificar la clase original. Analogia en el proyecto: `JsonReporter` decora a `ConsoleReporter`. |
| **Facade** | Proporciona una interfaz simplificada a un subsistema complejo. Reduce la complejidad visible para el cliente sin eliminar la flexibilidad del subsistema. Cumple ISP. | `class VideoConverter { convert(file, format) { /* coordina codec, audio, bitrate, metadata internamente */ } }` — el cliente solo llama `convert()` sin conocer los 15 pasos internos. |
| **Flyweight** | Comparte estado inmutable entre muchos objetos similares para reducir el consumo de memoria. Separa estado intrinseco (compartido) de extrinseco (unico por contexto). | Editor de texto: en vez de un objeto por cada caracter con su fuente y color, comparte objetos `CharFormat('Arial', 12, 'black')` entre todos los caracteres con ese formato. |
| **Proxy** | Proporciona un sustituto o placeholder de otro objeto para controlar el acceso a el. Variantes: lazy loading, cache, control de acceso, logging. | `class CachedApiProxy implements ApiClient { get(url) { if (cache.has(url)) return cache.get(url); const result = this.realClient.get(url); cache.set(url, result); return result; } }` |

---

## 15. Patrones de Comportamiento (GoF)

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **Chain of Responsibility** | Permite pasar una solicitud a lo largo de una cadena de handlers. Cada handler decide si procesa la solicitud o la pasa al siguiente. Desacopla emisor de receptor. Cumple SRP. | Middleware de Express: `app.use(authMiddleware); app.use(loggingMiddleware); app.use(rateLimitMiddleware);` — cada middleware procesa o pasa al siguiente con `next()`. |
| **Command** | Encapsula una solicitud como un objeto, permitiendo parametrizar clientes con diferentes operaciones, encolar, registrar o deshacer solicitudes. Cumple SRP. | `class PasteCommand implements Command { execute() { editor.paste(); } undo() { editor.deleteLast(); } }` — el historial de comandos permite Ctrl+Z. |
| **Iterator** | Proporciona una forma de acceder secuencialmente a los elementos de una coleccion sin exponer su representacion interna. Soporta procesamiento lazy de colecciones grandes. | `function* fibonacci() { let [a, b] = [0, 1]; while (true) { yield a; [a, b] = [b, a + b]; } }` — genera valores bajo demanda sin almacenar la secuencia completa en memoria. |
| **Mediator** | Define un objeto que encapsula como interactuan un conjunto de objetos. Reduce dependencias caoticas muchos-a-muchos reemplazandolas con dependencias uno-a-muchos via el mediador. | `class ChatRoom { notify(sender, message) { this.users.filter(u => u !== sender).forEach(u => u.receive(message)); } }` — los usuarios no se conocen entre si, solo al chatroom. |
| **Memento** | Captura y externaliza el estado interno de un objeto sin violar su encapsulacion, permitiendo restaurarlo posteriormente. Implementa funcionalidad de undo/snapshot. | `class EditorHistory { save(editor) { this.snapshots.push(editor.createSnapshot()); } undo(editor) { editor.restore(this.snapshots.pop()); } }` |
| **Observer** | Define una relacion uno-a-muchos donde cuando un objeto cambia de estado, todos sus dependientes son notificados automaticamente. Desacopla emisor de receptores. Cumple DIP. | `eventEmitter.on('order:created', sendEmail); eventEmitter.on('order:created', updateInventory); eventEmitter.emit('order:created', order);` — agregar listeners sin modificar el emisor. |
| **State** | Permite a un objeto alterar su comportamiento cuando su estado interno cambia. Elimina cadenas de `if/else` o `switch` basadas en estado. Cumple OCP. | `class Order { state: OrderState; ship() { this.state.ship(this); } }` donde `PendingState.ship()` cambia a `ShippedState`, y `ShippedState.ship()` lanza error. |
| **Strategy** | Define una familia de algoritmos intercambiables encapsulados en clases separadas. El cliente elige el algoritmo en runtime. Cumple SRP y OCP. | `class Sorter { constructor(private strategy: SortStrategy) {} sort(data) { return this.strategy.sort(data); } }` — inyectar `QuickSort`, `MergeSort` o `BubbleSort` segun contexto. Analogia en el proyecto: `AIClientFactory` selecciona entre `GeminiAIClient` y `ClaudeAIClient`. |
| **Template Method** | Define el esqueleto de un algoritmo en una clase base, delegando algunos pasos a las subclases. Los pasos fijos no se redefinen; los pasos variables si. Cumple OCP. | `abstract class DataParser { parse(file) { this.open(file); this.extract(); this.close(file); } abstract extract(): void; }` — `CsvParser` y `JsonParser` implementan solo `extract()`. Analogia en el proyecto: `BaseScanner` define `scan()` y las subclases implementan la logica especifica. |
| **Visitor** | Permite agregar nuevas operaciones a una estructura de objetos sin modificar las clases de los elementos. Separa algoritmos de la estructura sobre la que operan. | `class ExportVisitor { visitCircle(c) { return `<circle r="${c.radius}"/>`; } visitRect(r) { return `<rect w="${r.w}"/>`; } }` — agregar XML export sin modificar `Circle` ni `Rect`. |

---

## 16. Compatibilidad de Navegador

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **DOCTYPE HTML5** | Declaracion `<!DOCTYPE html>` al inicio del documento que indica al navegador que use el modo de renderizado estandar (standards mode) en vez del modo quirks. | `<!DOCTYPE html><html lang="es">` — sin DOCTYPE, navegadores antiguos activan quirks mode con comportamiento impredecible en CSS y layout. |
| **Charset declaration** | Declaracion de codificacion de caracteres (`<meta charset="UTF-8">`) que debe ser el primer elemento dentro de `<head>`. Evita problemas de renderizado de caracteres especiales. | `<head><meta charset="UTF-8"><title>...</title></head>` — si charset se declara despues de `<title>`, el navegador puede interpretar el titulo con codificacion incorrecta. |
| **Viewport meta tag** | Etiqueta `<meta name="viewport">` que controla como se renderiza la pagina en dispositivos moviles. Sin ella, el navegador asume ancho de desktop y escala la pagina. | `<meta name="viewport" content="width=device-width, initial-scale=1">` — la pagina se adapta al ancho del dispositivo en vez de mostrarse miniaturizada. |
| **Feature detection** | Tecnica que verifica si el navegador soporta una API o funcionalidad antes de usarla, en vez de detectar el navegador por su `userAgent` (fragil y poco fiable). | `if ('IntersectionObserver' in window) { /* usar */ } else { /* fallback */ }` en vez de `if (navigator.userAgent.includes('Chrome'))`. |
| **Polyfill** | Codigo que implementa una funcionalidad moderna en navegadores que no la soportan nativamente. Se carga condicionalmente solo cuando es necesario. | `if (!('fetch' in window)) { /* cargar polyfill de fetch */ }` — solo descarga el polyfill en navegadores antiguos que no tienen `fetch` nativo. |

---

## 17. Anti Sobre-Ingenieria

| Concepto | Definicion | Ejemplo |
|----------|-----------|---------|
| **YAGNI (You Aren't Gonna Need It)** | Principio que establece que no se debe implementar funcionalidad hasta que sea realmente necesaria. Diseniar para requisitos hipoteticos futuros genera complejidad innecesaria y desperdicio. Marco normativo Sec. 5.2. | Crear un sistema de plugins configurable para un modulo que solo tendra una implementacion. Resultado: abstraccion vacia que nadie usa y que complica el codigo actual. |
| **Abstraccion prematura** | Crear abstracciones (interfaces, clases base, helpers) antes de tener suficiente evidencia de variabilidad real. Una abstraccion basada en un solo caso suele ser incorrecta. Marco normativo Sec. 5.3. | Crear `interface DataSource` con `AbstractDataSourceFactory` cuando el proyecto solo usa PostgreSQL y no hay planes de cambiar. La abstraccion no resuelve ningun problema real. |
| **Complejidad accidental** | Complejidad que no es inherente al problema sino que se introduce por decisiones de diseno innecesarias: capas extra, patrones injustificados, frameworks sobredimensionados. Marco normativo Sec. 5. | Usar un sistema de eventos, un bus de mensajes y 4 capas de abstraccion para un CRUD simple que podria resolverse con un controlador directo y una query SQL. |
| **Regla de tres** | Heuristica que sugiere que codigo duplicado se tolera hasta 2 ocurrencias. A la tercera repeticion, la evidencia justifica crear una abstraccion. Antes de eso, la duplicacion puede ser preferible. Marco normativo Sec. 5.3. | Logica de validacion similar en 2 formularios: tolerable. Al aparecer en un tercer formulario, extraer a `validateForm()` compartida. Dos copias son mas simples que una abstraccion prematura. |

---

## 18. Referencias Cruzadas

Mapeo entre secciones de este documento, documentos fuente y reglas del marco normativo.

| Seccion | Documento fuente | Reglas asociadas |
|---------|-----------------|------------------|
| 1. Niveles de Severidad | MARCO_NORMATIVO Sec. 2 | — |
| 2. Credenciales y Secretos | MARCO_NORMATIVO Sec. 3.1 | SEC-01, SEC-02 |
| 3. Autenticacion y Control de Acceso | MARCO_NORMATIVO Sec. 3.1 | SEC-03, SEC-04, SEC-05, SEC-06 |
| 4. Cabeceras y Proteccion Web | best-practices (Security) | — |
| 5. Vulnerabilidades y Dependencias | MARCO_NORMATIVO Sec. 3.1, best-practices | SEC-07, SEC-08 |
| 6. Antipatrones Estructurales | MARCO_NORMATIVO Sec. 3.2 | ARQ-01, ARQ-02, ARQ-03, ARQ-04, ARQ-06 |
| 7. Metricas y Olores de Codigo | MARCO_NORMATIVO Sec. 3.3 | COD-01 a COD-08 |
| 8. Rendimiento | MARCO_NORMATIVO Sec. 3.4, best-practices | REN-01 a REN-06 |
| 9. Testing | MARCO_NORMATIVO Sec. 3.5 | TST-01 a TST-06 |
| 10. Mantenibilidad | MARCO_NORMATIVO Sec. 3.6 | MAN-01 a MAN-06 |
| 11. Principios Fundamentales | design-patterns-guide (Principios) | — |
| 12. Principios SOLID | design-patterns-guide (SOLID), MARCO_NORMATIVO Sec. 3.2/4 | ARQ-02 a ARQ-06, COD-01, COD-06, SEC-03, SEC-04 |
| 13. Patrones Creacionales | design-patterns-guide (Creational) | ARQ-05, matriz Sec. 4 |
| 14. Patrones Estructurales | design-patterns-guide (Structural) | ARQ-05, REN-05, matriz Sec. 4 |
| 15. Patrones de Comportamiento | design-patterns-guide (Behavioral) | ARQ-05, ARQ-06, matriz Sec. 4 |
| 16. Compatibilidad de Navegador | best-practices (Compatibility) | — |
| 17. Anti Sobre-Ingenieria | MARCO_NORMATIVO Sec. 5, design-patterns-guide (Anti Sobre-Ingenieria) | — |

### Cobertura del glosario existente (MARCO_NORMATIVO Sec. 11)

| Termino del glosario | Seccion en este documento |
|----------------------|--------------------------|
| GoF | 13, 14, 15 |
| SOLID | 12 |
| God Object | 6 |
| N+1 | 8 |
| CVE | 5 |
| Supresion | No incluido (concepto operativo, ver MARCO_NORMATIVO Sec. 8) |
| Scanner | No incluido (concepto del CGE-Verificator, ver CLAUDE.md) |
| Severidad | 1 |
| Guidelines | 10 |

---

*Documento complementario al [Marco Normativo de Calidad y Seguridad](./MARCO_NORMATIVO.md).*
*Generado para el CGE-Verificator v1.0.*
