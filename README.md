# 🎰 Tragamonedas - Juego de Casino

Un juego de tragamonedas completamente funcional desarrollado en JavaScript ES6 con HTML5 y CSS3. El juego utiliza pesos colombianos como moneda y cuenta con un sistema avanzado de probabilidades dinámicas.

## 🎮 Características Principales

- **💰 Moneda**: Pesos colombianos (50,000 iniciales)
- **🎯 Objetivo**: Alcanzar 100,000 pesos para ganar
- **🎲 Sistema inteligente**: Probabilidades dinámicas según saldo
- **🏆 Premios**: Sistema de 3 iguales y 2 iguales
- **🎨 Interfaz moderna**: Diseño responsive y animaciones suaves
- **🔄 Balance automático**: Control de victorias consecutivas

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

## 🎲 Sistema de Probabilidades

El juego utiliza un sistema inteligente que ajusta las probabilidades según tu saldo:

- **Saldo bajo (< 40,000)**: Mejores probabilidades para mantener el juego activo
- **Saldo normal (40,000-97,000)**: Probabilidades estándar
- **Saldo alto (> 97,000)**: Mayor desafío cerca del objetivo
- **Control de rachas**: Límite de 4-5 victorias consecutivas para realismo

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

- **Probabilidades dinámicas**: Se ajustan según el estado del juego
- **Sistema de balance**: Previene pérdidas totales y rachas irreales
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
- **Probabilidades**: Cambiar distribución en `GameConfig.probabilities`
- **Mensajes**: Personalizar textos en `GameConfig.messages`

## 🎮 Controles

- **Ratón**: Interacción completa con botones
- **Teclado**: Barra espaciadora para girar
- **Responsive**: Funciona en móviles y tablets

## 📊 Sistema de Estadísticas

El juego rastrea:

- Créditos actuales
- Total de giros realizados
- Total de victorias
- Porcentaje de victorias
- Victorias consecutivas
- Estado del juego

## 🎯 Mecánicas de Balance

1. **Protección de saldo**: Evita que pierdas todo tu dinero
2. **Control de rachas**: Límite realista de victorias seguidas
3. **Progresión guiada**: El juego te ayuda a avanzar hacia el objetivo
4. **Dificultad escalada**: Mayor desafío cerca de los 100,000 pesos

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

Este proyecto demuestra el uso de JavaScript moderno, CSS3 avanzado y principios de desarrollo de juegos web. ¡Buena suerte alcanzando los 100,000 pesos! 🍀
