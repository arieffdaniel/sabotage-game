import GameUtils from "../managers/GameUtils.js";

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
    this.selectedIndex = 0;
    this.menuItems = [];
  }
  preload() {
    // ✨ NEW: Add loading bar
    GameUtils.setupLoadingBar(this);

    // Your existing preloads...
    this.load.image("bg", "assets/images/background.png");
    this.load.image("titleImage", "assets/images/TItle.png");
    this.load.audio("bgm", "assets/sound/tanzil-old-school-music-339335.mp3");
    this.load.audio("startBell", "assets/sound/school-bell-310293.mp3");
  }

  create() {
    const { width, height } = this.cameras.main;

    // Your existing background setup...
    this.add
      .image(width * 0.5, height * 0.5, "bg")
      .setOrigin(0.5)
      .setDisplaySize(width, height)
      .setAlpha(0.6);

    // ✨ IMPROVED: Use GameUtils for title
    GameUtils.centerText(this, "🎮 SABOTAGE!", 200, {
      fontSize: "48px",
      color: "#ffcc00",
      stroke: "#000000",
      strokeThickness: 3,
    });

    // ✨ IMPROVED: Create menu buttons using GameUtils
    this.createMenuButtons();

    // ✨ IMPROVED: Safe audio setup
    this.setupAudio();
  }

  createMenuButtons() {
    const { width, height } = this.cameras.main;
    const startY = height * 0.5;

    const buttons = [
      {
        text: "🚀 START GAME",
        y: startY,
        color: "#4444ff",
        hoverColor: "#6666ff",
        action: () => this.startGame(),
      },
      {
        text: "📚 HOW TO PLAY",
        y: startY + 80,
        color: "#44aa44",
        hoverColor: "#66cc66",
        action: () => this.showHowToPlay(),
      },
      {
        text: "❌ EXIT",
        y: startY + 160,
        color: "#aa4444",
        hoverColor: "#cc6666",
        action: () => this.exitGame(),
      },
    ];

    buttons.forEach((config, index) => {
      const button = GameUtils.createButton(
        this,
        width * 0.5,
        config.y,
        config.text,
        config.action,
        {
          backgroundColor: config.color,
          hoverColor: config.hoverColor,
        }
      );

      this.menuItems.push(button);
    });
  }

  setupAudio() {
    // ✨ IMPROVED: Safe audio with error handling
    try {
      if (this.sound.get("bgm")) {
        this.bgm = this.sound.add("bgm", { loop: true, volume: 0 });
        this.bgm.play();

        this.tweens.add({
          targets: this.bgm,
          volume: 0.4,
          duration: 2000,
        });
      }
    } catch (e) {
      console.warn("Could not setup background music");
    }
  }

  startGame() {
    GameUtils.playSound(this, "startBell", 0.6);
    GameUtils.fadeToScene(this, "PlayerSetup");
  }

  showHowToPlay() {
    GameUtils.fadeToScene(this, "HowToPlay");
  }

  exitGame() {
    console.log("Thanks for playing!");
  }
}
