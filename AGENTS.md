# Configuración de Agentes - TalentFlow (Mobile App)

Este archivo es leído automáticamente por los agentes de IA en cada sesión. Establece las normas de trabajo, el flujo de desarrollo y la arquitectura de habilidades.

---

## 🚀 Primer Paso Obligatorio

En cada nueva sesión, lee y aplica **`.agent/skills/project-context-primer/SKILL.md`**.

---

## 🔒 Reglas Críticas

### 1. Seguridad
- Comandos destructivos (`DROP`, `DELETE`, `TRUNCATE`, `rm -rf`, `git push --force` a ramas principales): **Solicita confirmación explícita antes de ejecutar**.
- Si los tests existentes pasan y la tarea no modifica ese módulo: **no tocar**.
- Antes de migraciones o despliegues a producción: **definir paso de rollback**.
- **Seguridad Móvil**:
  - Nunca guardar credenciales, tokens o datos sensibles en AsyncStorage, SharedPreferences sin cifrar o código plano. Usa Keychain / Keystore o almacenamiento seguro.
  - Validar siempre los deep links y esquemas de URL externos.

### 2. Higiene del Código (Code Hygiene)
- Comentarios explicativos: solo a nivel de cabecera de función/método (JSDoc / TSDoc / DartDoc / SwiftDoc / KDoc).
- Eliminar `console.log`, `print()`, `debugger` o logs de depuración antes de enviar cambios a commit.
- Variables de entorno sensibles (API keys, endpoints, secretos): **usar `.env`**. Nunca hardcodear secretos en la app cliente. Mantener actualizado `.env.example`.

### 3. Calidad de Código (Code Quality)
- Principio DRY pragmático: si un bloque se repite 3+ veces, refactorizar/extraer.
- Evitar sobre-ingeniería y abstracciones prematuras: no generalizar si no hay un caso de uso claro y probado.
- Refactorings: siempre en commits/PRs independientes de los cambios de funcionalidad.

---

## 🔄 Flujo de Trabajo (Workflow)

```text
NUEVA SESIÓN
  └─ project-context-primer (lectura de contexto)

FASE DE IDEA       → brainstorming → SCOPE-<funcionalidad>.md
FASE DE PLAN       → writing-plans → implementation_plan.md → architecture-review
DESARROLLO MÓVIL   → test-driven-execution / mobile-developer / react-native / flutter
REVISIÓN Y COMMIT  → code-review → conventional commits → PR
```

---

## 📂 Estructura de Skills y Agentes

Directorio **`.agent/`**:
- `skills/` — Habilidades activas para el proyecto móvil y flujos de trabajo (70+ skills de desarrollo móvil, diseño HIG, Expo, React Native, Flutter, Swift, Kotlin, seguridad y testing).
- `skills_library/` — Biblioteca completa con más de 2,855 skills disponibles localmente (de `agentic-awesome-skills`).
- `rules/` — Reglas obligatorias de estilo, higiene y seguridad (`code-hygiene.md`, `code-quality.md`, `safety.md`).
- `agents/` — Personas y roles especializados:
  - 🎨 **Aria** (`designer.md`): UI/UX, animaciones, diseño de interacción y sistemas de diseño móvil.
  - 💻 **Felix** (`frontend-dev.md`): Desarrollo frontend y móvil, arquitectura de componentes, rendimiento y UI fluida.
  - ⚙️ **Bora** (`backend-dev.md`): APIs REST/GraphQL, autenticación, contratos de datos y bases de datos.
  - 🚀 **Deva** (`devops.md`): CI/CD móvil (Fastlane, GitHub Actions, EAS), builds y automatización de despliegues a App Store y Google Play.
- `knowledge/` — Base de conocimiento persistente para documentar decisiones técnicas, lecciones aprendidas y arquitectura entre sesiones.

### 🛠️ Utilidad de Activación de Skills
Para activar o buscar cualquier skill adicional de las 2,855 de la biblioteca:
- Listar activas: `.\activate-skill.ps1 -List`
- Buscar en biblioteca: `.\activate-skill.ps1 -Search "<palabra>"`
- Activar skill: `.\activate-skill.ps1 -Skill "<nombre-de-skill>"`
- Desactivar skill: `.\activate-skill.ps1 -Deactivate "<nombre-de-skill>"`

---

## 📱 Buenas Prácticas para Aplicaciones Móviles

1. **Rendimiento y Fluidez**:
   - Mantener 60/120 FPS en renderizado. Evitar re-renders innecesarios (`useMemo`, `useCallback`, `memo` o `const` widgets).
   - Optimizar listas largas usando virtualización (`FlashList`, `FlatList`, `ListView.builder`).
   - Optimización de imágenes (formatos modernos como WebP, cacheo, tamaños adaptados al DPI).

2. **Diseño de Interacción (Apple HIG & Material You)**:
   - Respetar áreas seguras (Safe Area Insets) y muescas / dynamic island.
   - Soportar modo claro y oscuro adecuadamente.
   - Proporcionar feedback háptico y estados de carga inmediatos (skeletons / shimmers).

3. **Manejo de Red y Estado Offline**:
   - Manejo explícito de estados: `idle`, `loading`, `error`, `success`, `empty`.
   - Reintentos con retroceso exponencial en peticiones de red.
