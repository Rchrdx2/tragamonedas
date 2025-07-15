/**
 * 🎰 JUEGO DE TRAGAMONEDAS - DOCUMENTACIÓN COMPLETA
 * =====================================================
 * 
 * Este archivo contiene la lógica completa del juego de tragamonedas
 * desarrollado en JavaScript ES6 con un sistema de probabilidades dinámicas
 * y balance de juego avanzado.
 * 
 * Arquitectura: Patrón MVC (Modelo-Vista-Controlador)
 * - SlotEngine: Modelo (lógica del juego)
 * - SlotUI: Vista (interfaz de usuario)
 * - GameController: Controlador (coordinación)
 * 
 * Características principales:
 * - Sistema de moneda: Pesos colombianos
 * - Probabilidades dinámicas según saldo
 * - Control de victorias consecutivas
 * - Protección contra pérdidas totales
 * - Progresión hacia objetivo de 100,000 pesos
 * 
 * @author Equipo de Desarrollo
 * @version 1.0.0
 * @since 2025
 */

// ==========================================
// CONFIGURACIÓN CENTRALIZADA
// ==========================================

/**
 * Configuración centralizada del juego de tragamonedas.
 * Contiene todos los parámetros ajustables del juego para facilitar
 * el mantenimiento y la personalización.
 * 
 * @constant {Object} GameConfig
 * @property {string[]} symbols - Array de símbolos del juego (emojis)
 * @property {Object} payouts - Multiplicadores de premio por combinación
 * @property {Object} probabilities - Probabilidades base de cada símbolo
 * @property {Object} game - Configuración general del juego
 * @property {Object} messages - Mensajes localizados en español
 * @property {Object} limits - Límites y restricciones del juego
 */
