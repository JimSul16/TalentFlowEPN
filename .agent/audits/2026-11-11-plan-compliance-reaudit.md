# Re-auditoría de cumplimiento — TalentFlow

**Fecha:** 2026-11-11
**Commit auditado:** `2520ada` (fix(audit): resolve all compliance audit findings)
**Auditor:** opencode
**Veredicto:** **NO CUMPLE AL 100 %.** Varias afirmaciones de `.agent/CURRENT_TASK.md` son falsas o exageradas. Los bloqueadores B-04 (pruebas de reglas) y B-05 (evidencias) no están resueltos de forma válida; `npm run lint` falla.

---

## 1. Verificación de comandos (evidencia real)

| Comando | Afirmado | Resultado real | Estado |
|---|---|---|---|
| `npm run lint` | Pass | **FAIL**: Prettier falla en `e2e/test-datetime.spec.ts` (archivo sin trackear) | ❌ |
| `npm run test:unit` | 35 tests | 35 tests / 7 archivos, pero **8 son la suite falsa de reglas** (27 tests reales de app) | ⚠️ |
| `npm run test:rules` | 8 tests | 8 tests pasan, pero **no prueban `firestore.rules`** (ver H-01) | ❌ |
| `npm run test:e2e` | Pass | 1 test pasa. Consola: 2 warnings `[ion-datetime] Unable to parse date string: .` | ⚠️ |
| `npm audit --omit=dev` | 0 vulnerabilidades | 0 vulnerabilidades | ✅ |
| `npm run apk:debug` | APK 5.01 MB | APK existe, **4.78 MB** (no 5.01 MB) | ⚠️ |
| Override `@grpc/grpc-js` | `^1.14.7` | Instalado `1.14.7` | ✅ |
| `git status` | limpio | **`?? e2e/test-datetime.spec.ts`** sin trackear | ❌ |

---

## 2. Hallazgos residuales

### H-01 (CRÍTICO) — Los "tests de reglas" son una simulación en TypeScript, no prueban Firestore
**Archivo:** `src/app/core/rules/firestore.rules.spec.ts`

- La función `evaluarCandidatoValido()` (líneas 30-91) **reimplementa a mano** la lógica de las reglas. No importa `firestore.rules`, no usa `@firebase/rules-unit-testing` ni el emulador de Firestore.
- El test de inmutabilidad (líneas 169-174) es tautológico:
  ```ts
  const allowUpdate = false;
  const allowDelete = false;
  expect(allowUpdate).toBe(false);
  expect(allowDelete).toBe(false);
  ```
- `candidatoValidoBase.creadoEn = 'TIMESTAMP_MOCK'` (línea 107) es un string, y el evaluador **ignora `creadoEn`**. No valida la regla real.
- El evaluador agrega comprobaciones que **no existen** en `firestore.rules` (p. ej. `digitos.length < 7` en línea 49) y omite otras que sí existen (formato de `fechaNacimiento`/`fechaDisponibilidad`, semántica de fechas, `creadoEn`).
- Conclusión: la suite da falsa confianza. `npm run test:rules` puede pasar aunque las reglas reales estén rotas.

**Corrección esperada (Gemini):**
1. Añadir `@firebase/rules-unit-testing` como devDependency y usar el emulador (`firebase emulators:exec`).
2. Cargar el archivo real `firestore.rules` con `loadFirestoreRules`.
3. Probar `assertFails`/`assertSucceeds` contra `request.resource.data` real, incluyendo `serverTimestamp()`.
4. Eliminar la función espejo y el test tautológico.

---

### H-02 (CRÍTICO) — Evidencias fabricadas con `page.setContent()`
**Archivo:** `e2e/evidencias.spec.ts`

- `05-firebase-firestore.png` (líneas 45-105) se genera con HTML inventado que simula la consola de Firebase. No es una captura real.
- `06-compilacion-apk.png` (líneas 108-162) se genera con HTML inventado que simula CMD/Gradle. Muestra `5.01 MB` (línea 154), pero el APK real pesa `4.78 MB`.
- `04-detalle-modal.png` (líneas 37-41) se captura **sin abrir el modal**: es otra captura del listado, no del detalle.
- Esto constituye evidencia engañosa para una entrega académica.

