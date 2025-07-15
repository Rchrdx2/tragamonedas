# 📖 Documentación del Juego Tragamonedas

## 🎯 Descripción General

Este proyecto es una implementación completa de un juego de tragamonedas (slot machine) desarrollado en JavaScript ES6 con HTML5 y CSS3. El juego utiliza pesos colombianos como moneda y cuenta con un sistema avanzado de probabilidades dinámicas y mecánicas de juego balanceadas.

## 🏗️ Arquitectura del Proyecto

### Estructura de Archivos

```
tragamonedas/
├── index.html          # Estructura HTML del juego
├── style.css           # Estilos y animaciones
├── app.js              # Lógica principal del juego
├── README.md           # Información básica del proyecto
├── DOCUMENTACION.md    # Este archivo de documentación
└── assets/
    └── tragamonedas.png # Imagen del proyecto
```

### Patrón de Arquitectura

El proyecto sigue el patrón **MVC (Modelo-Vista-Controlador)** adaptado para JavaScript:

- **Modelo (SlotEngine)**: Maneja toda la lógica del juego
- **Vista (SlotUI)**: Gestiona la interfaz de usuario y animaciones
- **Controlador (GameController)**: Orquesta la comunicación entre modelo y vista

---

## 📁 Análisis Detallado de Archivos

### 🎮 app.js - Motor Principal del Juego

#### 1. GameConfig - Configuración Centralizada

```javascript
const GameConfig = {
  symbols: ["🍒", "🔔", "🍋", "⭐", "💎"],
  payouts: {
    /* multiplicadores de premio */
  },
  probabilities: {
    /* probabilidades base */
  },
  game: {
    /* configuración del juego */
  },
  messages: {
    /* mensajes del sistema */
  },
  limits: {
    /* límites del juego */
  },
};
```

**Propósito**: Centralizar toda la configuración del juego en un solo lugar para facilitar ajustes y mantenimiento.

**Características**:

- **Símbolos**: 5 emojis diferentes con diferentes rarezas
- **Sistema de Pagos**: Premios principales (3 iguales) e intermedios (2 iguales)
- **Probabilidades**: Distribución base de aparición de símbolos
- **Configuración**: Créditos iniciales, límites de apuesta, duración de animaciones
- **Mensajes**: Textos localizados en español
- **Límites**: Valor máximo para completar el juego (100,000 pesos)

#### 2. SlotEngine - Motor de Lógica del Juego

##### Constructor

```javascript
constructor() {
  this.credits = GameConfig.game.initialCredits;      // 50,000 pesos iniciales
  this.currentBet = GameConfig.game.defaultBet;       // Apuesta actual (1,000 pesos)
  this.isSpinning = false;                            // Estado de giro
  this.lastResult = null;                             // Último resultado
  this.totalWins = 0;                                 // Victorias totales
  this.totalSpins = 0;                                // Giros totales
  this.gameBlocked = false;                           // Juego bloqueado al llegar a 100k
  this.consecutiveWins = 0;                           // Victorias consecutivas
  this.maxConsecutiveWins = 4;                        // Límite de victorias seguidas
}
```

##### Métodos Principales

**`getDynamicProbabilities()`**

- **Propósito**: Calcula probabilidades dinámicas basadas en el saldo actual
- **Lógica**:
  - Saldo < 40,000: Probabilidades altas de ganar
  - Victorias consecutivas ≥ límite: Probabilidades muy bajas
  - Saldo > 97,000: Probabilidades gradualmente reducidas
- **Retorna**: Objeto con probabilidades normalizadas

**`spinReels()`**

- **Propósito**: Genera la combinación de símbolos para cada carrete
- **Casos especiales**:
  - Victorias consecutivas: Fuerza pérdida con símbolos diferentes
  - Saldo < 40,000: Fuerza victoria con tres iguales
  - Caso normal: Sorteo basado en probabilidades dinámicas
- **Retorna**: Array de 3 símbolos

**`calculateWinnings(combination)`**

- **Propósito**: Calcula las ganancias basadas en la combinación obtenida
- **Lógica**:
  1. Verifica tres símbolos iguales (premio principal)
  2. Si no, verifica dos símbolos iguales (premio intermedio)
  3. Sin coincidencias = 0 ganancias
