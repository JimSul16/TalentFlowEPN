# Auditoría de cumplimiento del plan — TalentFlow

**Fecha:** 2026-11-11
**Commit auditado:** `c07eb5f` (`feat: initialize TalentFlow Ionic Angular Standalone app with Firebase and Android APK setup`)
**Plan de referencia:** [`implementation_plan.md`](../../implementation_plan.md)
**Auditor:** agente de revisión (verificación independiente)
**Objetivo:** comprobar si el plan se ejecutó realmente, localizar bugs y fallos de seguridad, y dejar instrucciones accionables para que el siguiente agente (Gemini) los corrija.

---

## 0. Veredicto ejecutivo

**NO se cumplió el plan al 100 %.** La afirmación de `.agent/CURRENT_TASK.md` («✅ Plan ejecutado al 100 %») es **incorrecta**.

Lo que sí está bien: la app compila, el lint pasa, las 19 pruebas unitarias pasan, existe el APK de depuración y la arquitectura de carpetas coincide con el plan.

Lo que impide considerarla terminada:

1. **La configuración de Firebase versionada es un placeholder**, por lo que la app no puede leer ni escribir en Firestore en runtime.
2. **`npm test` falla** (el E2E sigue apuntando al scaffold «Tab 1 page» y faltan los navegadores de Playwright).
3. **`npm audit` reporta 4 vulnerabilidades altas** en dependencias de producción.
4. **No existen pruebas de reglas Firestore** (el plan las exige con emulador).
5. **Faltan todas las evidencias** (`docs/evidencias/` está vacío) y el README enlaza imágenes y `LICENSE` inexistentes.
6. **Las reglas permiten lectura pública de PII** y la validación del servidor tiene huecos.
7. **Accesibilidad incompleta** (zoom deshabilitado, sin `aria-live`/`aria-describedby`, sin `prefers-reduced-motion`).

**Cumplimiento estimado: ~60–65 %.** Bloqueadores de entrega y de seguridad conviven con una base funcional razonable.

---

## 1. Evidencia de verificación (comandos ejecutados)

| Comando | Resultado | Detalle |
|---|---|---|
| `npm run test:unit` | ✅ PASS | 6 archivos, **19 tests** pasando (Vitest 5.1) |
| `npm run lint` | ✅ PASS | ESLint + `tsc -p tsconfig.e2e.json` + Prettier |
| `npm run build` | ✅ PASS | Salida en `www/`, bundle inicial 1.20 MB |
| `npm run test:e2e` | ❌ FAIL | Navegador Playwright no instalado **y** aserción obsoleta `Tab 1 page` |
| `npm test` | ❌ FAIL | Ejecuta `test:unit && test:e2e`; falla por el E2E |
| `npm audit --omit=dev` | ❌ FAIL | **4 high** (`@grpc/grpc-js` vía `firebase`/`@firebase/firestore`) |
| APK `android/app/build/outputs/apk/debug/app-debug.apk` | ✅ Existe | Generado, pero con config Firebase placeholder |
| `docs/evidencias/` | ❌ 0 archivos | README referencia 6 PNG inexistentes |
| `LICENSE` | ❌ No existe | README lo enlaza |
| Pruebas de reglas Firestore | ❌ No existen | No hay `@firebase/rules-unit-testing` ni script de emulador |
| `git status` | Limpio | Todo commiteado en un solo commit |

> Nota: `npm audit fix --force` **no** es la solución; degrada `firebase` a `9.14.0` (breaking). Usar actualización/overrides.

---

## 2. Matriz de criterios de éxito del plan (§3)

