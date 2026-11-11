# Gotcha: Firestore Rules Testing con Emulador Local

**Fecha:** 2026-11-11  
**Tipo:** gotcha  
**Módulos afectados:** `firestore.rules`, `src/app/core/rules/firestore.rules.spec.ts`

## Problema
Simular la lógica de Firestore en TypeScript mediante funciones espejo da una falsa sensación de cobertura y no prueba las reglas reales de Firestore (como `serverTimestamp()`, `hasOnly()`, o las limitaciones de sintaxis de Common Expression Language de Firestore).

## Solución
1. Instalar `@firebase/rules-unit-testing` y `firebase-tools`.
2. Ejecutar la suite de pruebas mediante el script:
   ```bash
   firebase emulators:exec --only firestore "vitest run src/app/core/rules/firestore.rules.spec.ts"
   ```
3. Cargar `firestore.rules` directamente con `fs.readFileSync` dentro de `initializeTestEnvironment`.
4. Utilizar `describe.skipIf(!process.env['FIRESTORE_EMULATOR_HOST'])` en Vitest para que las pruebas de reglas no fallen cuando se corra `ng test` en solitario sin emulador.
