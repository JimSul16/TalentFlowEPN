# Gotcha: Manejo de Fechas ISO 'YYYY-MM-DD'

**Fecha:** 2026-11-11  

## Problema
Al usar `new Date().toISOString()`, las fechas se calculan en horario UTC. En zonas horarias como Ecuador (UTC-5), una fecha seleccionada a las 20:00 puede guardarse como el día siguiente en la base de datos.

## Solución
Se estandarizó la función `getFechaHoyISO()` en `src/app/core/validators/candidato.validators.ts`, que extrae `getFullYear()`, `getMonth() + 1` y `getDate()` locales con relleno de ceros (`padStart(2, '0')`).
Todas las fechas se persisten en formato plano `YYYY-MM-DD` para evitar desfaces temporales.