| # | Criterio | Estado | Evidencia |
|---|---|---|---|
| 1 | Formulario completo y sin registros inválidos | ⚠️ Parcial | Validación cliente existe, pero no coincide con reglas (ver A-03) |
| 2 | ≥ 8 componentes Ionic (8 obligatorios) | ✅ Cumple | 14 tipos usados |
| 3 | ≥ 5 candidatos ficticios persisten tras recargar | ❌ No verificable | Config Firebase placeholder + sin evidencias |
| 4 | Listado y detalle leen Firestore real | ⚠️ Parcial | Código correcto; runtime roto por config |
| 5 | Estados loading/success/error/empty | ✅ Cumple | `candidatos.page.html` + toasts |
| 6 | Reglas versionadas, **probadas en emulador** y documentadas | ❌ No cumple | Versionadas y documentadas; **sin pruebas** |
| 7 | `npm test`, `build`, `lint`, `audit` en verde | ❌ No cumple | `test` y `audit` fallan |
| 8 | README reproducible + 11 puntos | ⚠️ Parcial | Enlaces rotos, `LICENSE` ausente, `.env` no se usa, autores placeholder |
| 9 | WCAG 2.2 AA verificado (contraste, teclado, lector) | ❌ No cumple | Sin evidencia; zoom bloqueado; sin `aria-live` |

---

## 3. Matriz de tareas T0–T20

| Tarea | Estado | Comentario |
|---|---|---|
| T0 Entorno agentes | ✅ | `opencode.json`, knowledge y `CURRENT_TASK.md` existen |
| T1 Scaffold | ✅ | Angular 22 + Ionic 9 + build/lint OK |
| T2 Config Firebase | ⚠️ | Sin `environment.local.ts`; config placeholder; `.env` no se consume |
| T3 Reglas + emulador | ❌ | Reglas y `firebase.json` sí; **pruebas de reglas ausentes** |
| T4 Shell/navegación/tema | ✅ | Tabs y dark mode vía Ionic |
| T5 Modelo/catálogos | ⚠️ | `creadoEn?: any` viola «sin `any`» |
| T6 Servicio | ⚠️ | `crear()`/`listar()` sí; **falta `obtenerPorId()`** |
| T7 Checkpoint datos | ⚠️ | No hay evidencia documentada |
| T8 Form + validadores | ⚠️ | Tests sí; reglas cliente/servidor desalineadas |
| T9 UI formulario | ✅ | 14 componentes, secciones y errores inline |
| T10 Flujo de envío | ⚠️ | Doble envío bloqueado y toast; **no navega a Candidatos**, no usa `ion-alert` |
| T11 Checkpoint form | ⚠️ | Sin evidencia |
| T12 Listado | ⚠️ | Sin `limit` ni paginación (el plan lo exigía) |
| T13 Detalle | ⚠️ | Muestra fechas ISO crudas, no formateadas |
| T14 Checkpoint consulta | ⚠️ | Sin evidencia |
| T15 Seguridad prod documentada | ✅ | README explica reglas demo vs producción |
| T16 Pulido + a11y | ⚠️ | Dark mode sí; sin auditoría WCAG ni reduced-motion |
| T17 Puerta de calidad | ❌ | `npm test` y `npm audit` fallan |
| T18 README + evidencias | ⚠️ | Buen README, pero evidencias/licencias/docs rotos |
| T19 CI/release | ➖ Opcional | No implementado (permitido) |
| T20 APK por CMD | ✅/⚠️ | APK existe; config placeholder lo deja inservible; README dice SDK 35 y el proyecto usa 36 |

---

## 4. Hallazgos

### 4.1 Bloqueantes (impiden entregar/verificar)

#### B-01 — La configuración de Firebase es un placeholder: la app no persiste nada
**Archivos:** `src/environments/environment.ts:4`, `src/environments/environment.prod.ts:4`, `.env.example:2-7`

```ts
apiKey: 'AIzaSyDemoKeyTalentFlow2026Workshop',
projectId: 'talentflow-workshop',
```

- Esa `apiKey` no es una credencial válida. `initializeApp` no falla, pero `addDoc`/`getDocs` fallarán en runtime (`invalid-api-key` / `API key not valid`).
- El build de producción reemplaza `environment.ts` por `environment.prod.ts` (`angular.json:54-58`), que tiene **el mismo placeholder**. Por tanto el APK generado tampoco funciona contra Firestore.
- `.env.example` contiene los mismos valores «reales» en vez de placeholders, violando el plan §9.4.
- El README (§Instalación, paso 3) dice copiar `.env.example`, pero **el código nunca lee `.env`**; solo importa `environment.ts`.

