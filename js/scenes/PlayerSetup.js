import GameManager from "../managers/GameManager.js";

export default class PlayerSetup extends Phaser.Scene {
  constructor() {
    super("PlayerSetup");
    this.selectedCount = 5; // Default value
    this.isTransitioning = false;
    this.particles = [];
  }

  preload() {
    this.load.image("bg", "assets/images/background.png");

    // Optional sound effects
    this.load.audio("hover", "assets/sound/hover.mp3");
    this.load.audio("click", "assets/sound/click.mp3");
    this.load.audio("confirm", "assets/sound/confirm.mp3");

    // Error handling
    this.load.on("fileerror", (key) => {
      console.warn(`Failed to load asset: ${key}`);
    });
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // 🧼 Cleanup old inputs
    this.cleanupInputs();

    // ✨ Create animated background
    this.createAnimatedBackground();

    // 🎨 Background image with overlay
    this.add
      .image(centerX, centerY, "bg")
      .setOrigin(0.5)
      .setDisplaySize(width, height)
      .setAlpha(0.5);

    // Gradient overlay
    this.createGradientOverlay();

    // 🎬 Create UI elements with entrance animations
    this.createTitle(centerX, centerY);
    this.createPlayerCountSelector(centerX, centerY);
    this.createActionButtons(centerX, centerY);
    this.createFooter(centerX, height);

    // ⌨️ Setup keyboard controls
    this.setupKeyboardControls();

    // 🎭 Play entrance animation
    this.playEntranceAnimation();
  }

