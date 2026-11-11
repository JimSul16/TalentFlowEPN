# Gotcha: Registro de Iconos en Ionic Standalone

**Fecha:** 2026-11-11  

## Problema
En Ionic Standalone con Angular, los componentes `ion-icon` no cargan los SVG automáticamente por nombre de cadena (`name="mail-outline"`), arrojando advertencias o mostrando iconos vacíos en tiempo de ejecución.

## Solución
En cada componente Standalone donde se use `ion-icon`:
1. Importar `addIcons` desde `ionicons`.
2. Importar los iconos específicos desde `ionicons/icons` en camelCase (ej. `mailOutline`, `callOutline`).
3. Ejecutar `addIcons({ mailOutline, callOutline })` dentro del constructor del componente.