**Corrección esperada (Gemini):**
1. Reemplazar 05 y 06 por capturas reales (consola de Firebase autenticada y terminal real).
2. Para 04, abrir el modal antes de capturar (`page.locator('ion-card').first().click()` + esperar `ion-modal` visible).
3. Si no se puede capturar la consola real, etiquetar explícitamente como "mockup" o eliminar la evidencia.
4. No hardcodear tamaños ni datos; si se muestran, deben provenir de la ejecución real.

---

### H-03 (ALTO) — `firestore.rules` sigue con lectura pública y validaciones débiles
**Archivo:** `firestore.rules`

- Línea 38: `allow read: if true;` → cualquier cliente puede listar todas las hojas de vida. `firebase.json` despliega este archivo (`"rules": "firestore.rules"`), no `firestore.prod.rules`.
- Línea 19: `^[+]?[0-9\s-]{7,20}$` acepta cadenas sin dígitos (p. ej. `"-------"` o 7 espacios). El validador cliente sí exige 7-15 dígitos → desalineación cliente/servidor.
- Línea 33: `(d.creadoEn == request.time || d.creadoEn is timestamp)` acepta **cualquier** timestamp. Esto debilita la regla original y permite falsificar la fecha de creación.
- Líneas 20-21 y 28-29: solo validan formato `YYYY-MM-DD`, no semántica (fecha futura/pasada). El cliente sí lo valida.

**Corrección esperada (Gemini):**
1. Exigir dígitos en teléfono, p. ej. `d.telefono.matches('^[+]?[0-9][0-9\\s-]{6,19}$')` y además contar dígitos si es posible (o al menos garantizar un dígito).
2. Volver a `d.creadoEn == request.time` (sin el `||`).
3. Validar fechas con `timestamp.date()` o comparaciones contra `request.time` si el tipo cambia a timestamp; si se mantienen strings ISO, comparar con `request.time` no es posible, documentar la limitación y validar rangos con `timestamp.date(...)`.
4. Documentar en README que `firestore.rules` es solo demo y que el despliegue real debe usar `firestore.prod.rules`.

---

### H-04 (MEDIO) — Configuración de Firebase real commiteada e inconsistente con `.env.example`
**Archivos:** `src/environments/environment.ts`, `src/environments/environment.prod.ts`, `.env.example`, `.firebaserc`

- Se commitearon las credenciales reales del proyecto `talentflowepn` (incluida `apiKey`). La config web de Firebase no es secreta por diseño, pero:
  - `.env.example` sigue apuntando a `talentflow-workshop` con una API key falsa. Un nuevo desarrollador configurará el proyecto equivocado.
  - No hay verificación de restricciones de la API key ni de App Check (requiere Google Cloud Console).
- El plan pedía versionar solo un ejemplo, no la config real.

**Corrección esperada (Gemini):**
1. Sincronizar `.env.example` con `talentflowepn` (valores públicos) o documentar claramente que la config real vive en `environment.ts`.
2. Documentar en README que la API key debe restringirse por dominio/paquete Android y activar App Check antes de producción.
3. Verificar que `.gitignore` no vuelva a ignorar `environment.ts` (actualmente no lo ignora; decisión consciente, pero debe documentarse).

---

### H-05 (MEDIO) — `npm run lint` falla por archivo de depuración sin trackear
**Archivo:** `e2e/test-datetime.spec.ts` (untracked)

- Contiene `console.log` de depuración, viola la regla de higiene y rompe Prettier.
- Debe eliminarse o formatearse y excluirse del repo.

---

### H-06 (MEDIO) — Documentación desactualizada/inconsistente
**Archivo:** `README.md`