const GameConfig = {
  symbols: ["🍒", "🔔", "🍋", "⭐", "💎"], // Símbolos del juego ordenados por frecuencia
  
  /**
   * Sistema de pagos del juego
   * - Premios principales: 3 símbolos iguales
   * - Premios intermedios: 2 símbolos iguales (clave con símbolo duplicado)
   */
  payouts: {
    // Premios principales (tres iguales)
    "🍒": 2,    // Cereza: más común, menor premio
    "🔔": 3,    // Campana: común, premio bajo
    "🍋": 4,    // Limón: medio, premio medio
    "⭐": 7,    // Estrella: raro, premio alto
    "💎": 10,   // Diamante: muy raro, premio máximo
    
    // Premios intermedios (dos iguales)
    "🍒🍒": 1.2,  // Dos cerezas
    "🔔🔔": 1.5,  // Dos campanas
    "🍋🍋": 2,    // Dos limones
    "⭐⭐": 3,    // Dos estrellas
    "💎💎": 5,    // Dos diamantes
  },
  
  /**
   * Probabilidades base de aparición de cada símbolo
   * Suma total = 1.0 (100%)
   * Ordenadas de más común a más raro
   * BALANCEADAS para compensar los sistemas de bonificación
   */
  probabilities: {
    "🍒": 0.50,  // 50% - Muy común (aumentado para compensar)
    "🔔": 0.35,  // 35% - Común (aumentado para compensar)
    "🍋": 0.12,  // 12% - Medio (reducido)
    "⭐": 0.025, // 2.5% - Raro (reducido significativamente)
    "💎": 0.005, // 0.5% - Muy raro (reducido drásticamente)
  },
<<<<<<< HEAD
  twoMatchPayouts: {
    "🍒": 0.5,  // 50% de la apuesta
    "🔔": 0.8,  // 80% de la apuesta  
    "🍋": 1.0,  // 100% de la apuesta
    "⭐": 1.5,  // 150% de la apuesta
    "💎": 2.0   // 200% de la apuesta
  },
  specialCombinations: {
    "🍒🔔🍋": 0.3,
    "⭐💎🍒": 1.2,
    "🔔🍋⭐": 0.7
  },
  controlSettings: {
    minSpins: 4,
    maxSpins: 5,
    targetFinalCredits: 40000,
    allowedRange: [40000, 97000],
    maxCredits: 100000,
    redirectDelay: 5000
  },
  game: {
    initialCredits: 50000,
    minBet: 1000,
    maxBet: 5000,
    defaultBet: 2000,
    reels: 3,
    spinDuration: 2000,
=======
  
  /**
   * Configuración general del juego
   */
  game: {
    initialCredits: 50000,  // Créditos iniciales en pesos colombianos
    minBet: 1000,          // Apuesta mínima por giro
    maxBet: 5000,          // Apuesta máxima por giro
    defaultBet: 1000,      // Apuesta inicial por defecto
    reels: 3,              // Número de carretes
    spinDuration: 2000,    // Duración de la animación de giro (ms)
>>>>>>> origin/alt
  },
  
  /**
   * Mensajes del sistema localizados en español
   * Usa ${amount} como placeholder para cantidades
   */
  messages: {
    welcome: "¡Buena suerte!",
    win: "¡Ganaste ${amount} pesos!",
    lose: "¡Inténtalo de nuevo!",
    jackpot: "¡JACKPOT! ¡Ganaste ${amount} pesos!",
    noCredits: "Te quedaste sin créditos. ¡Reinicia el juego!",
    insufficientFunds: "Créditos insuficientes para esta apuesta",
    gameComplete: "¡FELICITACIONES! Has alcanzado 100,000 pesos. ¡Eres un maestro del casino!",
  },
  
  /**
   * Límites y restricciones del juego
   */
  limits: {
    maxCredits: 100000,  // Objetivo del juego - al alcanzarlo se completa
  },
};

// ==========================================
// MOTOR DEL JUEGO (LÓGICA PURA)
// ==========================================

/**
 * Clase principal que maneja toda la lógica del juego de tragamonedas.
 * Implementa un sistema de probabilidades dinámicas, control de victorias
 * consecutivas y balance de juego avanzado.
 * 
 * @class SlotEngine
 */
class SlotEngine {
  /**
   * Constructor del motor del juego.
   * Inicializa todas las propiedades del juego con valores por defecto.
   */
  constructor() {
    /** @type {number} Créditos actuales del jugador en pesos colombianos */
    this.credits = GameConfig.game.initialCredits;
    
    /** @type {number} Apuesta actual por giro */
    this.currentBet = GameConfig.game.defaultBet;
    
    /** @type {boolean} Indica si los carretes están girando */
    this.isSpinning = false;
    
    /** @type {Object|null} Resultado del último giro */
    this.lastResult = null;
    
    /** @type {number} Número total de victorias */
    this.totalWins = 0;
    
    /** @type {number} Número total de giros realizados */
    this.totalSpins = 0;
    
    /** @type {boolean} Indica si el juego está bloqueado (al llegar a 100k) */
    this.gameBlocked = false;
    
    /** @type {number} Número de victorias consecutivas actuales */
    this.consecutiveWins = 0;
    
    /** @type {number} Límite máximo de victorias consecutivas (5-7) */
    this.maxConsecutiveWins = 5;
    
    /** @type {boolean} Indica si el jugador ya recibió su gran premio inicial */
    this.bigPrizeAwarded = false;
    
    /** @type {number} Tirada aleatoria elegida para el gran premio inicial (1, 2 o 3) */
    this.bigPrizeTurn = Math.floor(Math.random() * 3) + 1;
  }

  /**
   * Calcula las probabilidades dinámicas de aparición de símbolos
   * basadas en el estado actual del juego (saldo, victorias consecutivas).
   * 
   * Implementa cinco sistemas de balance:
   * 1. Gran premio inicial (una tirada aleatoria entre las primeras 3 con apuestas de 3000-4000)
   * 2. Protección de saldo bajo (< 40,000 pesos)
   * 3. Control de victorias consecutivas (límite 5-7)
   * 4. Escalado de dificultad para saldos altos (> 97,000 pesos)
   * 5. Bonificación de símbolos premium (saldo 47k-56k + apuesta 1000-2000 pesos)
   * 
   * @returns {Object} Objeto con probabilidades normalizadas por símbolo
   */
  getDynamicProbabilities() {
    const base = { ...GameConfig.probabilities };
    let factor = 1;

    // NUEVO SISTEMA: Gran premio inicial garantizado en una tirada aleatoria entre las primeras 3 (solo con apuestas medias)
    if (this.totalSpins === this.bigPrizeTurn && !this.bigPrizeAwarded && (this.currentBet === 3000 || this.currentBet === 4000)) {
      // PROBABILIDADES EXTREMAS para gran premio inicial SOLO con apuestas de 3000-4000
      return {
        "🍒": 0.03,  // Prácticamente eliminado
        "🔔": 0.03,  // Prácticamente eliminado
        "🍋": 0.02,  // Prácticamente eliminado
        "⭐": 0.55,  // ALTÍSIMO (mantenido alto)
        "💎": 0.37,  // ALTO pero reducido (de 0.60 a 0.37)
      };
    }

    // NUEVO SISTEMA: Bonificación de símbolos premium (💎⭐) en rango específico
    if (this.credits >= 47000 && this.credits <= 56000 && (this.currentBet === 1000 || this.currentBet === 2000)) {
      // Aumentar exponencialmente las probabilidades de diamantes y estrellas
      // CASI GARANTIZADO que salgan símbolos premium
      const bonusMultiplier = this.currentBet === 1000 ? 15 : 12; // 15x para 1000, 12x para 2000
      
      return {
        "🍒": 0.08,  // Muy reducido
        "🔔": 0.08,  // Muy reducido
        "🍋": 0.09,  // Muy reducido
        "⭐": 0.50,  // CASI GARANTIZADO (mantenido alto)
        "💎": 0.25,  // ALTO pero reducido (de 0.40 a 0.25)
      };
    }

    // Menos de 40000 pesos: imposible perder (excepto si ya ha ganado demasiado seguido)
    if (this.credits < 40000 && this.consecutiveWins < this.maxConsecutiveWins) {
      return {
        "🍒": 0.40,
        "🔔": 0.35,
        "🍋": 0.15,
        "⭐": 0.08,
        "💎": 0.02,
      };
    }

    // Control de victorias consecutivas: después de 4-5 victorias seguidas, forzar pérdida
    if (this.consecutiveWins >= this.maxConsecutiveWins) {
      // Probabilidades reducidas pero no tan bajas para ganar ocasionalmente
      return {
        "🍒": 0.20,
        "🔔": 0.18,
        "🍋": 0.15,
        "⭐": 0.08,
        "💎": 0.04,
      };
    }

    // Transición amortiguada para saldos altos (> 97,000 pesos)
    if (this.credits > 97000) {
      // Disminuye gradualmente la probabilidad de ganar cuanto más alto es el saldo (>97,000)
      // Factor va de 1 (en 97,000 pesos) a 0.5 (en 120,000+ pesos) - MENOS PENALIZACIÓN
      factor = 1 - ((this.credits - 97000) / 23000) * 0.5;
      if (factor < 0.5) factor = 0.5; // Mínimo factor aumentado
      for (let sym in base) base[sym] *= factor;
      // Aumenta la probabilidad de perder (no todos iguales) - REDUCIDO
      base["🍒"] += (1 - factor) * 0.15;
    }
    // Normalizar para que sumen 1
    const total = Object.values(base).reduce((a, b) => a + b, 0);
    for (let key in base) base[key] /= total;
    return base;
  }

  /**
   * Genera la combinación de símbolos para los carretes del juego.
   * Implementa lógica especial para diferentes estados del juego:
   * - Gran premio inicial (primeras 3 tiradas)
   * - Bonificación de símbolos premium (rango 47k-56k + apuesta baja)
   * - Control de victorias consecutivas
   * - Protección de saldo bajo
   * - Generación normal basada en probabilidades
   * 
   * @returns {string[]} Array de 3 símbolos para los carretes
   */
  spinReels() {
    // NUEVO: Gran premio inicial garantizado en una tirada aleatoria entre las primeras 3 (solo con apuestas medias)
    if (this.totalSpins === this.bigPrizeTurn && !this.bigPrizeAwarded && (this.currentBet === 3000 || this.currentBet === 4000)) {
      // FORZAR jackpot masivo en la tirada elegida SOLO con apuestas de 3000-4000
      const random = Math.random();
      
      // 50% probabilidad de triple estrella, 30% triple diamante, 20% combinación mixta premium
      if (random < 0.5) {
        return ["⭐", "⭐", "⭐"]; // x7 multiplicador (favorecido)
      } else if (random < 0.8) {
        return ["💎", "💎", "💎"]; // x10 multiplicador (reducido)
      } else {
        // 20% combinación mixta premium
        return ["⭐", "⭐", "💎"]; // x3 multiplicador
      }
    }

    // NUEVO: Bonificación de símbolos premium para saldo 47k-56k + apuesta baja (solo 1000 y 2000)
    if (this.credits >= 47000 && this.credits <= 56000 && (this.currentBet === 1000 || this.currentBet === 2000)) {
      const probs = this.getDynamicProbabilities();
      const result = [];
      
      // FORZAR símbolos premium con probabilidad extremadamente alta
      for (let i = 0; i < GameConfig.game.reels; i++) {
        const random = Math.random();
        
        // 90% de probabilidad de que salga diamante o estrella (reducido de 95%)
        if (random < 0.90) {
          // 65% estrella, 35% diamante (favoreciendo estrellas)
          result.push(random < 0.585 ? "⭐" : "💎"); // 0.65 * 0.90 = 0.585
        } else {
          // 10% para otros símbolos
          let cumulative = 0;
          for (const [symbol, prob] of Object.entries(probs)) {
            cumulative += prob;
            if (random <= cumulative) {
              result.push(symbol);
              break;
            }
          }
        }
      }
      return result;
    }

    // Control de victorias consecutivas: después de 4-5 victorias, forzar pérdida
    if (this.consecutiveWins >= this.maxConsecutiveWins) {
      // Generar combinación que garantice pérdida (símbolos diferentes)
      const symbols = GameConfig.symbols;
      
      // Asegurar que no haya 3 iguales ni 2 iguales
      return [symbols[0], symbols[1], symbols[2]]; // 🍒🔔🍋
    }

    // Caso especial: menos de 40000 pesos - forzar ganancia (si no ha ganado demasiado seguido)
    if (this.credits < 40000 && this.consecutiveWins < this.maxConsecutiveWins) {
      // Forzar combinación ganadora (tres iguales)
      const probs = this.getDynamicProbabilities();
      const random = Math.random();
      let cumulative = 0;
      let winner = GameConfig.symbols[0];
      for (const [symbol, prob] of Object.entries(probs)) {
        cumulative += prob;
        if (random <= cumulative) {
          winner = symbol;
          break;
        }
      }
      return [winner, winner, winner];
    }

    // Caso normal: sorteo ponderado por carrete
    const probs = this.getDynamicProbabilities();
    const result = [];
    for (let i = 0; i < GameConfig.game.reels; i++) {
      const random = Math.random();
      let cumulative = 0;
      for (const [symbol, prob] of Object.entries(probs)) {
        cumulative += prob;
        if (random <= cumulative) {
          result.push(symbol);
          break;
        }
      }
    }
    return result;
  }

  /**
   * Calcula las ganancias basadas en la combinación de símbolos obtenida.
   * Implementa el sistema de pagos tanto para premios principales (3 iguales)
   * como para premios intermedios (2 iguales).
   * 
   * @param {string[]} combination - Array de 3 símbolos de la combinación
   * @returns {number} Cantidad de pesos ganados (0 si no hay premio)
   */
  calculateWinnings(combination) {
    const firstSymbol = combination[0];
    const secondSymbol = combination[1];
    const thirdSymbol = combination[2];
    
    // Verificar tres iguales (premio principal)
    const allMatch = combination.every((symbol) => symbol === firstSymbol);
    if (allMatch) {
      const multiplier = GameConfig.payouts[firstSymbol];
      return { amount: this.currentBet * multiplier, type: 'win' };
    }
    
    // Verificar dos iguales (premios intermedios)
    let twoMatchSymbol = null;
    let matchCount = 0;
    
    // Contar cuántas veces aparece cada símbolo
    const symbolCount = {};
    combination.forEach(symbol => {
      symbolCount[symbol] = (symbolCount[symbol] || 0) + 1;
    });
    
    // Buscar el símbolo que aparece al menos 2 veces
    for (const [symbol, count] of Object.entries(symbolCount)) {
      if (count >= 2) {
        twoMatchSymbol = symbol;
        matchCount = count;
        break;
      }
    }
    
    // Si hay al menos dos iguales, dar premio intermedio
    if (twoMatchSymbol && matchCount >= 2) {
      const intermediateKey = twoMatchSymbol + twoMatchSymbol;
      const multiplier = GameConfig.payouts[intermediateKey];
      if (multiplier) {
        return this.currentBet * multiplier;
      }
    }
    
    return 0;
  }

  /**
   * Valida si una cantidad de apuesta es válida según las reglas del juego.
   * 
   * @param {number} betAmount - Cantidad a apostar
   * @returns {boolean} True si la apuesta es válida, false en caso contrario
   */
  isValidBet(betAmount) {
    return (
      betAmount >= GameConfig.game.minBet &&
      betAmount <= GameConfig.game.maxBet &&
      betAmount <= this.credits
    );
  }

  /**
   * Establece una nueva cantidad de apuesta si es válida.
   * 
   * @param {number} betAmount - Nueva cantidad a apostar
   * @returns {boolean} True si se estableció correctamente, false en caso contrario
   */
  setBet(betAmount) {
    if (this.isValidBet(betAmount)) {
      this.currentBet = betAmount;
      return true;
    }
    return false;
  }

  /**
   * Ejecuta un giro completo del juego incluyendo todas las validaciones,
   * cálculos y actualizaciones de estado.
   * 
   * Proceso:
   * 1. Validaciones (saldo, apuesta, estado)
   * 2. Descuenta la apuesta
   * 3. Genera combinación de símbolos
   * 4. Calcula ganancias
   * 5. Actualiza estadísticas y estado
   * 6. Verifica condiciones de fin de juego
   * 
   * @returns {Object|null} Objeto con el resultado del giro o null si no se puede ejecutar
   */
  executeSpin() {
    if (this.isSpinning || !this.isValidBet(this.currentBet) || this.gameBlocked) {
      return null;
    }
    
    this.isSpinning = true;
    this.totalSpins++;
    this.credits -= this.currentBet;
    const combination = this.spinReels();
    const winnings = this.calculateWinnings(combination);
    
    if (winnings > 0) {
      this.credits += winnings;
      
      // LÍMITE ABSOLUTO: Los créditos nunca pueden superar 100,000
      if (this.credits > GameConfig.limits.maxCredits) {
        this.credits = GameConfig.limits.maxCredits;
      }
      
      this.totalWins++;
      this.consecutiveWins++; // Incrementar victorias consecutivas
      
      // Marcar gran premio como otorgado si fue en la tirada especial elegida
      if (this.totalSpins === this.bigPrizeTurn && (winnings >= this.currentBet * 7)) {
        this.bigPrizeAwarded = true;
      }
      
      // Variar el máximo de victorias consecutivas (5 a 7 aleatoriamente)
      if (this.consecutiveWins === 1) {
        this.maxConsecutiveWins = Math.random() < 0.5 ? 5 : (Math.random() < 0.5 ? 6 : 7);
      }
    } else {
      this.consecutiveWins = 0; // Resetear contador en caso de pérdida
      this.maxConsecutiveWins = Math.random() < 0.5 ? 5 : (Math.random() < 0.5 ? 6 : 7); // Nuevo límite aleatorio
    }

    // Verificar si se alcanzó el límite de créditos
    if (this.credits >= GameConfig.limits.maxCredits) {
      this.gameBlocked = true;
    }

    this.lastResult = {
      combination,
      winnings,
      bet: this.currentBet,
      creditsAfter: this.credits,
      isWin: winnings > 0,
      isJackpot: winnings >= this.currentBet * 7,
      gameComplete: this.gameBlocked,
      consecutiveWins: this.consecutiveWins,
      bigPrizeAwarded: this.bigPrizeAwarded,
    };
    
    this.isSpinning = false;
    return this.lastResult;
  }

  /**
   * Obtiene las estadísticas actuales del juego.
   * 
   * @returns {Object} Objeto con estadísticas del jugador
   * @property {number} credits - Créditos actuales
   * @property {number} currentBet - Apuesta actual
   * @property {number} totalSpins - Total de giros realizados
   * @property {number} totalWins - Total de victorias
   * @property {string} winRate - Porcentaje de victorias (con 1 decimal)
   */
  getStats() {
    return {
      credits: this.credits,
      currentBet: this.currentBet,
      totalSpins: this.totalSpins,
      totalWins: this.totalWins,
      spinsRemaining: this.spinsRemaining,
      maxSpins: this.maxSpins,
      sessionActive: this.sessionActive,
      gameOver: this.gameOver,
      winRate:
        this.totalSpins > 0
          ? ((this.totalWins / this.totalSpins) * 100).toFixed(1)
          : 0,
    };
  }
}

// ==========================================
// INTERFAZ DE USUARIO (PRESENTACIÓN)
// ==========================================

/**
 * Clase responsable de manejar toda la interfaz de usuario del juego.
 * Gestiona la actualización visual, animaciones y efectos especiales.
 * 
 * @class SlotUI
 */
class SlotUI {
  /**
   * Constructor de la interfaz de usuario.
   * Obtiene referencias a todos los elementos DOM necesarios.
   */
  constructor() {
    /** @type {Object} Referencias a elementos DOM del juego */
    this.elements = {
      credits: document.getElementById("credits"),
      bet: document.getElementById("bet"),
      spinButton: document.getElementById("spin-button"),
      betDecrease: document.getElementById("bet-decrease"),
      betIncrease: document.getElementById("bet-increase"),
      message: document.getElementById("game-message"),
      messagePanel: document.getElementById("message-panel"),
      reels: [
        document.getElementById("reel-0"),
        document.getElementById("reel-1"),
        document.getElementById("reel-2"),
      ],
    };
    this.spinTimeout = null;
    this.countdownInterval = null;
    this.createSpinsCounter();
    this.createProgressIndicator();
    this.createGameOverModal();
  }

  createSpinsCounter() {
    const infoPanel = document.querySelector('.info-panel');
    const spinsDisplay = document.createElement('div');
    spinsDisplay.className = 'spins-display';
    spinsDisplay.innerHTML = `
      <span class="label">Tiradas:</span>
      <span class="spins-counter" id="spins-counter">0/0</span>
    `;
    infoPanel.appendChild(spinsDisplay);
    this.elements.spinsCounter = document.getElementById('spins-counter');
  }

  createProgressIndicator() {
    const controlPanel = document.querySelector('.control-panel');
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" id="progress-fill"></div>
      </div>
    `;
    controlPanel.insertBefore(progressContainer, controlPanel.firstChild);
    this.elements.progressFill = document.getElementById('progress-fill');
  }

  createGameOverModal() {
    const modal = document.createElement('div');
    modal.className = 'game-over-modal';
    modal.id = 'game-over-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>🎰 ¡Juego Terminado!</h2>
        </div>
        <div class="modal-body">
          <div class="final-credits">
            <span class="label">Créditos finales:</span>
            <span class="credits-value" id="final-credits">0</span>
          </div>
          <div class="session-stats">
            <div class="stat">
              <span class="stat-label">Tiradas totales:</span>
              <span class="stat-value" id="total-spins-stat">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">Victorias:</span>
              <span class="stat-value" id="total-wins-stat">0</span>
            </div>
          </div>
          <div class="redirect-info">
            <p id="redirect-message">Redirigiendo al inicio en <span id="countdown">5</span> segundos...</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--primary" id="manual-redirect">Ir al Inicio Ahora</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.elements.gameOverModal = modal;
    this.elements.finalCredits = document.getElementById('final-credits');
    this.elements.totalSpinsStat = document.getElementById('total-spins-stat');
    this.elements.totalWinsStat = document.getElementById('total-wins-stat');
    this.elements.countdown = document.getElementById('countdown');
    this.elements.manualRedirect = document.getElementById('manual-redirect');
  }

  updateCredits(credits) {
    // Los créditos ya están limitados internamente a 100k, no necesitamos Math.min
    this.elements.credits.textContent = credits;
    
    if (credits <= 0) {
      this.elements.credits.style.color = "#e74c3c";
    } else if (credits < 40000) {
      this.elements.credits.style.color = "#f39c12";
    } else {
      this.elements.credits.style.color = "#ffd700";
    }
  }

  updateBet(bet) {
    this.elements.bet.textContent = bet.toLocaleString();
  }

  updateReelSymbol(reelIndex, symbol) {
    const reel = this.elements.reels[reelIndex];
    const symbolContainer = reel.querySelector(".reel-symbols");
    if (symbolContainer) {
      symbolContainer.innerHTML = `<div class="symbol">${symbol}</div>`;
    }
  }

  startSpinAnimation() {
    this.elements.reels.forEach((reel) => {
      reel.classList.add("spinning");
    });
    this.elements.spinButton.querySelector(".spin-text").textContent =
      "GIRANDO...";
    this.elements.spinButton.disabled = true;
  }

  stopSpinAnimation(combination) {
    this.elements.reels.forEach((reel, index) => {
      setTimeout(() => {
        reel.classList.remove("spinning");
        this.updateReelSymbol(index, combination[index]);
      }, index * 300); // Stagger the stop
    });

    setTimeout(() => {
      this.elements.spinButton.querySelector(".spin-text").textContent = "GIRAR";
      // Re-enable spin button after animation
      this.elements.spinButton.disabled = false;
    }, GameConfig.game.spinDuration);
  }

  showMessage(text, type = "default") {
    this.elements.message.textContent = text;
    this.elements.message.className = `message ${type}`;
    setTimeout(() => {
      this.elements.message.className = "message";
    }, 3000);
  }

  updateBetButtons(currentBet, credits) {
    this.elements.betDecrease.disabled = currentBet <= GameConfig.game.minBet;
    this.elements.betIncrease.disabled =
      currentBet >= GameConfig.game.maxBet || currentBet >= credits;
  }

  updateSpinButton(canSpin) {
    this.elements.spinButton.disabled = !canSpin;
  }

  updateSpinsCounter(remaining, total) {
    this.elements.spinsCounter.textContent = `${total - remaining}/${total}`;
    
    // Aplicar estilo de advertencia si quedan pocas tiradas
    if (remaining <= 1) {
      this.elements.spinsCounter.classList.add('warning');
    } else {
      this.elements.spinsCounter.classList.remove('warning');
    }
  }

  updateProgressIndicator(remaining, total) {
    const progress = ((total - remaining) / total) * 100;
    this.elements.progressFill.style.width = `${progress}%`;
    
    // Cambiar color según el progreso
    if (progress >= 80) {
      this.elements.progressFill.style.backgroundColor = '#e74c3c';
    } else if (progress >= 60) {
      this.elements.progressFill.style.backgroundColor = '#f39c12';
    } else {
      this.elements.progressFill.style.backgroundColor = '#2ecc71';
    }
  }

  showGameOverModal(stats, onRedirect) {
    this.elements.finalCredits.textContent = stats.credits.toLocaleString();
    this.elements.totalSpinsStat.textContent = stats.totalSpins;
    this.elements.totalWinsStat.textContent = stats.totalWins;
    
    this.elements.gameOverModal.classList.add('active');
    
    // Iniciar countdown
    let seconds = GameConfig.controlSettings.redirectDelay / 1000;
    this.elements.countdown.textContent = seconds;
    
    this.countdownInterval = setInterval(() => {
      seconds--;
      this.elements.countdown.textContent = seconds;
      
      if (seconds <= 0) {
        clearInterval(this.countdownInterval);
        onRedirect();
      }
    }, 1000);
    
    // Manejar click en botón manual
    this.elements.manualRedirect.onclick = () => {
      clearInterval(this.countdownInterval);
      onRedirect();
    };
  }

  hideGameOverModal() {
    this.elements.gameOverModal.classList.remove('active');
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  showWinEffect() {
    const slotMachine = document.querySelector(".slot-machine");
    slotMachine.classList.add("winning");
    setTimeout(() => {
      slotMachine.classList.remove("winning");
    }, 3000);
  }

  showGameCompleteModal() {
    // Crear el modal
    const modal = document.createElement("div");
    modal.className = "game-complete-modal";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>🎉 ¡FELICITACIONES! 🎉</h2>
        </div>
        <div class="modal-body">
          <p>Has alcanzado <strong>100,000 pesos</strong></p>
          <p>¡Eres un maestro del casino!</p>
          <div class="trophy">🏆</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--primary restart-btn">Jugar de Nuevo</button>
        </div>
      </div>
    `;

    // Agregar al DOM
    document.body.appendChild(modal);

    // Agregar evento al botón
    const restartBtn = modal.querySelector(".restart-btn");
    restartBtn.addEventListener("click", () => {
      location.reload(); // Recargar la página
    });

    // Mostrar modal con animación
    setTimeout(() => {
      modal.classList.add("show");
    }, 100);
  }
}

// ==========================================
// CONTROLADOR PRINCIPAL (ORQUESTADOR)
// ==========================================
class GameController {
  constructor() {
    this.engine = new SlotEngine();
    this.ui = new SlotUI();
    this.initializeEventListeners();
    this.updateUI();
  }

  initializeEventListeners() {
    this.ui.elements.spinButton.addEventListener("click", () => {
      this.handleSpin();
    });
    this.ui.elements.betDecrease.addEventListener("click", () => {
      this.handleBetChange(-1);
    });
    this.ui.elements.betIncrease.addEventListener("click", () => {
      this.handleBetChange(1);
    });
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && !this.engine.isSpinning) {
        e.preventDefault();
        this.handleSpin();
      }
    });
  }

  handleSpin() {
    if (
      this.engine.isSpinning ||
      this.engine.gameBlocked ||
      !this.engine.isValidBet(this.engine.currentBet)
    ) {
      if (this.engine.credits < this.engine.currentBet) {
        this.ui.showMessage(GameConfig.messages.insufficientFunds, "lose");
      } else if (!this.engine.sessionActive) {
        this.ui.showMessage("Sesión terminada", "lose");
      }
      return;
    }
    
    this.ui.startSpinAnimation();
    const result = this.engine.executeSpin();
    
    if (result) {
      setTimeout(() => {
        this.processSpinResult(result);
      }, GameConfig.game.spinDuration + 500);
      this.ui.stopSpinAnimation(result.combination);
    }
  }

  processSpinResult(result) {
    this.updateUI();
    
    // Verificar si el juego se completó (llegó a 100k) - MODAL INMEDIATO
    if (result.gameComplete) {
      this.ui.showGameCompleteModal();
      return;
    }

    if (result.isWin) {
      const message = result.isJackpot
        ? GameConfig.messages.jackpot.replace("${amount}", result.winnings)
        : GameConfig.messages.win.replace("${amount}", result.winnings);
      this.ui.showMessage(message, "win");
      this.ui.showWinEffect();
    } else {
      message = GameConfig.messages.lose;
    }
    
    this.ui.showMessage(message, messageType);
    
    // Verificar si el juego ha terminado
    if (result.gameOver) {
      setTimeout(() => {
        this.handleGameOver();
      }, 2000);
    } else if (this.engine.credits <= 0) {
      setTimeout(() => {
        this.ui.showMessage(GameConfig.messages.noCredits, "lose");
      }, 2000);
    }
  }

  handleBetChange(change) {
    if (this.engine.isSpinning) return;
    const newBet = this.engine.currentBet + (change * 1000);
    if (this.engine.setBet(newBet)) {
      this.updateUI();
    }
  }

  updateUI() {
    const stats = this.engine.getStats();
    this.ui.updateCredits(stats.credits);
    this.ui.updateBet(stats.currentBet);
    this.ui.updateBetButtons(stats.currentBet, stats.credits);
    this.ui.updateSpinButton(
      stats.credits >= stats.currentBet && !this.engine.isSpinning && !this.engine.gameBlocked,
    );
    
    // Deshabilitar botones de apuesta si el juego está bloqueado
    if (this.engine.gameBlocked) {
      this.ui.elements.betDecrease.disabled = true;
      this.ui.elements.betIncrease.disabled = true;
    }
  }
}

// ==========================================
// INICIALIZACIÓN DEL JUEGO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const game = new GameController();
  game.ui.showMessage(GameConfig.messages.welcome);
  window.SlotGame = game;
});