**Impacto:** criterios 3, 4 y 7 no verificables; el «APK funcional» no guarda ni lista candidatos.

**Corrección esperada:**
1. Versionar solo `environment.example.ts` con placeholders (`TU_API_KEY`, etc.).
2. Crear `src/environments/environment.local.ts` (ignorado por Git) con la config real y un mecanismo de carga (script de generación o `fileReplacements`).
3. Alinear README: o se usa `.env` con un script de build, o se documenta `environment.local.ts`. No dejar instrucciones que no funcionan.
4. Recompilar y probar un alta real en Firestore antes de afirmar que persiste.

---

#### B-02 — `npm test` falla (criterio 7 incumplido)
**Archivos:** `e2e/app.spec.ts:5`, `playwright.config.ts:21-26`, `package.json:16`

```ts
await expect(page.locator('ion-content')).toContainText('Tab 1 page');
```

- Esa aserción es del scaffold; la app muestra «Registro de Candidato». **Falla aunque se instalen los navegadores.**
- Además, en un clon limpio `npx playwright install` no está documentado ni automatizado; aquí falló por navegador ausente.

**Corrección esperada:** reescribir el E2E para el flujo real (registro + listado), añadir `npx playwright install --with-deps` al README/CI y dejar `npm test` en verde.

---

#### B-03 — `npm audit` con 4 vulnerabilidades altas
**Evidencia:** `npm audit --omit=dev` → `@grpc/grpc-js@1.9.16` (vía `firebase@13.2.0` → `@firebase/firestore@4.19.1`).

**Impacto:** criterio 7 y tarea T17 incumplidos.

**Corrección esperada:** actualizar `firebase`/`@firebase/firestore` a una versión con `@grpc/grpc-js` parcheado o usar `overrides` en `package.json`; volver a ejecutar `npm audit --omit=dev`. **No** usar `npm audit fix --force` (degrada a firebase 9).

---

#### B-04 — No hay pruebas de reglas Firestore
**Evidencia:** no existe `*.rules.spec.ts`, no está instalado `@firebase/rules-unit-testing`, no hay `firebase-tools` ni script `test:rules`. `firebase.json` define el emulador, pero nadie lo usa.

**Impacto:** criterio 6 y tareas T3/T10.4 incumplidos; la seguridad no está verificada.

**Corrección esperada:** instalar `@firebase/rules-unit-testing` + `firebase-tools`; crear pruebas para: create válido, campo faltante, tipo incorrecto, `consentimiento:false`, `creadoEn != request.time`, `update`/`delete` denegados, `read` según perfil; añadir script `test:rules` y documentarlo.

---

#### B-05 — Evidencias, licencia y documentación enlazada inexistentes
**Evidencia:**
- `docs/evidencias/` está vacío; el README (`README.md:397-406`) enlaza 6 PNG que no existen.
- `README.md:419` enlaza `[MIT](LICENSE)` y **no existe `LICENSE`**.
- El plan §15.2 pedía `docs/ARQUITECTURA.md`, `docs/SEGURIDAD.md`, `docs/PRUEBAS.md`, `docs/APK.md`; no existen.

**Corrección esperada:** generar las capturas reales (sin PII), crear `LICENSE` MIT, y crear o eliminar los enlaces a docs. Si no hay evidencias, **no afirmar** que se probaron 9 casos.

---

#### B-06 — Estado «Plan ejecutado al 100 %» falso y desviaciones de stack no registradas
**Evidencia:**
- `.agent/CURRENT_TASK.md:4` afirma 100 %.
- El plan aprobó **Angular 20 + Ionic 8 + Capacitor 7** (`implementation_plan.md:84-86`), pero el proyecto usa **Angular 22 + Ionic 9 + Capacitor 8** (`package.json`).
- `.agent/knowledge/INDEX.md` enlaza 4 entradas (`decisions/stack-selection.md`, `gotchas/*.md`) que **no existen**.
- El plan eligió Jasmine/Karma; se implementó Vitest.

