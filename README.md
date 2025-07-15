# 🎰 Tragamonedas - Juego de Casino

Un juego de tragamonedas completamente funcional desarrollado en JavaScript ES6 con HTML5 y CSS3. El juego utiliza pesos colombianos como moneda y cuenta con un sistema avanzado de probabilidades dinámicas.

## 🎮 Características Principales

- **💰 Moneda**: Pesos colombianos (50,000 iniciales)
- **🎯 Objetivo**: Alcanzar exactamente 100,000 pesos para ganar
- **🎲 Sistema inteligente**: 5 sistemas de probabilidades dinámicas
- **🏆 Premios**: Sistema de 3 iguales y 2 iguales con premios intermedios
- **🎨 Interfaz moderna**: Diseño responsive con animaciones y efectos
- **🔄 Balance automático**: Control avanzado de victorias consecutivas (5-7 límite)
- **🎰 Gran premio inicial**: Jackpots garantizados con apuestas estratégicas
- **⭐ Bonificaciones premium**: Símbolos especiales en rangos específicos
- **🚫 Límite absoluto**: Los créditos nunca superan 100,000 pesos

## 🚀 Cómo Jugar

1. **Apostar**: Usa los botones +/- para ajustar tu apuesta (1,000-5,000 pesos)
2. **Girar**: Haz clic en "GIRAR" o presiona la barra espaciadora
3. **Ganar**: Consigue 2 o 3 símbolos iguales para obtener premios
4. **Objetivo**: Llega a 100,000 pesos para completar el juego

## 🏆 Tabla de Premios

### Premios Principales (3 iguales)

| Símbolo | Multiplicador | Rareza   |
| ------- | ------------- | -------- |
| 🍒🍒🍒  | x2            | Común    |
| 🔔🔔🔔  | x3            | Medio    |
| 🍋🍋🍋  | x4            | Medio    |
| ⭐⭐⭐  | x7            | Raro     |
| 💎💎💎  | x10           | Muy Raro |

### Premios Intermedios (2 iguales)

| Combinación | Multiplicador |
| ----------- | ------------- |
| 🍒🍒        | x1.2          |
| 🔔🔔        | x1.5          |
| 🍋🍋        | x2            |
| ⭐⭐        | x3            |
| 💎💎        | x5            |

## 🎲 Sistema de Probabilidades Avanzado

El juego utiliza **5 sistemas inteligentes** que trabajan en conjunto:

### 1. 🚀 Gran Premio Inicial

- **Activación**: Apuestas de 3,000-4,000 pesos en una tirada aleatoria (1-3)
- **Efecto**: Jackpot casi garantizado (80% diamantes x10, 20% estrellas x7)
- **Objetivo**: Arranque explosivo para acelerar el progreso

### 2. ⭐ Bonificación Premium

- **Activación**: Saldo 47,000-56,000 pesos + apuestas de 1,000-2,000 pesos
- **Efecto**: 85% probabilidad de símbolos premium (diamantes/estrellas)
- **Objetivo**: Impulso estratégico en la zona media del juego

### 3. 🛡️ Protección de Saldo Bajo

- **Activación**: Saldo menor a 40,000 pesos
- **Efecto**: Probabilidades mejoradas para mantener el juego activo
- **Objetivo**: Evitar pérdidas totales y frustraciones

### 4. 🎯 Control de Victorias Consecutivas

- **Límite**: 5-7 victorias seguidas (aleatorio)
- **Efecto**: Fuerza pérdidas ocasionales para realismo
- **Objetivo**: Simular la variabilidad real de un casino

### 5. 🏔️ Escalado de Dificultad

- **Activación**: Saldo mayor a 97,000 pesos
- **Efecto**: Probabilidades gradualmete reducidas
- **Objetivo**: Mayor desafío cerca del objetivo final

## 🎮 Estrategias de Juego

### 💎 Para Gran Premio Inicial

- **Apuesta**: 3,000 o 4,000 pesos
- **Cuándo**: En las primeras 3 tiradas
- **Resultado**: Jackpot casi garantizado (30k-40k ganancia)

### ⭐ Para Bonificación Premium

- **Apuesta**: 1,000 o 2,000 pesos
- **Cuándo**: Saldo entre 47,000-56,000 pesos
- **Resultado**: Símbolos premium muy frecuentes

### 🎯 Para Juego Normal

- **Apuesta**: 5,000 pesos
- **Cuándo**: Cualquier momento fuera de rangos especiales
- **Resultado**: Probabilidades estándar sin bonificaciones

## 🚫 Límite Absoluto de Créditos

- **Máximo**: 100,000 pesos exactos
- **Comportamiento**: Los créditos se limitan automáticamente
- **Modal**: Aparece inmediatamente al alcanzar 100k
- **Display**: Nunca muestra más de 100,000 en pantalla

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica del juego
- **CSS3**: Animaciones, efectos visuales y diseño responsive
- **JavaScript ES6+**: Lógica del juego con clases y módulos
- **Patrón MVC**: Arquitectura organizada y mantenible

## 📁 Estructura del Proyecto