- **Parámetros**: Array de símbolos de la combinación
- **Retorna**: Cantidad de pesos ganados

**`executeSpin()`**

- **Propósito**: Ejecuta un giro completo del juego
- **Proceso**:
  1. Validaciones (saldo, apuesta, estado)
  2. Descuenta la apuesta
  3. Genera combinación
  4. Calcula ganancias
  5. Actualiza estadísticas
  6. Verifica límite de juego
- **Retorna**: Objeto con resultado completo

#### 3. SlotUI - Interfaz de Usuario

##### Constructor

```javascript
constructor() {
  this.elements = {
    credits: document.getElementById("credits"),
    bet: document.getElementById("bet"),
    spinButton: document.getElementById("spin-button"),
    // ... más elementos DOM
  };
  this.spinTimeout = null;
}
```

##### Métodos de Interfaz

**`updateCredits(credits)`**

- **Propósito**: Actualiza la visualización de créditos
- **Características**:
  - Código de colores según el saldo
  - Rojo: 0 créditos
  - Naranja: < 40,000 pesos
  - Dorado: ≥ 40,000 pesos

**`startSpinAnimation()` / `stopSpinAnimation(combination)`**

- **Propósito**: Maneja las animaciones de giro
- **Duración**: 2 segundos configurables
- **Efectos**: Rotación CSS y estados de botones

**`showMessage(text, type)`**

- **Propósito**: Muestra mensajes al jugador
- **Tipos**: default, win, lose
- **Duración**: 3 segundos con auto-desvanecimiento

**`showGameCompleteModal()`**

- **Propósito**: Muestra modal de celebración al alcanzar 100,000 pesos
- **Características**: Modal con botón de reinicio

#### 4. GameController - Controlador Principal

##### Constructor y Inicialización

```javascript
constructor() {
  this.engine = new SlotEngine();
  this.ui = new SlotUI();
  this.initializeEventListeners();
  this.updateUI();
}
```

##### Gestión de Eventos

**`initializeEventListeners()`**

- **Eventos del ratón**: Click en botones
- **Eventos del teclado**: Espacio para girar
- **Validaciones**: Estados de juego antes de ejecutar acciones

**`handleSpin()`**

- **Propósito**: Gestiona la lógica completa de un giro
- **Validaciones**: Saldo, apuesta, estado de giro
- **Coordinación**: Entre animaciones y lógica

**`processSpinResult(result)`**

- **Propósito**: Procesa y presenta el resultado de un giro
- **Acciones**:
  - Actualiza interfaz
  - Muestra mensajes apropiados
  - Verifica completación del juego
  - Maneja efectos especiales

### 🎨 index.html - Estructura HTML

#### Estructura Semántica

```html
<div class="container">
  <header class="game-header">        <!-- Título del juego -->
  <main class="game-main">            <!-- Contenido principal -->
    <div class="info-panel">          <!-- Panel de información -->
    <div class="slot-machine">        <!-- Máquina tragamonedas -->
    <div class="control-panel">       <!-- Controles del juego -->
    <div class="message-panel">       <!-- Mensajes del sistema -->
  </main>
  <aside class="payout-table">        <!-- Tabla de pagos -->
</div>
```

#### Elementos Clave

**Panel de Información**

- Muestra créditos actuales
- Muestra apuesta actual
- Actualización dinámica vía JavaScript

**Máquina Tragamonedas**

- 3 carretes con símbolos
- Línea de pago visual
- Animaciones CSS para giros

**Panel de Control**

- Botones para ajustar apuesta (+/-)
- Botón principal de giro
- Estados habilitado/deshabilitado

**Tabla de Pagos**

- Lista completa de multiplicadores
- Separación entre premios principales e intermedios
- Referencia visual para el jugador

### 🎨 style.css - Estilos y Animaciones

#### Sistema de Diseño

- **Fuente**: Montserrat para consistencia visual
- **Colores**: Paleta dorada para tema de casino
- **Responsive**: Adaptable a diferentes pantallas
- **Animaciones**: Transiciones suaves y efectos visuales

#### Componentes Principales

**Variables CSS**