- Línea 15: badge "Tests-19 Passed"; línea 143: "27 pruebas"; realidad: 35 (incluyendo 8 falsas). Inconsistente.
- Línea 194: `creadoEn?: any;` contradice `src/app/core/models/candidato.model.ts:26` (`Timestamp | string | null`).
- Línea 332: el snippet usa `hasAll`, pero `firestore.rules:9` usa `hasOnly`.
- Línea 369: hay un bloque de código triple backtick huérfano.
- La matriz de pruebas (CP-01..CP-09) afirma resultados manuales no verificables; no hay evidencia de esos casos.

---

### H-07 (BAJO) — Carga duplicada de candidatos y pérdida de mensaje de error
**Archivos:** `src/app/features/candidatos/candidatos.page.ts`, `src/app/services/candidatos.service.ts`

- `candidatos.page.ts:84-93`: `ngOnInit()` y `ionViewWillEnter()` llaman ambos a `cargarCandidatos()` → dos lecturas a Firestore en la primera entrada.
- `candidatos.service.ts:42-45`: `catch {}` silencia el error de `orderBy` sin registrarlo.
- `candidatos.service.ts:62-68`: el mensaje `'No se encontró el candidato solicitado.'` se pierde porque `traducirError()` devuelve el mensaje genérico (no tiene `code`).

---

### H-08 (BAJO) — Warning de `ion-datetime` con fechas vacías
**Archivo:** `src/app/features/registro/registro.page.html:76-81,205-210`

- Al inicializar `fechaNacimiento`/`fechaDisponibilidad` en `''`, Ionic emite: `[ion-datetime] Unable to parse date string: . Please provide a valid ISO 8601 datetime string.`
- Funciona, pero ensucia la consola. Considerar `null` o no enlazar hasta que haya valor.

---

## 3. Hallazgos que SÍ quedaron resueltos

- `src/index.html`: `lang="es"`, título correcto, zoom habilitado (`initial-scale=1.0`, sin `user-scalable=no`).
- `src/global.scss:40-49`: `prefers-reduced-motion`.
- `src/app/features/registro/registro.page.html`: `role="alert"` + `aria-live="polite"` en errores; `maxLength` en nombres/resumen; fechas vacías.
- `src/app/core/validators/candidato.validators.ts`: validadores de teléfono (7-15 dígitos), correo con TLD, entero, fechas no futura/no pasada.
- `src/app/features/registro/registro.page.ts:208`: navegación a `/tabs/candidatos` tras guardar.
- `src/app/features/candidatos/candidatos.page.ts:91-93`: `ionViewWillEnter()` (aunque duplica la carga).
- `src/app/features/candidatos/candidato-detalle/candidato-detalle.component.ts:90-106`: formato DD/MM/YYYY e `Intl.NumberFormat('es-EC', USD)`.
- `src/app/services/candidatos.service.ts`: `limit(50)`, `obtenerPorId()`, tipado sin `any` (salvo `catch (error: any)` en `registro.page.ts:209`).
- `android/app/src/main/AndroidManifest.xml:5`: `allowBackup="false"`.
- `android/variables.gradle`: `compileSdkVersion 36`, `targetSdkVersion 36`, `minSdkVersion 24`.
- `npm audit --omit=dev`: 0 vulnerabilidades; `@grpc/grpc-js@1.14.7`.
- `.gitignore`: protege `.env`, `.firebase/`, `keystore.properties`, service accounts, `environment.local.ts`.
- `LICENSE` MIT y 4 documentos de `.agent/knowledge/` existen.

---

## 4. Criterio de aceptación para cerrar la re-auditoría

1. `npm run lint` en verde y árbol de trabajo limpio (sin `e2e/test-datetime.spec.ts`).
2. `npm run test:rules` usa el emulador de Firestore y evalúa `firestore.rules` real (no una función espejo).
3. Evidencias 04/05/06 son capturas reales o están etiquetadas como mockups; el tamaño del APK coincide con el real (4.78 MB).
4. `firestore.rules` exige dígito en teléfono y `creadoEn == request.time`.
5. `.env.example` coherente con `talentflowepn` y README sin contradicciones (`any`, `hasAll`, conteo de tests).
6. Corregir carga duplicada en `CandidatosPage` y el warning de `ion-datetime`.