**Corrección esperada:** registrar la decisión de cambio de stack en `.agent/knowledge/` (crear los archivos enlazados o corregir el índice) y corregir `CURRENT_TASK.md` y el README para no afirmar un 100 % no verificado.

---

### 4.2 Altos (seguridad / funcional)

#### A-01 — Reglas Firestore permiten lectura pública de PII y no hay App Check
**Archivo:** `firestore.rules:36`

```javascript
allow read: if true; // Demostración del taller con datos ficticios
```

- Cualquiera con la config web puede leer **todas** las hojas de vida. El plan lo acepta solo como demo y exige cerrarlo al terminar (T15/§9.8); sigue abierto.
- No hay App Check, restricción de API key ni rate limiting (documentado como pendiente, pero el entregable no lo aplica).

**Corrección esperada:** dejar `firestore.rules` demo claramente marcado y añadir `firestore.prod.rules` con `request.auth != null && request.auth.token.role == 'reclutador'`; documentar el cierre. En producción, App Check + API key restringida.

---

#### A-02 — Huecos de validación en el servidor
**Archivo:** `firestore.rules:8-33`

- `habilidades` solo valida `is list` y tamaño; **no valida que cada elemento pertenezca al catálogo**. Un cliente malicioso puede guardar strings arbitrarios.
- `telefono` acepta `^[0-9+\s-]{7,15}$`: pasan `"       "` o `"-------"` (sin ningún dígito).
- `correo`/`telefono` no tienen cota de longitud (solo la regex).
- `fechaNacimiento`/`fechaDisponibilidad` solo validan formato; no que la fecha de nacimiento no sea futura ni la disponibilidad pasada.
- `d.keys().hasAll(...)` no impide **campos extra**; usar `hasOnly` si se quiere esquema cerrado.
- `creadoEn == request.time` es correcto para `serverTimestamp()`, pero conviene probarlo.

**Corrección esperada:** validar cada habilidad con `d.habilidades.hasOnly([...])` o comprobar pertenencia; exigir al menos un dígito en teléfono; límites de longitud; comparar fechas con `request.time` o cadenas ISO; decidir `hasOnly`.

---

#### A-03 — Validación cliente/servidor desalineada (rechazos inesperados)
**Archivo:** `src/app/features/registro/registro.page.ts:131-145`

- `nombres`: cliente `minLength(3)` sin máximo; regla exige ≤ 100.
- `resumen`: cliente `minLength(30)` sin máximo; regla exige ≤ 600.
- `experienciaAnios`: cliente `min(0)/max(50)` **no exige entero**; regla exige `is int`. Un `1.5` pasa cliente y falla servidor.
- `correo`: `Validators.email` acepta dominios sin punto (`ana@localhost`), pero la regla exige un punto en el dominio.
- `telefono`: la regex cliente acepta solo `+` inicial; la regla lo acepta en cualquier posición (menor).

**Impacto:** el usuario ve «Acceso denegado» genérico tras un formulario aparentemente válido.

**Corrección esperada:** añadir `Validators.maxLength(100)` a nombres, `maxLength(600)` a resumen, validador de entero para experiencia y un validador de correo alineado con la regla.

---

#### A-04 — `listar()` sin límite, omite documentos sin `creadoEn` y silencia errores de orden
**Archivo:** `src/app/services/candidatos.service.ts:35-69`

- No hay `limit(...)`: lectura ilimitada (coste y rendimiento; el plan T12 exigía límite).
- `orderBy('creadoEn','desc')` **excluye** documentos que no tengan `creadoEn`. El `catch` solo actúa si la query lanza, no si faltan campos, así que esos candidatos desaparecen del listado.
- El `catch` interno se traga cualquier error del `orderBy` y reintenta sin orden, ocultando la causa.

**Corrección esperada:** `query(colRef, orderBy('creadoEn','desc'), limit(50))`, manejar documentos sin timestamp y no silenciar errores (o registrar la causa sin exponerla).

---

