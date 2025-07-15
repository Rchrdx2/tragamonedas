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
   */
  probabilities: {
    "🍒": 0.40,  // 40% - Muy común
    "🔔": 0.30,  // 30% - Común
    "🍋": 0.20,  // 20% - Medio
    "⭐": 0.08,  // 8% - Raro
    "💎": 0.02,  // 2% - Muy raro
  },
  
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
    
    /** @type {number} Límite máximo de victorias consecutivas (4-5) */
    this.maxConsecutiveWins = 4;
  }

  /**
   * Calcula las probabilidades dinámicas de aparición de símbolos
   * basadas en el estado actual del juego (saldo, victorias consecutivas).
   * 
   * Implementa tres sistemas de balance:
   * 1. Protección de saldo bajo (< 40,000 pesos)
   * 2. Control de victorias consecutivas (límite 4-5)
   * 3. Escalado de dificultad para saldos altos (> 97,000 pesos)
   * 
   * @returns {Object} Objeto con probabilidades normalizadas por símbolo
   */
  getDynamicProbabilities() {
    const base = { ...GameConfig.probabilities };
    let factor = 1;

    // Menos de 40000 pesos: imposible perder (excepto si ya ha ganado demasiado seguido)
    if (this.credits < 40000 && this.consecutiveWins < this.maxConsecutiveWins) {
      return {
        "🍒": 0.35,
        "🔔": 0.30,
        "🍋": 0.20,
        "⭐": 0.10,
        "💎": 0.05,
      };
    }

    // Control de victorias consecutivas: después de 4-5 victorias seguidas, forzar pérdida
    if (this.consecutiveWins >= this.maxConsecutiveWins) {
      // Probabilidades muy bajas para ganar - casi garantizada pérdida
      return {
        "🍒": 0.12,
        "🔔": 0.12,
        "🍋": 0.12,
        "⭐": 0.08,
        "💎": 0.04,
      };
    }

    // Transición amortiguada para saldos altos (> 97,000 pesos)
    if (this.credits > 97000) {
      // Disminuye gradualmente la probabilidad de ganar cuanto más alto es el saldo (>97,000)
      // Factor va de 1 (en 97,000 pesos) a 0.3 (en 120,000+ pesos)
      factor = 1 - ((this.credits - 97000) / 23000) * 0.7;
      if (factor < 0.3) factor = 0.3; // Mínimo factor
      for (let sym in base) base[sym] *= factor;
      // Aumenta la probabilidad de perder (no todos iguales)
      base["🍒"] += (1 - factor) * 0.25;
    }
    // Normalizar para que sumen 1
    const total = Object.values(base).reduce((a, b) => a + b, 0);
    for (let key in base) base[key] /= total;
    return base;
  }

  /**
   * Genera la combinación de símbolos para los carretes del juego.
   * Implementa lógica especial para diferentes estados del juego:
   * - Control de victorias consecutivas
   * - Protección de saldo bajo
   * - Generación normal basada en probabilidades
   * 
   * @returns {string[]} Array de 3 símbolos para los carretes
   */
  spinReels() {
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
      return this.currentBet * multiplier;
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
      this.totalWins++;
      this.consecutiveWins++; // Incrementar victorias consecutivas
      
      // Variar el máximo de victorias consecutivas (4 o 5 aleatoriamente)
      if (this.consecutiveWins === 1) {
        this.maxConsecutiveWins = Math.random() < 0.5 ? 4 : 5;
      }
    } else {
      this.consecutiveWins = 0; // Resetear contador en caso de pérdida
      this.maxConsecutiveWins = Math.random() < 0.5 ? 4 : 5; // Nuevo límite aleatorio
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
  }

  updateCredits(credits) {
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
    this.elements.bet.textContent = bet;
  }

  updateReelSymbol(reelIndex, symbol) {
    const reel = this.elements.reels[reelIndex];
    const symbolElement = reel.querySelector(".symbol");
    symbolElement.textContent = symbol;
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
    setTimeout(() => {
      this.elements.reels.forEach((reel, index) => {
        reel.classList.remove("spinning");
        this.updateReelSymbol(index, combination[index]);
      });
    }, GameConfig.game.spinDuration);
    setTimeout(() => {
      this.elements.spinButton.querySelector(".spin-text").textContent =
        "GIRAR";
      this.elements.spinButton.disabled = false;
    }, GameConfig.game.spinDuration + 500);
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
    
    // Verificar si el juego se completó (llegó a 100k)
    if (result.gameComplete) {
      setTimeout(() => {
        this.ui.showGameCompleteModal();
      }, 1000);
      return;
    }

    if (result.isWin) {
      const message = result.isJackpot
        ? GameConfig.messages.jackpot.replace("${amount}", result.winnings)
        : GameConfig.messages.win.replace("${amount}", result.winnings);
      this.ui.showMessage(message, "win");
      this.ui.showWinEffect();
    } else {
      this.ui.showMessage(GameConfig.messages.lose, "lose");
    }
    if (this.engine.credits <= 0) {
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
