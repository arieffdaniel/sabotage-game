import GameManager from "../managers/GameManager.js";

export default class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
    this.confettiParticles = [];
    this.gameStats = {};
  }

  preload() {
    this.load.image("bg", "assets/images/background.png");
  }

  create() {
    console.log("✅ GameOver scene loaded");

    // Calculate game statistics
    this.calculateGameStats();

    this.setupBackground();
    this.determineWinType();
    this.displayResults();
    this.createButtons();
    this.addCelebrationEffects();
  }

  calculateGameStats() {
    this.gameStats = {
      totalPlayers: GameManager.playerList.length,
      alivePlayers: GameManager.playerList.filter((p) => p.isAlive).length,
      deadPlayers: GameManager.playerList.filter((p) => !p.isAlive).length,
      roundsPlayed: GameManager.roundNumber,
      saboteursAlive: GameManager.playerList.filter(
        (p) => p.role === "Saboteur" && p.isAlive
      ).length,
      innocentsAlive: GameManager.playerList.filter(
        (p) => p.role !== "Saboteur" && p.isAlive
      ).length,
    };
  }

  setupBackground() {
    const { width, height } = this.cameras.main;

    // Background with dynamic opacity based on win/loss
    const bgAlpha = this.gameStats.saboteursAlive > 0 ? 0.2 : 0.4;
    this.add
      .image(width / 2, height / 2, "bg")
      .setDisplaySize(width, height)
      .setAlpha(bgAlpha);

    // Add dynamic gradient overlay
    this.createDynamicGradient();
  }

  createDynamicGradient() {
    const { width, height } = this.cameras.main;

    // Create animated gradient based on win/loss
    const baseColor = this.saboteursWon ? 0x440000 : 0x004400;
    const gradientSteps = 8;

    for (let i = 0; i < gradientSteps; i++) {
      const alpha = (1 - i / gradientSteps) * 0.4;
      const rect = this.add.rectangle(
        width / 2,
        (height / gradientSteps) * i,
        width,
        height / gradientSteps,
        baseColor,
        alpha
      );

      // Add subtle animation
      this.tweens.add({
        targets: rect,
        alpha: alpha * 0.5,
        duration: 3000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  determineWinType() {
    const message = GameManager.winMessage || "🏁 Game Over";

    // Determine if saboteurs won or innocents won
    this.saboteursWon =
      message.toLowerCase().includes("saboteur") &&
      !message.toLowerCase().includes("eliminated");

    // Set theme colors based on winner
    this.themeColor = this.saboteursWon ? "#ff4444" : "#44ff44";
    this.secondaryColor = this.saboteursWon ? "#ffaaaa" : "#aaffaa";
    this.accentColor = this.saboteursWon ? "#cc2222" : "#22cc22";
  }

  displayResults() {
    const { width, height } = this.cameras.main;

    // Animated header with glow effect
    this.createAnimatedHeader();

    // Main win message
    this.createWinMessage();

    // Game statistics in a beautiful card layout
    this.createStatsCard();

    // Player summary with role reveals
    this.createPlayerSummary();
  }

  createAnimatedHeader() {
    const { width } = this.cameras.main;

    // Main header
    const headerText = this.saboteursWon
      ? "💀 SABOTEURS WIN!"
      : "🎉 INNOCENTS WIN!";

    // Header shadow
    const headerShadow = this.add
      .text(width / 2 + 4, 154, headerText, {
        fontSize: "42px",
        fontFamily: "Arial Black",
        color: "#000000",
        alpha: 0.6,
      })
      .setOrigin(0.5);

    // Main header
    const header = this.add
      .text(width / 2, 150, headerText, {
        fontSize: "42px",
        fontFamily: "Arial Black",
        color: this.themeColor,
        stroke: "#ffffff",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Pulsing glow effect
    const headerGlow = this.add
      .text(width / 2, 150, headerText, {
        fontSize: "46px",
        fontFamily: "Arial Black",
        color: this.themeColor,
        alpha: 0.3,
      })
      .setOrigin(0.5);

    // Animations
    this.tweens.add({
      targets: [header, headerShadow],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: headerGlow,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  createWinMessage() {
    const { width } = this.cameras.main;

    const message = GameManager.winMessage || "The game has ended";

    // Message background
    const msgBg = this.add
      .rectangle(width / 2, 220, 620, 80, 0x000000, 0.6)
      .setStrokeStyle(2, this.themeColor, 0.8);

    // Win message text
    const winMsg = this.add
      .text(width / 2, 220, message, {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 580 },
      })
      .setOrigin(0.5);

    // Subtle glow animation
    this.tweens.add({
      targets: msgBg,
      alpha: 0.8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  createStatsCard() {
    const { width } = this.cameras.main;

    // Stats card background
    const cardBg = this.add
      .rectangle(width / 4, 400, 280, 200, 0x222222, 0.9)
      .setStrokeStyle(3, this.secondaryColor, 0.8);

    // Stats title
    const statsTitle = this.add
      .text(width / 4, 320, "📊 GAME STATISTICS", {
        fontSize: "20px",
        fontFamily: "Arial Bold",
        color: this.secondaryColor,
      })
      .setOrigin(0.5);

    // Stats content
    const statsText =
      `🎲 Rounds: ${this.gameStats.roundsPlayed}\n` +
      `👥 Players: ${this.gameStats.totalPlayers}\n` +
      `💚 Survivors: ${this.gameStats.alivePlayers}\n` +
      `💀 Eliminated: ${this.gameStats.deadPlayers}\n` +
      `⚔️ Saboteurs Left: ${this.gameStats.saboteursAlive}\n` +
      `🛡️ Innocents Left: ${this.gameStats.innocentsAlive}`;

    const stats = this.add
      .text(width / 4, 400, statsText, {
        fontSize: "16px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    // Card entrance animation
    cardBg.setScale(0);
    statsTitle.setAlpha(0);
    stats.setAlpha(0);

    this.tweens.add({
      targets: cardBg,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: "Back.easeOut",
      delay: 500,
    });

    this.tweens.add({
      targets: [statsTitle, stats],
      alpha: 1,
      duration: 400,
      delay: 800,
    });
  }

  createPlayerSummary() {
    const { width } = this.cameras.main;

    // Player summary card
    const summaryBg = this.add
      .rectangle((3 * width) / 4, 400, 280, 200, 0x222222, 0.9)
      .setStrokeStyle(3, this.secondaryColor, 0.8);

    // Summary title
    const summaryTitle = this.add
      .text((3 * width) / 4, 320, "👑 FINAL STANDINGS", {
        fontSize: "20px",
        fontFamily: "Arial Bold",
        color: this.secondaryColor,
      })
      .setOrigin(0.5);

    let summaryText = "";

    // Group players by status
    const survivors = GameManager.playerList.filter((p) => p.isAlive);
    const eliminated = GameManager.playerList.filter((p) => !p.isAlive);

    // Show survivors first with role reveals
    if (survivors.length > 0) {
      summaryText += "✅ SURVIVORS:\n";
      survivors.forEach((player) => {
        const roleEmoji = this.getRoleEmoji(player.role);
        const roleName = this.getShortRoleName(player.role);
        summaryText += `${roleEmoji} ${player.name} (${roleName})\n`;
      });
      if (eliminated.length > 0) summaryText += "\n";
    }

    // Show eliminated players
    if (eliminated.length > 0) {
      summaryText += "❌ ELIMINATED:\n";
      eliminated.forEach((player) => {
        const roleEmoji = this.getRoleEmoji(player.role);
        const roleName = this.getShortRoleName(player.role);
        summaryText += `${roleEmoji} ${player.name} (${roleName})\n`;
      });
    }

    const summary = this.add
      .text((3 * width) / 4, 400, summaryText, {
        fontSize: "14px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 260 },
      })
      .setOrigin(0.5);

    // Summary entrance animation
    summaryBg.setScale(0);
    summaryTitle.setAlpha(0);
    summary.setAlpha(0);

    this.tweens.add({
      targets: summaryBg,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: "Back.easeOut",
      delay: 700,
    });

    this.tweens.add({
      targets: [summaryTitle, summary],
      alpha: 1,
      duration: 400,
      delay: 1000,
    });
  }

  getRoleEmoji(role) {
    const emojis = {
      Saboteur: "💀",
      "Medic (Biology Major)": "🛡️",
      "Professor (STEM Teacher)": "📚",
      "Innovator (Engineer)": "🔧",
      "Investigator (Forensic Scientist)": "🔍",
      "STEM Student": "🎓",
      "Student Council President": "🎤",
    };
    return emojis[role] || "👤";
  }

  getShortRoleName(role) {
    const shortNames = {
      Saboteur: "Saboteur",
      "Medic (Biology Major)": "Medic",
      "Professor (STEM Teacher)": "Professor",
      "Innovator (Engineer)": "Innovator",
      "Investigator (Forensic Scientist)": "Investigator",
      "STEM Student": "Student",
      "Student Council President": "President",
    };
    return shortNames[role] || role;
  }

  createButtons() {
    const { width, height } = this.cameras.main;
    const buttonY = height - 120;
    const buttonSpacing = 200;
    const centerX = width / 2;

    // Play Again button
    const playAgainBtn = this.createStyledButton(
      centerX - buttonSpacing / 2,
      buttonY,
      "🔁 PLAY AGAIN",
      this.themeColor,
      () => this.restartGame()
    );

    // Main Menu button
    const mainMenuBtn = this.createStyledButton(
      centerX + buttonSpacing / 2,
      buttonY,
      "🏠 MAIN MENU",
      "#666666",
      () => this.goToMainMenu()
    );

    // Entrance animations for buttons
    [playAgainBtn, mainMenuBtn].forEach((btn, index) => {
      btn.setAlpha(0);
      btn.setY(btn.y + 50);

      this.tweens.add({
        targets: btn,
        alpha: 1,
        y: btn.y - 50,
        duration: 500,
        delay: 1200 + index * 150,
        ease: "Back.easeOut",
      });
    });
  }

  createStyledButton(x, y, text, color, onClick) {
    const button = this.add
      .text(x, y, text, {
        fontSize: "24px",
        fontFamily: "Arial Black",
        color: "#ffffff",
        backgroundColor: color,
        padding: { x: 25, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Enhanced button interactions
    button.on("pointerover", () => {
      const hoverColor = this.lightenColor(color);
      button.setStyle({ backgroundColor: hoverColor });

      this.tweens.add({
        targets: button,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        ease: "Back.easeOut",
      });
    });

    button.on("pointerout", () => {
      button.setStyle({ backgroundColor: color });

      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: "Back.easeOut",
      });
    });

    button.on("pointerdown", () => {
      this.tweens.add({
        targets: button,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        ease: "Back.easeOut",
        onComplete: onClick,
      });
    });

    return button;
  }

  lightenColor(color) {
    // Simple color lightening
    if (typeof color === "string") {
      if (color === "#666666") return "#888888";
      if (color === "#ff4444") return "#ff6666";
      if (color === "#44ff44") return "#66ff66";
    }
    return color;
  }

  addCelebrationEffects() {
    if (!this.saboteursWon) {
      // Celebration effects for innocent victory
      this.createConfettiEffect();
      this.createFireworks();
    } else {
      // Dark effects for saboteur victory
      this.createDarkEffect();
    }
  }

  createConfettiEffect() {
    const { width, height } = this.cameras.main;

    // Enhanced confetti with multiple colors and shapes
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(-150, -50);
      const colors = [
        0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b, 0x6c5ce7,
      ];
      const color = Phaser.Utils.Array.GetRandom(colors);

      const particle = this.add.rectangle(x, y, 8, 8, color);

      this.tweens.add({
        targets: particle,
        y: height + 100,
        x: x + Phaser.Math.Between(-150, 150),
        rotation: Phaser.Math.Between(0, 6.28),
        scaleX: Phaser.Math.FloatBetween(0.5, 1.5),
        scaleY: Phaser.Math.FloatBetween(0.5, 1.5),
        duration: Phaser.Math.Between(2000, 4000),
        ease: "Cubic.easeOut",
        onComplete: () => particle.destroy(),
      });
    }
  }

  createFireworks() {
    const { width, height } = this.cameras.main;

    // Create firework bursts
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 800, () => {
        const x = Phaser.Math.Between(width * 0.2, width * 0.8);
        const y = Phaser.Math.Between(height * 0.3, height * 0.6);

        this.createFireworkBurst(x, y);
      });
    }
  }

  createFireworkBurst(x, y) {
    const colors = [0xffff00, 0xff00ff, 0x00ffff, 0xff4444, 0x44ff44];
    const color = Phaser.Utils.Array.GetRandom(colors);

    // Create burst particles
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(x, y, 3, color);
      const angle = (i / 20) * Math.PI * 2;
      const speed = Phaser.Math.Between(50, 150);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 1000,
        ease: "Cubic.easeOut",
        onComplete: () => particle.destroy(),
      });
    }
  }

  createDarkEffect() {
    const { width, height } = this.cameras.main;

    // Subtle dark pulse overlay
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x330000,
      0.1
    );

    this.tweens.add({
      targets: overlay,
      alpha: 0.3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Falling dark particles
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(-100, 0);
      const particle = this.add.circle(x, y, 3, 0x660000, 0.6);

      this.tweens.add({
        targets: particle,
        y: height + 50,
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        ease: "Linear",
        onComplete: () => particle.destroy(),
      });
    }
  }

  restartGame() {
    this.resetGameState();

    // Keep player names but reset their states
    GameManager.playerList.forEach((player) => {
      player.isAlive = true;
      player.isProtected = false;
      player.role = "";
      // Keep the name
    });

    this.scene.start("RoleReveal");
  }

  goToMainMenu() {
    this.resetGameState();
    this.scene.start("MainMenu");
  }

  resetGameState() {
    // Complete reset of game state
    GameManager.playerList = [];
    GameManager.playerCount = 0;
    GameManager.roundNumber = 1;
    GameManager.saboteurCount = 1;
    GameManager.lastSabotageIndex = -1;
    GameManager.eliminatedPlayerIndex = -1;
    GameManager.innovatorConverted = false;
    GameManager.winMessage = "";

    // Reset any other game-specific properties
    if (GameManager.nightActions) {
      GameManager.nightActions = [];
    }
  }

  // Cleanup when scene ends
  destroy() {
    // Clean up any ongoing tweens or particles
    this.tweens.killAll();
    super.destroy();
  }
}