```css
:root {
  --primary-color: #ffd700;
  --secondary-color: #ff6b6b;
  --background-dark: #1a1a2e;
  /* ... más variables */
}
```

**Animaciones**

- **Giro de carretes**: Rotación 3D
- **Efectos de victoria**: Brillo y destello
- **Transiciones**: Suaves para botones y estados
- **Modal**: Aparición con fade-in

**Responsive Design**

- Breakpoints para móviles y tablets
- Ajuste de tamaños y espaciados
- Optimización de legibilidad

---

## 🎲 Sistema de Probabilidades

### Probabilidades Base

```javascript
probabilities: {
  "🍒": 0.40,  // Cereza - 40% (más común)
  "🔔": 0.30,  // Campana - 30%
  "🍋": 0.20,  // Limón - 20%
  "⭐": 0.08,  // Estrella - 8%
  "💎": 0.02,  // Diamante - 2% (más raro)
}
```

### Sistema Dinámico

#### 1. Protección de Saldo Bajo (< 40,000 pesos)

- **Probabilidades aumentadas** para evitar pérdida total
- **Victorias forzadas** para mantener el juego activo
- **Símbolos favorables** con mayor frecuencia

#### 2. Control de Victorias Consecutivas

- **Límite variable**: 4-5 victorias seguidas
- **Probabilidades reducidas** después del límite
- **Pérdidas forzadas** para balance del juego

#### 3. Transición de Saldo Alto (> 97,000 pesos)

- **Dificultad gradual** según proximidad a 100,000
- **Factor de reducción** proporcional al saldo
- **Balance entre desafío y progresión**

---

## 🏆 Sistema de Premios

### Premios Principales (3 símbolos iguales)

| Símbolo | Multiplicador | Probabilidad Base |
| ------- | ------------- | ----------------- |
| 🍒🍒🍒  | x2            | ~6.4%             |
| 🔔🔔🔔  | x3            | ~2.7%             |
| 🍋🍋🍋  | x4            | ~0.8%             |
| ⭐⭐⭐  | x7            | ~0.05%            |
| 💎💎💎  | x10           | ~0.0008%          |

### Premios Intermedios (2 símbolos iguales)

| Combinación | Multiplicador | Frecuencia Estimada |
| ----------- | ------------- | ------------------- |
| 🍒🍒        | x1.2          | ~30%                |
| 🔔🔔        | x1.5          | ~18%                |
| 🍋🍋        | x2            | ~8%                 |
| ⭐⭐        | x3            | ~1.3%               |
| 💎💎        | x5            | ~0.08%              |

---

## ⚙️ Estados del Juego

### Estados Principales

1. **Inicial**: Carga del juego con 50,000 pesos
2. **Jugando**: Estado normal de juego
3. **Girando**: Durante la animación (2 segundos)
4. **Resultado**: Mostrando resultado del giro
5. **Completado**: Al alcanzar 100,000 pesos
6. **Sin Créditos**: Cuando el saldo llega a 0

### Validaciones de Estado

- **Giro en progreso**: Bloquea nuevas acciones
- **Saldo insuficiente**: Impide apuestas
- **Juego completado**: Bloquea toda la funcionalidad
- **Límites de apuesta**: Entre 1,000 y 5,000 pesos

---

## 🎮 Controles de Usuario

### Controles de Teclado

- **Espacio**: Girar los carretes
- **Prevención**: Solo funciona si no hay giro activo

### Controles de Ratón

- **Botón Girar**: Acción principal del juego
- **Botones +/-**: Ajustar apuesta en incrementos de 1,000 pesos
- **Modal**: Click para reiniciar al completar

### Retroalimentación Visual

- **Estados de botones**: Habilitado/deshabilitado
- **Colores de saldo**: Indicadores visuales del estado financiero
- **Animaciones**: Feedback inmediato de acciones

---

## 📊 Análisis de Balance

### Retorno Teórico al Jugador (RTP)

El juego está diseñado con un **RTP dinámico** que varía según el contexto:

- **Saldo bajo (< 40k)**: RTP ~95-98% (favorable al jugador)
- **Saldo normal (40k-97k)**: RTP ~85-90% (estándar)
- **Saldo alto (> 97k)**: RTP ~70-80% (mayor desafío)

### Estrategias de Balance

