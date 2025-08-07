import GameManager from "../managers/GameManager.js";

export default class GameOver extends Phaser.Scene {
  constructor() {
    super("GameOver");
    this.confettiParticles = [];
    this.gameStats = {};
  }

  preload() {
    this.load.image("bg", "assets/images/background.png");

    // Optional: Load celebration effects
    // this.load.image("confetti", "assets/images/confetti.png");
    // this.load.audio("victory_sound", "assets/audio/victory.mp3");
    // this.load.audio("defeat_sound", "assets/audio/defeat.mp3");
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
    // 🖼️ Background with dynamic opacity based on win/loss
    const bgAlpha = this.gameStats.saboteursAlive > 0 ? 0.2 : 0.4;
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "bg")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setAlpha(bgAlpha);

    // Add subtle overlay for better text readability
    this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.3
    );
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
  }

  displayResults() {
    // 🏆 Game Over Header
    const headerText = this.saboteursWon
      ? "💀 SABOTEURS WIN!"
      : "🎉 INNOCENTS WIN!";
    this.add
      .text(this.scale.width / 2, 150, headerText, {
        fontSize: "42px",
        fontFamily: "Poppins",
        color: this.themeColor,
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // 📝 Win message with better formatting
    const message = GameManager.winMessage || "The game has ended";
    this.add
      .text(this.scale.width / 2, 220, message, {
        fontSize: "28px",
        fontFamily: "Poppins",
        color: "#ffffff",
        wordWrap: { width: 600 },
        align: "center",
      })
      .setOrigin(0.5);

    // 📊 Game Statistics
    this.displayGameStats();

    // 👥 Player Summary
    this.displayPlayerSummary();
  }

  displayGameStats() {
    const statsText =
      `📊 GAME STATISTICS\n\n` +
      `🎲 Rounds Played: ${this.gameStats.roundsPlayed}\n` +
      `👥 Total Players: ${this.gameStats.totalPlayers}\n` +
      `💚 Survivors: ${this.gameStats.alivePlayers}\n` +
      `💀 Eliminated: ${this.gameStats.deadPlayers}`;

    this.add
      .text(this.scale.width / 4, 350, statsText, {
        fontSize: "20px",
        fontFamily: "Poppins",
        color: this.secondaryColor,
        align: "left",
      })
      .setOrigin(0.5, 0);
  }

  displayPlayerSummary() {
    let summaryText = "👑 FINAL STANDINGS\n\n";

    // Group players by status
    const survivors = GameManager.playerList.filter((p) => p.isAlive);
    const eliminated = GameManager.playerList.filter((p) => !p.isAlive);

    // Show survivors first
    if (survivors.length > 0) {
      summaryText += "✅ SURVIVORS:\n";
      survivors.forEach((player) => {
        const roleEmoji = this.getRoleEmoji(player.role);
        summaryText += `${roleEmoji} ${player.name} (${player.role})\n`;
      });
      summaryText += "\n";
    }

    // Show eliminated players
    if (eliminated.length > 0) {
      summaryText += "❌ ELIMINATED:\n";
      eliminated.forEach((player) => {
        const roleEmoji = this.getRoleEmoji(player.role);
        summaryText += `${roleEmoji} ${player.name} (${player.role})\n`;
      });
    }

    this.add
      .text((3 * this.scale.width) / 4, 350, summaryText, {
        fontSize: "18px",
        fontFamily: "Poppins",
        color: "#cccccc",
        align: "left",
        wordWrap: { width: 280 },
      })
      .setOrigin(0.5, 0);
  }

  getRoleEmoji(role) {
    const emojis = {
      Saboteur: "💀",
      Medic: "🛡️",
      Professor: "📚",
      Innovator: "🔧",
      Investigator: "🔍",
      Student: "🎓",
    };
    return emojis[role] || "👤";
  }

  createButtons() {
    const buttonY = this.scale.height - 150;
    const buttonSpacing = 200;
    const centerX = this.scale.width / 2;

    // 🔁 Play Again button
    const playAgainBtn = this.add
      .text(centerX - buttonSpacing / 2, buttonY, "🔁 Play Again", {
        fontSize: "28px",
        fontFamily: "Poppins",
        color: "#ffffff",
        backgroundColor: this.themeColor,
        padding: { x: 25, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.setupButtonEffects(playAgainBtn, this.themeColor, "#666666");

    playAgainBtn.on("pointerdown", () => {
      this.restartGame();
    });

    // 🏠 Main Menu button
    const mainMenuBtn = this.add
      .text(centerX + buttonSpacing / 2, buttonY, "🏠 Main Menu", {
        fontSize: "28px",
        fontFamily: "Poppins",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 25, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.setupButtonEffects(mainMenuBtn, "#333333", "#666666");

    mainMenuBtn.on("pointerdown", () => {
      this.resetGameState();
      this.scene.start("MainMenu");
    });

    // 📊 View Details button (optional toggle)
    const detailsBtn = this.add
      .text(centerX, buttonY + 60, "📈 Toggle Details", {
        fontSize: "20px",
        fontFamily: "Poppins",
        color: "#888888",
        backgroundColor: "#222222",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.setupButtonEffects(detailsBtn, "#222222", "#444444");

    let detailsVisible = true;
    detailsBtn.on("pointerdown", () => {
      detailsVisible = !detailsVisible;
      // Toggle visibility of stats and player summary
      // (You could implement this to show/hide additional details)
      detailsBtn.setText(
        detailsVisible ? "📈 Hide Details" : "📈 Show Details"
      );
    });
  }

  setupButtonEffects(button, normalColor, hoverColor) {
    button.on("pointerover", () => {
      button.setStyle({ backgroundColor: hoverColor });
      this.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    button.on("pointerout", () => {
      button.setStyle({ backgroundColor: normalColor });
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    button.on("pointerdown", () => {
      this.tweens.add({
        targets: button,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        ease: "Power2",
      });
    });
  }

  addCelebrationEffects() {
    if (!this.saboteursWon) {
      // Add celebration effects for innocent victory
      this.createConfettiEffect();

      // Optional: Play victory sound
      // if (this.sound.get("victory_sound")) {
      //   this.sound.play("victory_sound", { volume: 0.5 });
      // }
    } else {
      // Add darker effects for saboteur victory
      this.createSpookyEffect();

      // Optional: Play defeat sound
      // if (this.sound.get("defeat_sound")) {
      //   this.sound.play("defeat_sound", { volume: 0.3 });
      // }
    }
  }

  createConfettiEffect() {
    // Simple confetti-like particle effect
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(-100, 0);
      const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b];
      const color = Phaser.Utils.Array.GetRandom(colors);

      const particle = this.add.rectangle(x, y, 8, 8, color);

      this.tweens.add({
        targets: particle,
        y: this.scale.height + 100,
        x: x + Phaser.Math.Between(-100, 100),
        rotation: Phaser.Math.Between(0, 6.28),
        duration: Phaser.Math.Between(2000, 4000),
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });
    }
  }

  createSpookyEffect() {
    // Subtle pulsing dark overlay for saboteur victory
    const overlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.1
    );

    this.tweens.add({
      targets: overlay,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  restartGame() {
    // Quick restart with same player setup
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

  resetGameState() {
    // 🧹 Complete reset of game state
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