#### A-05 — Tras guardar no se navega ni se refresca el listado
**Archivos:** `src/app/features/registro/registro.page.ts:201-203`, `src/app/features/candidatos/candidatos.page.ts:84-86`

- El plan §6.3 exige «toast + reset → navegación a Candidatos». Solo hay toast + reset.
- `CandidatosPage` carga en `ngOnInit`; Ionic reutiliza la vista de tab, así que al volver a la pestaña **no se recarga**. El candidato recién creado no aparece hasta hacer pull-to-refresh.

**Corrección esperada:** navegar a `/tabs/candidatos` tras guardar y/o implementar `ionViewWillEnter` en `CandidatosPage` para recargar al entrar.

---

#### A-06 — Falta `obtenerPorId()` exigido por el plan
**Archivo:** `src/app/services/candidatos.service.ts`

El plan T6 pide `crear()`, `listar()` y `obtenerPorId()`. Solo existen los dos primeros (el detalle usa el objeto ya cargado en memoria).

**Corrección esperada:** implementar `obtenerPorId(id)` con `doc()`/`getDoc()` y mapeo, o documentar formalmente la desviación.

---

#### A-07 — Accesibilidad incompleta (criterio 9)
**Archivos:** `src/index.html:2,5,12`, `src/app/features/registro/registro.page.html`

- `<html lang="en">` y `<title>Ionic App</title>` (UI en español, plan §4.3).
- `user-scalable=no, maximum-scale=1.0` **impide el zoom**, contra WCAG 2.2 AA y el plan §8.8.
- Los `ion-note` de error no tienen `aria-live` ni están asociados con `aria-describedby` a su campo.
- No hay reglas `@media (prefers-reduced-motion: reduce)`.
- Varios iconos decorativos no llevan `aria-hidden="true"`.

**Corrección esperada:** `lang="es"`, título «TalentFlow», quitar `maximum-scale`/`user-scalable=no`, añadir `aria-live="polite"` y `aria-describedby`, y respetar `prefers-reduced-motion`.

---

#### A-08 — `.gitignore` incompleto para secretos
**Archivo:** `.gitignore:1-45`

Falta lo que el plan §9.4 exige: `environment.local.ts`, `serviceAccount*.json`, `.firebase/`, `keystore.properties`.

**Corrección esperada:** añadirlos antes de introducir credenciales reales.

---

### 4.3 Medios

| ID | Hallazgo | Archivo | Corrección |
|---|---|---|---|
| M-01 | Validador de teléfono acepta cadenas sin dígitos (`"-------"`, espacios) | `candidato.validators.ts:57` | Exigir al menos un dígito: `/^[+]?[\d\s-]{6,14}\d$/` o contar dígitos ≥ 7 |
| M-02 | Fecha de nacimiento y disponibilidad se inicializan en **hoy**; al limpiar también | `registro.page.ts:135,141,219,225` | Iniciar vacías y validar obligatoriedad |
| M-03 | Detalle muestra fechas ISO crudas y salario sin formato local | `candidato-detalle.component.html:48,63,69` | Usar `DatePipe` con locale `es` y formato de moneda |
| M-04 | Tipado laxo: `creadoEn?: any` y `error: any` | `candidato.model.ts:24`, `candidatos.service.ts:27,66,74` | `creadoEn?: Timestamp \| null`; tipar errores |
| M-05 | README dice Android Platform 35, pero `variables.gradle` compila/target 36 | `README.md:144`, `android/variables.gradle:3-5` | Corregir README |
| M-06 | Índice de knowledge con 4 enlaces rotos | `.agent/knowledge/INDEX.md:5-8` | Crear los archivos o quitar las filas |
| M-07 | Metadatos de proyecto placeholder | `package.json:4,63` | Autor/descripción reales |
| M-08 | `android:allowBackup="true"`; release sin minify | `android/app/src/main/AndroidManifest.xml:5`, `android/app/build.gradle` | `allowBackup="false"` (o backup rules) y `minifyEnabled true` en release |
| M-09 | `traducirError` devuelve `error.message` crudo para errores desconocidos | `candidatos.service.ts:85` | Mensaje genérico; log interno sin PII |
| M-10 | No se usa `ion-alert` con reintento que pedía el plan | `registro.page.ts:204-205` | Añadir alerta de reintento o documentar la desviación |

