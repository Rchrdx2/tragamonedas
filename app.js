// ==========================================
// CONFIGURACIÓN CENTRALIZADA
// ==========================================
const GameConfig = {
  symbols: ["🍒", "🔔", "🍋", "⭐", "💎"],
  payouts: {
    // Premios principales (tres iguales)
    "🍒": 2,
    "🔔": 3,
    "🍋": 4,
    "⭐": 7,
    "💎": 10,
    // Premios intermedios (dos iguales)
    "🍒🍒": 1.2,
    "🔔🔔": 1.5,
    "🍋🍋": 2,
    "⭐⭐": 3,
    "💎💎": 5,
  },
  probabilities: {
    "🍒": 0.40,
    "🔔": 0.30,
    "🍋": 0.20,
    "⭐": 0.08,
    "💎": 0.02,
  },
  game: {
    initialCredits: 50000,
    minBet: 1000,
    maxBet: 5000,
    defaultBet: 1000,
    reels: 3,
    spinDuration: 2000,
  },
  messages: {
    welcome: "¡Buena suerte!",
    win: "¡Ganaste ${amount} pesos!",
    lose: "¡Inténtalo de nuevo!",
    jackpot: "¡JACKPOT! ¡Ganaste ${amount} pesos!",
    noCredits: "Te quedaste sin créditos. ¡Reinicia el juego!",
    insufficientFunds: "Créditos insuficientes para esta apuesta",
  },
};

// ==========================================
// MOTOR DEL JUEGO (LÓGICA PURA)
// ==========================================
class SlotEngine {
  constructor() {
    this.credits = GameConfig.game.initialCredits;
    this.currentBet = GameConfig.game.defaultBet;
    this.isSpinning = false;
    this.lastResult = null;
    this.totalWins = 0;
    this.totalSpins = 0;
  }

  // Probabilidades dinámicas amortiguadas según saldo
  getDynamicProbabilities() {
    const base = { ...GameConfig.probabilities };
    let factor = 1;

    // Menos de 40000 pesos: imposible perder
    if (this.credits < 40000) {
      return {
        "🍒": 0.35,
        "🔔": 0.30,
        "🍋": 0.20,
        "⭐": 0.10,
        "💎": 0.05,
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

  // Genera símbolos para cada carrete, con lógica especial para saldo < 40000
  spinReels() {
    if (this.credits < 40000) {
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

  isValidBet(betAmount) {
    return (
      betAmount >= GameConfig.game.minBet &&
      betAmount <= GameConfig.game.maxBet &&
      betAmount <= this.credits
    );
  }

  setBet(betAmount) {
    if (this.isValidBet(betAmount)) {
      this.currentBet = betAmount;
      return true;
    }
    return false;
  }

  executeSpin() {
    if (this.isSpinning || !this.isValidBet(this.currentBet)) {
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
    }
    this.lastResult = {
      combination,
      winnings,
      bet: this.currentBet,
      creditsAfter: this.credits,
      isWin: winnings > 0,
      isJackpot: winnings >= this.currentBet * 7,
    };
    this.isSpinning = false;
    return this.lastResult;
  }

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
class SlotUI {
  constructor() {
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
      stats.credits >= stats.currentBet && !this.engine.isSpinning,
    );
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