  createAnimatedBackground() {
    const { width, height } = this.cameras.main;

    // Create floating particles
    for (let i = 0; i < 15; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        height + 50,
        Phaser.Math.Between(3, 8),
        0x4488ff,
        0.4
      );

      this.particles.push(particle);

      // Floating animation
      this.tweens.add({
        targets: particle,
        y: -50,
        x: particle.x + Phaser.Math.Between(-150, 150),
        duration: Phaser.Math.Between(10000, 20000),
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  createGradientOverlay() {
    const { width, height } = this.cameras.main;

    // Create subtle gradient effect
    const gradientSteps = 8;
    for (let i = 0; i < gradientSteps; i++) {
      const alpha = (1 - i / gradientSteps) * 0.2;
      const rect = this.add.rectangle(
        width * 0.5,
        (height / gradientSteps) * i,
        width,
        height / gradientSteps,
        0x001122,
        alpha
      );
    }
  }

  createTitle(centerX, centerY) {
    // Main title with glow effect
    const titleShadow = this.add
      .text(centerX + 3, centerY - 247, "🎮 PLAYER SETUP", {
        fontFamily: "Arial Black",
        fontSize: "36px",
        color: "#000000",
        alpha: 0.5,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const title = this.add
      .text(centerX, centerY - 250, "🎮 PLAYER SETUP", {
        fontFamily: "Arial Black",
        fontSize: "36px",
        color: "#ffffff",
        stroke: "#4488ff",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Subtitle
    const subtitle = this.add
      .text(
        centerX,
        centerY - 200,
        "Choose the number of players for your game",
        {
          fontFamily: "Arial",
          fontSize: "20px",
          color: "#cccccc",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    // Store references
    this.titleElements = { title, titleShadow, subtitle };

    // Pulsing animation for title
    this.tweens.add({
      targets: [title, titleShadow],
      scale: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  createPlayerCountSelector(centerX, centerY) {
    // Selector container
    const selectorBg = this.add
      .rectangle(centerX, centerY - 50, 500, 120, 0x223344, 0.8)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0x4488ff, 0.8)
      .setAlpha(0);

    // Current count display
    const countBg = this.add
      .circle(centerX, centerY - 50, 50, 0x4488ff, 0.9)
      .setStrokeStyle(4, 0xffffff, 1)
      .setAlpha(0);

    this.countText = this.add
      .text(centerX, centerY - 50, this.selectedCount.toString(), {
        fontFamily: "Arial Black",
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Minus button
    const minusBtn = this.add
      .rectangle(centerX - 150, centerY - 50, 80, 80, 0xff4444, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xffffff, 0.8)
      .setInteractive({ useHandCursor: true })
      .setAlpha(1);

    this.add
      .text(centerX - 150, centerY - 50, "−", {
        fontFamily: "Arial Black",
        fontSize: "40px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(1);

    // Plus button
    const plusBtn = this.add
      .rectangle(centerX + 150, centerY - 50, 80, 80, 0x44ff44, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xffffff, 0.8)
      .setInteractive({ useHandCursor: true })
      .setAlpha(1);

    this.add
      .text(centerX + 150, centerY - 50, "+", {
        fontFamily: "Arial Black",
        fontSize: "36px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(1);

    // Labels
    this.add
      .text(centerX, centerY + 30, "Players (5 - 10)", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Button interactions
    minusBtn.on("pointerover", () => {
      minusBtn.setFillStyle(0xff6666);
      this.playHoverSound();
    });
    minusBtn.on("pointerout", () => minusBtn.setFillStyle(0xff4444));
    minusBtn.on("pointerdown", () => this.changePlayerCount(-1));

    plusBtn.on("pointerover", () => {
      plusBtn.setFillStyle(0x66ff66);
      this.playHoverSound();
    });
    plusBtn.on("pointerout", () => plusBtn.setFillStyle(0x44ff44));
    plusBtn.on("pointerdown", () => this.changePlayerCount(1));

    // Store references
    this.selectorElements = {
      selectorBg,
      countBg,
      minusBtn,
      plusBtn,
      minusText: minusBtn,
      plusText: plusBtn,
    };

    // Pulsing animation for count display
    this.tweens.add({
      targets: countBg,
      scale: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  createActionButtons(centerX, centerY) {
    const buttonY = centerY + 120;

    // Continue button
    const continueBg = this.add
      .rectangle(centerX - 100, buttonY, 160, 70, 0x4488ff, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xffffff, 0.8)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    const continueText = this.add
      .text(centerX - 100, buttonY, "▶️ CONTINUE", {
        fontFamily: "Arial Black",
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Back button
    const backBg = this.add
      .rectangle(centerX + 100, buttonY, 160, 70, 0x666666, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xffffff, 0.8)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    const backText = this.add
      .text(centerX + 100, buttonY, "◀️ BACK", {
        fontFamily: "Arial Black",
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Button interactions
    continueBg.on("pointerover", () => {
      continueBg.setFillStyle(0x6699ff);
      this.playHoverSound();
    });
    continueBg.on("pointerout", () => continueBg.setFillStyle(0x4488ff));
    continueBg.on("pointerdown", () => this.continueToNext());

    backBg.on("pointerover", () => {
      backBg.setFillStyle(0x888888);
      this.playHoverSound();
    });
    backBg.on("pointerout", () => backBg.setFillStyle(0x666666));
    backBg.on("pointerdown", () => this.goBack());

    // Store references
    this.actionButtons = {
      continueBg,
      continueText,
      backBg,
      backText,
    };
  }

  createFooter(centerX, height) {
    // Instructions
    const instructions = this.add
      .text(
        centerX,
        height - 100,
        "Use +/- buttons or arrow keys to adjust • Enter to continue",
        {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#888888",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    // Credits
    const credits = this.add
      .text(centerX, height - 40, "© 2025 Arieff Daniel", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#666666",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.footerElements = { instructions, credits };
  }

  changePlayerCount(delta) {
    if (this.isTransitioning) return;

    const newCount = this.selectedCount + delta;
    if (newCount >= 5 && newCount <= 10) {
      this.selectedCount = newCount;
      this.updateCountDisplay();
      this.playClickSound();
    } else {
      // Visual feedback for invalid selection
      this.showInvalidFeedback();
    }
  }

  updateCountDisplay() {
    // Animate the count change
    this.tweens.add({
      targets: this.countText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: true,
      onComplete: () => {
        this.countText.setText(this.selectedCount.toString());
      },
    });

    // Color feedback
    const color =
      this.selectedCount === 5
        ? 0xff8844
        : this.selectedCount === 10
        ? 0xff4444
        : 0x4488ff;

    this.tweens.add({
      targets: this.selectorElements.countBg,
      fillColor: { from: 0x4488ff, to: color },
      duration: 300,
      yoyo: true,
    });
  }

  showInvalidFeedback() {
    // Shake animation for invalid input
    this.tweens.add({
      targets: this.selectorElements.selectorBg,
      x: this.selectorElements.selectorBg.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 3,
    });

    // Flash red
    this.tweens.add({
      targets: this.selectorElements.countBg,
      fillColor: { from: 0x4488ff, to: 0xff4444 },
      duration: 200,
      yoyo: true,
    });
  }

  continueToNext() {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    GameManager.playerCount = this.selectedCount;

    this.playConfirmSound();
    this.transitionToScene("NameEntry");
  }

  goBack() {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.transitionToScene("MainMenu");
  }

  transitionToScene(sceneName) {
    // Button press animation
    this.tweens.add({
      targets: this.actionButtons.continueBg,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 100,
    });

    // Fade out animation
    const allElements = [
      ...Object.values(this.titleElements),
      ...Object.values(this.selectorElements),
      ...Object.values(this.actionButtons),
      ...Object.values(this.footerElements),
      this.countText,
    ];

    this.tweens.add({
      targets: allElements,
      alpha: 0,
      y: "+=50",
      duration: 500,
      ease: "Back.easeIn",
    });

    // Screen transition
    const overlay = this.add.rectangle(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.5,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0
    );

    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 600,
      onComplete: () => {
        this.cleanupInputs();
        this.scene.start(sceneName);
      },
    });
  }

  setupKeyboardControls() {
    const cursors = this.input.keyboard.createCursorKeys();
    const keys = this.input.keyboard.addKeys("ENTER,ESC,SPACE");

    // Arrow key navigation
    cursors.left.on("down", () => this.changePlayerCount(-1));
    cursors.right.on("down", () => this.changePlayerCount(1));
    cursors.up.on("down", () => this.changePlayerCount(1));
    cursors.down.on("down", () => this.changePlayerCount(-1));

    // Action keys
    keys.ENTER.on("down", () => this.continueToNext());
    keys.SPACE.on("down", () => this.continueToNext());
    keys.ESC.on("down", () => this.goBack());
  }

  playEntranceAnimation() {
    // Staggered entrance animation
    const titleElements = Object.values(this.titleElements);
    const selectorElements = Object.values(this.selectorElements);
    const actionElements = Object.values(this.actionButtons);
    const footerElements = Object.values(this.footerElements);

    // Title animation
    this.tweens.add({
      targets: titleElements,
      alpha: 1,
      y: "-=20",
      duration: 800,
      delay: 200,
      ease: "Back.easeOut",
    });

    // Selector animation
    this.tweens.add({
      targets: [...selectorElements, this.countText],
      alpha: 1,
      scale: 1,
      duration: 600,
      delay: 600,
      ease: "Back.easeOut",
    });

    // Action buttons animation
    this.tweens.add({
      targets: actionElements,
      alpha: 1,
      y: "-=30",
      duration: 500,
      delay: 1000,
      ease: "Back.easeOut",
    });

    // Footer animation
    this.tweens.add({
      targets: footerElements,
      alpha: 1,
      duration: 400,
      delay: 1200,
      ease: "Power2",
    });
  }

  // Sound Effects
  playHoverSound() {
    if (this.sound.get("hover")) {
      this.sound.play("hover", { volume: 0.3 });
    }
  }

  playClickSound() {
    if (this.sound.get("click")) {
      this.sound.play("click", { volume: 0.4 });
    }
  }

  playConfirmSound() {
    if (this.sound.get("confirm")) {
      this.sound.play("confirm", { volume: 0.5 });
    }
  }

  cleanupInputs() {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => input.remove());
  }

  shutdown() {
    this.cleanupInputs();
    this.particles = [];
  }

  destroy() {
    this.cleanupInputs();
    this.particles = [];
    super.destroy();
  }
}
