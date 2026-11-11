# ADR: Selección de Stack Tecnológico — TalentFlow

**Fecha:** 2026-11-11  
**Estado:** Aprobado  

## Contexto
El taller exige el desarrollo de un registro estructurado de hojas de vida para selección empresarial en Android y Web, con componentes Ionic nativos y base de datos Firebase Cloud Firestore.

## Decisión
1. **Ionic Framework 9 + Angular 22 Standalone:** Se adoptó la versión más reciente con componentes Standalone y nuevo control flow sintáctico (`@if`, `@for`), prescindiendo de `NgModule` para mayor rendimiento y menor sobrecarga.
2. **Capacitor 8:** Conexión nativa con Android mediante Capacitor y compilación directa con Gradle Wrapper (`gradlew assembleDebug`).
3. **Firebase Modular SDK (v13):** Uso de funciones árbol-sacudibles (`tree-shakable`) como `collection`, `addDoc`, `getDocs`, `serverTimestamp`.
4. **Vitest 5.1:** Ejecución rápida de pruebas unitarias en lugar de Jasmine/Karma para integración directa con Vite y soporte rápido de TypeScript.

## Consecuencias
- Bundle inicial altamente optimizado (1.20 MB).
- Compatibilidad completa con Node.js 22 LTS y Android SDK 35/36.