1. **Protección del jugador**: Evita pérdidas totales
2. **Progresión controlada**: Facilita el avance hacia el objetivo
3. **Límite de victorias**: Previene rachas irreales
4. **Escalado de dificultad**: Aumenta el desafío cerca del final

---

## 🔧 Configuración y Personalización

### Parámetros Ajustables en GameConfig

#### Símbolos y Premios

```javascript
symbols: ["🍒", "🔔", "🍋", "⭐", "💎"],  // Cambiar símbolos
payouts: {
  "🍒": 2,    // Ajustar multiplicadores
  // ...
}
```

#### Configuración de Juego

```javascript
game: {
  initialCredits: 50000,    // Créditos iniciales
  minBet: 1000,            // Apuesta mínima
  maxBet: 5000,            // Apuesta máxima
  defaultBet: 1000,        // Apuesta por defecto
  reels: 3,                // Número de carretes
  spinDuration: 2000,      // Duración de animación (ms)
}
```

#### Límites y Mensajes

```javascript
limits: {
  maxCredits: 100000,      // Objetivo del juego
},
messages: {
  welcome: "¡Buena suerte!",  // Personalizar mensajes
  // ...
}
```

### Ajustes de Probabilidades

#### Modificar Dificultad

```javascript
// En getDynamicProbabilities()
if (this.credits < 40000) {
  // Ajustar umbral de protección
}

if (this.credits > 97000) {
  // Ajustar inicio de dificultad alta
}
```

#### Controlar Victorias Consecutivas

```javascript
// En constructor de SlotEngine
this.maxConsecutiveWins = 4; // Cambiar límite base
```

---

## 🐛 Depuración y Mantenimiento

### Variables de Debug

Para depurar, puedes acceder a:

```javascript
// En la consola del navegador
window.SlotGame.engine.credits; // Créditos actuales
window.SlotGame.engine.consecutiveWins; // Victorias consecutivas
window.SlotGame.engine.totalSpins; // Total de giros
window.SlotGame.engine.totalWins; // Total de victorias
```

### Puntos de Extensión

1. **Nuevos símbolos**: Agregar en `GameConfig.symbols` y `payouts`
2. **Efectos especiales**: Extender `SlotUI` con nuevas animaciones
3. **Mecánicas adicionales**: Expandir `SlotEngine` con nueva lógica
4. **Temas visuales**: Modificar variables CSS en `style.css`

### Consideraciones de Performance

- **Optimización DOM**: Uso eficiente de `getElementById`
- **Gestión de memoria**: Limpieza de timeouts y eventos
- **Animaciones CSS**: Uso de `transform` para mejor rendimiento

---

## 🚀 Futuras Mejoras Sugeridas

### Funcionalidades Adicionales

1. **Sistema de logros**: Badges por hitos alcanzados
2. **Estadísticas detalladas**: Gráficos de progreso
3. **Modo automático**: Giros automáticos
4. **Guardar progreso**: LocalStorage para persistencia
5. **Sonidos**: Efectos de audio para mayor inmersión

### Optimizaciones Técnicas

1. **Web Workers**: Para cálculos complejos de probabilidades
2. **Service Worker**: Para funcionamiento offline
3. **WebGL**: Animaciones más fluidas
4. **Progressive Web App**: Instalación en dispositivos

### Mejoras de UX

1. **Tutorial interactivo**: Guía para nuevos jugadores
2. **Temas personalizables**: Múltiples esquemas de color
3. **Accesibilidad**: Soporte para lectores de pantalla
4. **Multidioma**: Soporte para múltiples idiomas

---

## 📜 Licencia y Créditos

Este proyecto es una implementación educativa de un juego de tragamonedas. El código está documentado para facilitar el aprendizaje y la comprensión de:

- Programación orientada a objetos en JavaScript
- Manejo del DOM y eventos
- Animaciones CSS avanzadas
- Sistemas de probabilidades y balance de juegos
- Arquitectura de aplicaciones web interactivas

**Desarrollado con**: HTML5, CSS3, JavaScript ES6+  
**Compatibilidad**: Navegadores modernos (Chrome, Firefox, Safari, Edge)  
**Responsive**: Diseño adaptativo para móviles y desktop
