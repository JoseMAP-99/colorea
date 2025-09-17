# Colorea

Una aplicación React Native moderna para dominar el arte de los colores con 3 modos de juego únicos.

## Características

- 🎨 **3 Modos de juego únicos**: Color Chain, Gradient Gap, Memory Mix
- 🔧 **TypeScript** para tipado estático
- 🧭 **React Navigation** para navegación
- 📱 **React Native** 0.80.2
- 🎯 **Precisión de color** con ΔE2000 (culori)
- 💾 **Persistencia** con MMKV
- 🎮 **Haptics** para feedback táctil
- 🌱 **Semilla diaria** para retos consistentes

## Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── hooks/         # Custom hooks
├── navigation/    # Configuración de navegación
├── screens/       # Pantallas de la aplicación
├── services/      # Servicios y APIs
└── assets/        # Recursos estáticos
```

## Comandos Disponibles

```bash
# Instalar dependencias
make install

# Iniciar servidor de desarrollo
make start

# Desarrollo completo (Vite + Android)
make dev

# Ejecutar en Android
make android

# Ejecutar en iOS
make ios

# Build de producción
make build

# Limpiar artefactos
make clean

# Linting
make lint

# Tests
make test
```

## Configuración

El proyecto usa Vite en lugar de Metro para un bundling más rápido y mejor soporte para TypeScript.

### Alias de Importación

Usa `@/` para importar desde la carpeta `src`:

```typescript
import { Component } from '@/components/Component';
import { useHook } from '@/hooks/useHook';
```

## Desarrollo

1. Instala las dependencias: `make install`
2. Inicia el servidor de desarrollo: `make dev`
3. Abre la app en tu dispositivo/emulador

## Build

Para generar el bundle de producción:

```bash
make build
```

Esto generará los archivos en la carpeta `dist/`.
