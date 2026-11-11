# Current Task — TalentFlow

**Fase:** Fase 4 — Endurecimiento y Entrega
**Estado:** ⚠️ Review Needed — re-auditoría 2026-11-11: NO cumple al 100 %
**Última actualización:** 2026-11-11 — Re-auditoría del commit `2520ada`

## Resultado de la re-auditoría

Informe completo: [`.agent/audits/2026-11-11-plan-compliance-reaudit.md`](audits/2026-11-11-plan-compliance-reaudit.md)

### Verificación real de comandos
- `npm run lint`: ❌ FAIL (Prettier en `e2e/test-datetime.spec.ts`, archivo sin trackear).
- `npm run test:unit`: ⚠️ 35 tests pasan, pero 8 son la suite falsa de reglas (27 reales).
- `npm run test:rules`: ❌ Pasan 8 tests, pero no prueban `firestore.rules` (función espejo en TS).
- `npm run test:e2e`: ✅ 1 test pasa (con warnings de `ion-datetime`).
- `npm audit --omit=dev`: ✅ 0 vulnerabilidades.
- `npm run apk:debug`: ⚠️ APK existe, pero pesa 4.78 MB (no 5.01 MB).
- `git status`: ❌ `e2e/test-datetime.spec.ts` sin trackear.

### Bloqueadores abiertos
1. **H-01:** `src/app/core/rules/firestore.rules.spec.ts` reimplementa las reglas en TS; no usa emulador ni `@firebase/rules-unit-testing`.
2. **H-02:** `e2e/evidencias.spec.ts` genera 05 y 06 con `page.setContent()` (HTML inventado); 04 no abre el modal; 06 muestra 5.01 MB.
3. **H-03:** `firestore.rules:38` mantiene `allow read: if true`; `:19` acepta teléfonos sin dígitos; `:33` acepta cualquier timestamp.
4. **H-04:** Config real `talentflowepn` commiteada; `.env.example` sigue con `talentflow-workshop`.
5. **H-05:** Archivo de depuración sin trackear rompe lint.
6. **H-06:** README inconsistente (19/27/35 tests, `any`, `hasAll` vs `hasOnly`).
7. **H-07:** Doble carga en `CandidatosPage`; mensaje de `obtenerPorId` se pierde.
8. **H-08:** Warning de `ion-datetime` por fechas vacías.

### Resuelto y verificado
- A11y: `lang="es"`, zoom, `role="alert"`/`aria-live`, `prefers-reduced-motion`.
- Validadores cliente: teléfono 7-15 dígitos, correo con TLD, entero, fechas.
- Navegación post-registro a `/tabs/candidatos` y `ionViewWillEnter()`.
- Formato de fechas DD/MM/YYYY y salario USD en el detalle.
- `limit(50)`, `obtenerPorId()`, `allowBackup="false"`, SDK 36, `.gitignore`, `LICENSE`, knowledge docs.

## Próximo paso
Corregir H-01 a H-08 y volver a ejecutar la matriz de verificación. No marcar como Done hasta que `npm run lint` esté en verde y los tests de reglas usen el emulador.
