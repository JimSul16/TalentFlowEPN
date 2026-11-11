# Gotcha: Ruta del Android SDK en Windows

**Fecha:** 2026-11-11  

## Problema
En este entorno Windows, el Android SDK no se encuentra en `%LOCALAPPDATA%\Android\Sdk`, sino directamente en `C:\Android\Sdk`.

## Solución
Siempre configurar `android/local.properties` con:
```properties
sdk.dir=C\:\\Android\\Sdk
```
Y exportar las variables de entorno en CMD:
```bat
set ANDROID_HOME=C:\Android\Sdk
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
```
De lo contrario, `gradlew assembleDebug` fallará indicando `SDK location not found`.
