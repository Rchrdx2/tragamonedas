// ==========================================
// CONFIGURACIÓN CENTRALIZADA
// ==========================================
const GameConfig = {
  symbols: ["🍒", "🔔", "🍋", "⭐", "💎"],
  payouts: {
    "🍒": 2,
    "🔔": 3,
    "🍋": 4,
    "⭐": 7,
    "💎": 10,
  },
  probabilities: {
    "🍒": 0.35,
    "🔔": 0.25,
    "🍋": 0.2,
    "⭐": 0.15,
    "💎": 0.05,
  },
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
    targetFinalCredits: 40,
    allowedRange: [15, 38],
    redirectDelay: 5000
  },
  game: {
    initialCredits: 20,
    minBet: 2,
    maxBet: 5,
    defaultBet: 2,
    reels: 3,
    spinDuration: 2000,
  },
  messages: {
    welcome: "¡Buena suerte!",
    win: "¡Ganaste {amount} créditos!",
    lose: "¡Inténtalo de nuevo!",
    jackpot: "¡JACKPOT! ¡Ganaste {amount} créditos!",
    twoMatch: "¡Dos iguales! +{amount} créditos",
    special: "¡Combinación especial! +{amount} créditos",
    noCredits: "Te quedaste sin créditos.",
    insufficientFunds: "Créditos insuficientes para esta apuesta",
    spinsRemaining: "Tiradas restantes: {remaining}/{total}",
    gameOver: "¡Juego terminado! Final: {credits} créditos",
    redirecting: "Redirigiendo al inicio en {seconds} segundos...",
    sessionEnded: "Sesión terminada. Has usado todas tus tiradas.",
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
    
    // Sistema de control de sesión
    this.maxSpins = this.generateRandomSpins();
    this.spinsRemaining = this.maxSpins;
    this.sessionActive = true;
    this.gameOver = false;
  }

  generateRandomSpins() {
    const min = GameConfig.controlSettings.minSpins;
    const max = GameConfig.controlSettings.maxSpins;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  calculateTargetResult(spinsRemaining, currentCredits, targetCredits) {
    const creditsAfterBet = currentCredits - this.currentBet;
    const creditsNeeded = targetCredits - creditsAfterBet;
    
    // Si es la última tirada, forzar resultado para llegar a $40
    if (spinsRemaining === 1) {
      return this.forceExactResult(GameConfig.controlSettings.targetFinalCredits - creditsAfterBet);
    }
    
    // Si necesita ajuste fino, usar combinaciones intermedias
    if (Math.abs(creditsNeeded) <= this.currentBet * 3) {
      return this.generateIntermediateResult(creditsNeeded);
    }
    
    // Si necesita cambio mayor, usar combinaciones completas
    return this.generateMajorResult(creditsNeeded);
  }

  forceExactResult(neededCredits) {
    if (neededCredits <= 0) {
      return { type: 'lose', combination: this.generateLosingCombination() };
    }

    const neededMultiplier = neededCredits / this.currentBet;
    
    // Buscar combinación completa
    for (const [symbol, multiplier] of Object.entries(GameConfig.payouts)) {
      if (Math.abs(multiplier - neededMultiplier) < 0.1) {
        return { type: 'win', combination: [symbol, symbol, symbol], payout: multiplier };
      }
    }
    
    // Buscar combinación de dos iguales
    for (const [symbol, multiplier] of Object.entries(GameConfig.twoMatchPayouts)) {
      if (Math.abs(multiplier - neededMultiplier) < 0.1) {
        return { type: 'twoMatch', combination: this.generateTwoMatchCombination(symbol), payout: multiplier };
      }
    }
    
    // Usar el más cercano disponible
    const bestSymbol = Object.entries(GameConfig.payouts)
      .reduce((best, [symbol, mult]) => 
        Math.abs(mult - neededMultiplier) < Math.abs(best.mult - neededMultiplier) 
          ? { symbol, mult } : best, 
        { symbol: "🍒", mult: GameConfig.payouts["🍒"] });
    
    return { type: 'win', combination: [bestSymbol.symbol, bestSymbol.symbol, bestSymbol.symbol], payout: bestSymbol.mult };
  }

  generateIntermediateResult(creditsNeeded) {
    const neededMultiplier = Math.abs(creditsNeeded) / this.currentBet;
    
    if (creditsNeeded > 0) {
      // Necesita ganar
      for (const [symbol, multiplier] of Object.entries(GameConfig.twoMatchPayouts)) {
        if (multiplier >= neededMultiplier * 0.8 && multiplier <= neededMultiplier * 1.2) {
          return { type: 'twoMatch', combination: this.generateTwoMatchCombination(symbol), payout: multiplier };
        }
      }
      
      // Usar combinación especial si es apropiada
      for (const [combo, multiplier] of Object.entries(GameConfig.specialCombinations)) {
        if (multiplier >= neededMultiplier * 0.8 && multiplier <= neededMultiplier * 1.2) {
          return { type: 'special', combination: combo.split(''), payout: multiplier };
        }
      }
    }
    
    return { type: 'lose', combination: this.generateLosingCombination() };
  }

  generateMajorResult(creditsNeeded) {
    const [minRange, maxRange] = GameConfig.controlSettings.allowedRange;
    const currentAfterBet = this.credits - this.currentBet;
    
    if (currentAfterBet < minRange) {
      // Necesita ganar significativamente
      const symbols = Object.keys(GameConfig.payouts);
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      return { type: 'win', combination: [randomSymbol, randomSymbol, randomSymbol], payout: GameConfig.payouts[randomSymbol] };
    } else if (currentAfterBet > maxRange) {
      // Necesita perder
      return { type: 'lose', combination: this.generateLosingCombination() };
    }
    
    // En rango normal, comportamiento aleatorio controlado
    return Math.random() > 0.6 
      ? { type: 'twoMatch', combination: this.generateTwoMatchCombination('🍒'), payout: GameConfig.twoMatchPayouts['🍒'] }
      : { type: 'lose', combination: this.generateLosingCombination() };
  }

  generateTwoMatchCombination(symbol) {
    const symbols = GameConfig.symbols.filter(s => s !== symbol);
    const differentSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const positions = [symbol, symbol, differentSymbol];
    
    // Mezclar posiciones aleatoriamente
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    return positions;
  }

  generateLosingCombination() {
    const symbols = GameConfig.symbols;
    let combination;
    
    do {
      combination = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    } while (
      // Evitar tres iguales
      combination.every(s => s === combination[0]) ||
      // Evitar dos iguales
      this.hasTwoMatches(combination) ||
      // Evitar combinaciones especiales
      this.isSpecialCombination(combination)
    );
    
    return combination;
  }

  hasTwoMatches(combination) {
    const counts = {};
    combination.forEach(symbol => counts[symbol] = (counts[symbol] || 0) + 1);
    return Object.values(counts).some(count => count >= 2);
  }

  isSpecialCombination(combination) {
    const key = combination.join('');
    return GameConfig.specialCombinations.hasOwnProperty(key);
  }

  // Probabilidades dinámicas amortiguadas según saldo
  getDynamicProbabilities() {
    const base = { ...GameConfig.probabilities };
    let factor = 1;

    // Menos de 5 créditos: imposible perder
    if (this.credits < 5) {
      return {
        "🍒": 0.3,
        "🔔": 0.25,
        "🍋": 0.2,
        "⭐": 0.15,
        "💎": 0.1,
      };
    }

    // Transición amortiguada entre 0–15 y 40–50
    if (this.credits < 15) {
      // Aumenta gradualmente la probabilidad de ganar cuanto más bajo es el saldo (<15)
      // Factor va de 1.8 (en 0 $) a 1 (en 15 $)
      factor = 1.8 - (this.credits / 15) * 0.8;
      for (let sym in base) base[sym] *= factor;
    } else if (this.credits > 40) {
      // Disminuye gradualmente la probabilidad de ganar cuanto más alto es el saldo (>40)
      // Factor va de 1 (en 40 $) a 0.3 (en 50 $)
      factor = 1 - ((this.credits - 40) / 10) * 0.7;
      for (let sym in base) base[sym] *= factor;
      // Aumenta la probabilidad de perder (no todos iguales)
      base["🍒"] += (1 - factor) * 0.25;
    }
    // Normalizar para que sumen 1
    const total = Object.values(base).reduce((a, b) => a + b, 0);
    for (let key in base) base[key] /= total;
    return base;
  }

  // Genera símbolos para cada carrete usando el sistema de control avanzado
  // Este método ahora está obsoleto y se reemplaza por calculateTargetResult
  generateControlledReels(targetResult) {
    return targetResult.combination;
  }

  calculateWinnings(combination, resultType = null) {
    // Verificar tres iguales (combinación completa)
    const firstSymbol = combination[0];
    if (combination.every((symbol) => symbol === firstSymbol)) {
      const multiplier = GameConfig.payouts[firstSymbol];
      return { amount: this.currentBet * multiplier, type: 'win' };
    }
    
    // Verificar dos iguales
    const symbolCounts = {};
    combination.forEach(symbol => {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });
    
    for (const [symbol, count] of Object.entries(symbolCounts)) {
      if (count === 2) {
        const multiplier = GameConfig.twoMatchPayouts[symbol];
        return { amount: this.currentBet * multiplier, type: 'twoMatch' };
      }
    }
    
    // Verificar combinaciones especiales
    const combinationKey = combination.join('');
    for (const [specialCombo, multiplier] of Object.entries(GameConfig.specialCombinations)) {
      if (combinationKey === specialCombo) {
        return { amount: this.currentBet * multiplier, type: 'special' };
      }
    }
    
    return { amount: 0, type: 'lose' };
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
    if (this.isSpinning || !this.isValidBet(this.currentBet) || !this.sessionActive) {
      return null;
    }
    
    this.isSpinning = true;
    this.totalSpins++;
    this.credits -= this.currentBet;
    
    // Usar el sistema de control avanzado
    const targetResult = this.calculateTargetResult(
      this.spinsRemaining, 
      this.credits + this.currentBet, // Créditos antes de apostar
      GameConfig.controlSettings.targetFinalCredits
    );
    
    let winnings = 0;
    let resultType = 'lose';
    let combination = targetResult.combination;
    
    if (targetResult.type === 'win') {
      winnings = this.currentBet * targetResult.payout;
      resultType = 'win';
    } else if (targetResult.type === 'twoMatch') {
      winnings = this.currentBet * targetResult.payout;
      resultType = 'twoMatch';
    } else if (targetResult.type === 'special') {
      winnings = this.currentBet * targetResult.payout;
      resultType = 'special';
    }
    
    if (winnings > 0) {
      this.credits += winnings;
      this.totalWins++;
    }
    
    // Actualizar estado de sesión
    this.spinsRemaining--;
    if (this.spinsRemaining <= 0) {
      this.sessionActive = false;
      this.gameOver = true;
    }
    
    this.lastResult = {
      combination,
      winnings,
      bet: this.currentBet,
      creditsAfter: this.credits,
      isWin: winnings > 0,
      isJackpot: winnings >= this.currentBet * 7,
      resultType,
      spinsRemaining: this.spinsRemaining,
      gameOver: this.gameOver
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
    this.elements.credits.textContent = credits;
    if (credits <= 0) {
      this.elements.credits.style.color = "#e74c3c";
    } else if (credits < 10) {
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
    this.elements.finalCredits.textContent = stats.credits;
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
      !this.engine.isValidBet(this.engine.currentBet) ||
      !this.engine.sessionActive
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
    
    let message = "";
    let messageType = "lose";
    
    if (result.isWin) {
      if (result.resultType === 'twoMatch') {
        message = GameConfig.messages.twoMatch.replace("{amount}", result.winnings);
        messageType = "win";
      } else if (result.resultType === 'special') {
        message = GameConfig.messages.special.replace("{amount}", result.winnings);
        messageType = "win";
      } else if (result.isJackpot) {
        message = GameConfig.messages.jackpot.replace("{amount}", result.winnings);
        messageType = "win";
      } else {
        message = GameConfig.messages.win.replace("{amount}", result.winnings);
        messageType = "win";
      }
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
    const newBet = this.engine.currentBet + change;
    if (this.engine.setBet(newBet)) {
      this.updateUI();
    }
  }

  handleGameOver() {
    const stats = this.engine.getStats();
    const finalMessage = GameConfig.messages.gameOver.replace("{credits}", stats.credits);
    this.ui.showMessage(finalMessage, "win");
    
    // Mostrar modal después de un breve delay
    setTimeout(() => {
      this.ui.showGameOverModal(stats, () => {
        this.redirectToStart();
      });
    }, 1500);
  }

  redirectToStart() {
    // En un entorno real, esto redirigiría a otra página
    // Por ahora, reiniciamos el juego
    location.reload();
  }

  updateUI() {
    const stats = this.engine.getStats();
    this.ui.updateCredits(stats.credits);
    this.ui.updateBet(stats.currentBet);
    this.ui.updateBetButtons(stats.currentBet, stats.credits);
    this.ui.updateSpinButton(
      stats.credits >= stats.currentBet && 
      !this.engine.isSpinning && 
      stats.sessionActive
    );
    
    // Actualizar contador de tiradas y progreso
    this.ui.updateSpinsCounter(stats.spinsRemaining, stats.maxSpins);
    this.ui.updateProgressIndicator(stats.spinsRemaining, stats.maxSpins);
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