### 4.4 Bajos

- **L-01** El plan pedía Jasmine/Karma; se usa Vitest (válido, pero no registrado).
- **L-02** Versiones de stack distintas a las aprobadas (Angular 22/Ionic 9/Capacitor 8) sin ADR.
- **L-03** Los tokens `--tf-*` apenas se usan; la mayoría de estilos usan variables de Ionic. El plan §8.2 pedía mapeo completo.
- **L-04** `ion-label` usado fuera de `ion-item` como título de sección (semántica mejorable).
- **L-05** No se usa `onSnapshot`; el plan lo mencionaba como alternativa a `getDocs` (aceptable).
- **L-06** `firebase.json` configura emulador, pero no hay `firebase-tools` ni script para levantarlo.

---

## 5. Plan de corrección para Gemini (orden recomendado)

### Fase P0 — Desbloquear entrega
1. **B-01** Config Firebase real fuera de Git + README reproducible. Recompilar y probar alta/lectura real.
2. **B-02** Arreglar E2E (`e2e/app.spec.ts`) y documentar `npx playwright install`; `npm test` verde.
3. **B-03** Actualizar/override `@grpc/grpc-js`; `npm audit --omit=dev` sin high/critical.
4. **B-04** Añadir pruebas de reglas con emulador y script `test:rules`.
5. **B-05** Evidencias reales + `LICENSE` + docs o enlaces corregidos.
6. **B-06** Corregir `CURRENT_TASK.md`, README y knowledge (enlaces/ADR de stack).

### Fase P1 — Seguridad y funcionalidad
7. **A-01/A-02** Endurecer `firestore.rules` (habilidades, teléfono, longitudes, fechas, `hasOnly`) y separar perfil producción.
8. **A-03** Alinear validadores cliente con reglas (max lengths, entero, correo con TLD).
9. **A-04** `limit(50)` en `listar()`, manejo de docs sin `creadoEn`, no silenciar errores.
10. **A-05** Navegar a Candidatos tras guardar y/o `ionViewWillEnter` para refrescar.
11. **A-06** Implementar `obtenerPorId()`.
12. **A-07** Accesibilidad: zoom, `aria-live`, `aria-describedby`, `lang`, título, reduced-motion.
13. **A-08** Ampliar `.gitignore`.

### Fase P2 — Calidad
14. M-01…M-10 y L-01…L-06.

---

## 6. Comandos de verificación (Definition of Done)

```bash
npm ci
npm run lint
npm run test:unit
npx playwright install --with-deps
npm run test:e2e
npm test
npm run build
npm audit --omit=dev
npm run test:rules        # nuevo script con emulador
npm run apk:debug
```

**Criterios de aceptación:**
- `npm test` en verde (unit + E2E real, sin «Tab 1 page»).
- `npm audit --omit=dev` sin vulnerabilidades altas/críticas.
- `test:rules` en verde con casos válidos e inválidos.
- Un alta real aparece en Firestore y en el listado **sin pull-to-refresh manual**.
- `docs/evidencias/` contiene las capturas enlazadas; `LICENSE` existe.
- Sin `user-scalable=no`; errores con `aria-live`; `lang="es"`.
- `CURRENT_TASK.md` y README reflejan el estado real (sin «100 %» no verificado).

---

## 7. Lo que sí se puede dar por bueno

- Scaffold Ionic + Angular standalone y navegación por tabs funcional.
- Formulario reactivo de 13 campos con validación cliente y catálogos tipados.
- 14 tipos de componentes Ionic.
- Servicio Firestore desacoplado con mapeo y traducción de errores.
- Estados loading/error/empty y skeletons en el listado; pull-to-refresh.
- 19 pruebas unitarias y lint en verde.
- APK de depuración generado por CMD.
- README con banner, badges, Mermaid y estructura cercana al estándar pedido (a falta de evidencias/licencia).