```
tragamonedas/
├── index.html           # Estructura principal
├── style.css           # Estilos y animaciones
├── app.js              # Lógica del juego
├── README.md           # Este archivo
├── DOCUMENTACION.md    # Documentación técnica completa
└── assets/
    └── tragamonedas.png # Imagen del proyecto
```

## 🎯 Arquitectura del Código

### Clases Principales

- **`GameConfig`**: Configuración centralizada del juego
- **`SlotEngine`**: Motor de lógica y probabilidades
- **`SlotUI`**: Interfaz de usuario y animaciones
- **`GameController`**: Coordinación entre modelo y vista

### Características Técnicas

- **Probabilidades dinámicas**: 5 sistemas avanzados trabajando en conjunto
- **Sistema de balance**: Control de rachas con límites variables (5-7)
- **Gran premio inicial**: Jackpot garantizado en tirada aleatoria (1-3)
- **Bonificación premium**: Símbolos especiales en rangos estratégicos
- **Límite absoluto**: Créditos máximos de 100,000 pesos
- **Animaciones fluidas**: Efectos CSS con transiciones suaves
- **Responsive design**: Se adapta a diferentes tamaños de pantalla
- **Código documentado**: JSDoc completo en español

## 🎨 Características Visuales

- **Tema de casino**: Colores dorados y diseño elegante
- **Animaciones de giro**: Efectos 3D para los carretes
- **Efectos de victoria**: Brillos y destellos al ganar
- **Modal de celebración**: Pantalla especial al completar el juego
- **Indicadores visuales**: Colores que cambian según el saldo

## 🔧 Configuración Personalizable

Puedes ajustar fácilmente:

- **Símbolos del juego**: Cambiar emojis en `GameConfig.symbols`
- **Multiplicadores**: Modificar premios en `GameConfig.payouts`
- **Límites de apuesta**: Ajustar mínimo/máximo en `GameConfig.game`
- **Probabilidades base**: Cambiar distribución en `GameConfig.probabilities`
- **Sistemas de balance**: Modificar rangos y efectos en `getDynamicProbabilities()`
- **Gran premio inicial**: Ajustar tirada aleatoria en `bigPrizeTurn`
- **Bonificación premium**: Cambiar rangos de saldo y apuestas
- **Límite de créditos**: Modificar techo máximo en `GameConfig.limits.maxCredits`
- **Mensajes**: Personalizar textos en `GameConfig.messages`

## 🎮 Controles

- **Ratón**: Interacción completa con botones
- **Teclado**: Barra espaciadora para girar
- **Responsive**: Funciona en móviles y tablets

## 📊 Sistema de Estadísticas

El juego rastrea:

- **Créditos actuales** (limitados a 100,000 máximo)
- **Apuesta actual** (1,000-5,000 pesos)
- **Total de giros realizados**
- **Total de victorias**
- **Porcentaje de victorias**
- **Victorias consecutivas** (con límite variable 5-7)
- **Estado del gran premio inicial** (otorgado/pendiente)
- **Tirada del gran premio** (1, 2 o 3 - determinada aleatoriamente)
- **Estado del juego** (activo/bloqueado al llegar a 100k)

## 🎯 Mecánicas de Balance Avanzadas

1. **Gran premio inicial**: Jackpot garantizado en primeras 3 tiradas con apuestas medias
2. **Bonificación premium**: Símbolos especiales en rango 47k-56k con apuestas bajas
3. **Protección de saldo**: Evita que pierdas todo tu dinero (< 40k)
4. **Control de rachas**: Límite realista de 5-7 victorias seguidas (variable)
5. **Escalado de dificultad**: Mayor desafío cerca de los 97,000+ pesos
6. **Límite absoluto**: Los créditos se cortan exactamente en 100,000 pesos

## 🚀 Instalación y Uso

1. **Descarga** o clona este repositorio
2. **Abre** `index.html` en tu navegador web
3. **¡Juega!** No requiere instalación adicional

Compatible con todos los navegadores modernos (Chrome, Firefox, Safari, Edge).

## 📖 Documentación Adicional

Para información técnica detallada, consulta:

- `DOCUMENTACION.md` - Documentación técnica completa
- Comentarios JSDoc en `app.js` - Documentación del código
- Comentarios CSS en `style.css` - Documentación de estilos

## 🎊 ¡Disfruta el Juego!

Este proyecto demuestra el uso de JavaScript ES6 moderno, CSS3 avanzado y principios sofisticados de desarrollo de juegos web. Incluye 5 sistemas de probabilidades trabajando en conjunto, balance automático inteligente y mecánicas de progresión estratégica.

### 🎯 Consejos para Ganar:

1. **Usa apuestas de 3000-4000** en las primeras tiradas para el gran premio
2. **Cambia a 1000-2000** cuando tengas 47k-56k para bonificación premium
3. **Aprovecha la protección** cuando tengas menos de 40k
4. **Ten paciencia** - el juego está balanceado para llevarte a 100k

¡Buena suerte alcanzando los 100,000 pesos! 🍀💎
