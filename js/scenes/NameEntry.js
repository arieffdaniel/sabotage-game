import GameManager from "../managers/GameManager.js";
import Player from "../models/Player.js";

export default class NameEntry extends Phaser.Scene {
  constructor() {
    super("NameEntry");
    this.playerNames = [];
    this.currentInputIndex = 0;
    this.isTransitioning = false;
    this.particles = [];
    this.inputFields = [];
    this.currentInput = "";
    this.isInputActive = false;
    this.isMobile = false;
  }

  preload() {
    this.load.image("bg", "assets/images/background.png");
    this.load.audio("type", "assets/sound/type.mp3");
    this.load.audio("confirm", "assets/sound/confirm.mp3");
    this.load.audio("navigate", "assets/sound/navigate.mp3");

    this.load.on("fileerror", (key) => {
      console.warn(`Failed to load asset: ${key}`);
    });
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // Detect if mobile device
    this.detectMobile();

    // Initialize player names
    this.initializePlayerNames();
    this.createAnimatedBackground();

    // Background
    this.add
      .image(centerX, centerY, "bg")
      .setOrigin(0.5)
      .setDisplaySize(width, height)
      .setAlpha(0.5);

    this.createGradientOverlay();

    // Create UI elements
    this.createTitle(centerX);
    this.createInputFields(centerX, centerY);
    this.createActionButtons(centerX, height);
    this.createInstructions(centerX, height);
    this.createFooter(centerX, height);

    // Setup controls
    this.setupKeyboardControls();
    this.setupInputSystem();

    // Play entrance animation
    this.playEntranceAnimation();

    // Focus first input
    this.selectInput(0);
  }

  detectMobile() {
    // Check for mobile device
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    console.log("Device type:", this.isMobile ? "Mobile" : "Desktop");
  }

  initializePlayerNames() {
    this.playerNames = [];
    for (let i = 0; i < GameManager.playerCount; i++) {
      this.playerNames.push(`Player ${i + 1}`);
    }
  }

  createAnimatedBackground() {
    const { width, height } = this.cameras.main;

    // Create floating particles
    for (let i = 0; i < 12; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        height + 50,
        Phaser.Math.Between(2, 6),
        0x6644ff,
        0.6
      );

      this.particles.push(particle);

      // Floating animation
      this.tweens.add({
        targets: particle,
        y: -50,
        x: particle.x + Phaser.Math.Between(-100, 100),
        duration: Phaser.Math.Between(8000, 15000),
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  createGradientOverlay() {
    const { width, height } = this.cameras.main;

    const gradientSteps = 6;
    for (let i = 0; i < gradientSteps; i++) {
      const alpha = (1 - i / gradientSteps) * 0.25;
      const rect = this.add.rectangle(
        width * 0.5,
        (height / gradientSteps) * i,
        width,
        height / gradientSteps,
        0x001144,
        alpha
      );
    }
  }

  createTitle(centerX) {
    // Title with glow effect
    const titleShadow = this.add
      .text(centerX + 3, 63, "👥 ENTER PLAYER NAMES", {
        fontFamily: "Arial Black",
        fontSize: "32px",
        color: "#000000",
        alpha: 0.5,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const title = this.add
      .text(centerX, 60, "👥 ENTER PLAYER NAMES", {
        fontFamily: "Arial Black",
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#6644ff",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Subtitle
    const subtitle = this.add
      .text(
        centerX,
        100,
        `Setting up ${GameManager.playerCount} players for the game`,
        {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#cccccc",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    // Store references
    this.titleElements = { title, titleShadow, subtitle };

    // Pulsing animation
    this.tweens.add({
      targets: [title, titleShadow],
      scale: 1.02,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  createInputFields(centerX, centerY) {
    const startY = 160;
    const maxItemsPerColumn = 5;
    const spacing = 80;
    const columnWidth = 400;

    // Calculate layout
    const totalPlayers = GameManager.playerCount;
    const columns = Math.ceil(totalPlayers / maxItemsPerColumn);
    const leftColumnX = columns === 1 ? centerX : centerX - columnWidth / 2;
    const rightColumnX = centerX + columnWidth / 2;

    this.inputFields = [];

    for (let i = 0; i < totalPlayers; i++) {
      const column = Math.floor(i / maxItemsPerColumn);
      const row = i % maxItemsPerColumn;

      const x = column === 0 ? leftColumnX : rightColumnX;
      const y = startY + row * spacing;

      const inputField = this.createInputField(x, y, i, this.playerNames[i]);
      this.inputFields.push(inputField);
    }
  }

  createInputField(x, y, index, defaultName) {
    // Input container
    const container = this.add.container(x, y);

    // Background
    const bg = this.add
      .rectangle(0, 0, 350, 60, 0x334455, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x6644ff, 0.6)
      .setInteractive({ useHandCursor: true });

    // Player number label
    const label = this.add
      .text(-160, 0, `${index + 1}.`, {
        fontFamily: "Arial Bold",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Name text
    const nameText = this.add
      .text(0, 0, defaultName, {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Cursor (blinking line)
    const cursor = this.add
      .rectangle(nameText.x + nameText.displayWidth / 2 + 5, 0, 2, 30, 0xffffff)
      .setOrigin(0.5)
      .setVisible(false);

    // Blinking cursor animation
    const cursorTween = this.tweens.add({
      targets: cursor,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1,
      paused: true,
    });

    // Add to container
    container.add([bg, label, nameText, cursor]);
    container.setAlpha(0);

    // Input interaction - works for both mobile and desktop
    bg.on("pointerdown", () => {
      this.selectInput(index);

      // For mobile, show native input dialog
      if (this.isMobile) {
        this.showMobileInput(index);
      }
    });

    // Hover effects for desktop
    if (!this.isMobile) {
      bg.on("pointerover", () => {
        if (index !== this.currentInputIndex) {
          bg.setStrokeStyle(2, 0x8866ff, 0.8);
        }
      });

      bg.on("pointerout", () => {
        if (index !== this.currentInputIndex) {
          bg.setStrokeStyle(2, 0x6644ff, 0.6);
        }
      });
    }

    // Store references
    return {
      container,
      bg,
      label,
      nameText,
      cursor,
      cursorTween,
      index,
      isActive: false,
    };
  }

  showMobileInput(index) {
    // Use native prompt for mobile input
    const currentName = this.playerNames[index];
    const newName = prompt(`Enter name for Player ${index + 1}:`, currentName);

    if (newName !== null) {
      // Update the name if user didn't cancel
      const trimmedName = newName.trim();
      this.playerNames[index] = trimmedName || `Player ${index + 1}`;

      // Update display
      const field = this.inputFields[index];
      field.nameText.setText(this.playerNames[index]);

      this.playTypeSound();
    }
  }

  selectInput(index) {
    if (this.isTransitioning) return;

    // Deactivate current input
    if (this.inputFields[this.currentInputIndex]) {
      const currentField = this.inputFields[this.currentInputIndex];
      currentField.bg.setStrokeStyle(2, 0x6644ff, 0.6);
      currentField.cursor.setVisible(false);
      currentField.cursorTween.pause();
      currentField.isActive = false;
    }

    // Activate new input
    this.currentInputIndex = index;
    this.currentInput = this.playerNames[index];

    const newField = this.inputFields[index];
    newField.bg.setStrokeStyle(3, 0xffff44, 1);

    // Only show cursor for desktop
    if (!this.isMobile) {
      newField.cursor.setVisible(true);
      newField.cursorTween.resume();
      this.isInputActive = true;
    }

    newField.isActive = true;

    this.updateCursorPosition();
    this.playNavigateSound();
  }

  updateCursorPosition() {
    const field = this.inputFields[this.currentInputIndex];
    const textWidth = field.nameText.displayWidth;
    field.cursor.x = textWidth / 2 + 5;
  }

  updateInputText() {
    const field = this.inputFields[this.currentInputIndex];
    const displayText =
      this.currentInput || `Player ${this.currentInputIndex + 1}`;
    field.nameText.setText(displayText);
    this.playerNames[this.currentInputIndex] = displayText;
    this.updateCursorPosition();
  }

  setupInputSystem() {
    // Desktop keyboard input
    if (!this.isMobile) {
      this.input.keyboard.on("keydown", (event) => {
        if (!this.isInputActive || this.isTransitioning) return;

        const key = event.key;

        if (key === "Backspace") {
          this.currentInput = this.currentInput.slice(0, -1);
          this.updateInputText();
          this.playTypeSound();
        } else if (key === "Enter") {
          this.navigateToNextInput();
        } else if (key === "Tab") {
          event.preventDefault();
          this.navigateToNextInput();
        } else if (key.length === 1 && this.currentInput.length < 15) {
          // Only allow printable characters and limit length
          if (/^[a-zA-Z0-9\s\-_.]$/.test(key)) {
            this.currentInput += key;
            this.updateInputText();
            this.playTypeSound();
          }
        }
      });
    }
  }

  navigateToNextInput() {
    const nextIndex = (this.currentInputIndex + 1) % this.inputFields.length;
    this.selectInput(nextIndex);
  }

  createActionButtons(centerX, height) {
    const buttonY = height - 160;

    // Continue button
    const continueBg = this.add
      .rectangle(centerX - 120, buttonY, 200, 70, 0x4488ff, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xffffff, 0.8)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    const continueText = this.add
      .text(centerX - 120, buttonY, "▶️ START GAME", {
        fontFamily: "Arial Black",
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Back button
    const backBg = this.add
      .rectangle(centerX + 120, buttonY, 180, 70, 0x666666, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xffffff, 0.8)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    const backText = this.add
      .text(centerX + 120, buttonY, "◀️ BACK", {
        fontFamily: "Arial Black",
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Button interactions
    continueBg.on("pointerover", () => continueBg.setFillStyle(0x6699ff));
    continueBg.on("pointerout", () => continueBg.setFillStyle(0x4488ff));
    continueBg.on("pointerdown", () => this.continueToGame());

    backBg.on("pointerover", () => backBg.setFillStyle(0x888888));
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

  createInstructions(centerX, height) {
    const instructionText = this.isMobile
      ? "Tap input fields to edit names • Default names will be used if empty"
      : "Click fields to edit • Tab/Enter to move • Arrow keys to navigate • Default names used if empty";

    const instructions = this.add
      .text(centerX, height - 100, instructionText, {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#888888",
        align: "center",
        wordWrap: { width: 600 },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.instructionsElement = instructions;
  }

  createFooter(centerX, height) {
    const credits = this.add
      .text(centerX, height - 40, "© 2025 Arieff Daniel", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#666666",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.footerElement = credits;
  }

  setupKeyboardControls() {
    const cursors = this.input.keyboard.createCursorKeys();
    const keys = this.input.keyboard.addKeys("ENTER,ESC,TAB");

    // Navigation when not typing (desktop only)
    if (!this.isMobile) {
      cursors.up.on("down", () => {
        if (!this.isInputActive) {
          const newIndex = Math.max(0, this.currentInputIndex - 1);
          this.selectInput(newIndex);
        }
      });

      cursors.down.on("down", () => {
        if (!this.isInputActive) {
          const newIndex = Math.min(
            this.inputFields.length - 1,
            this.currentInputIndex + 1
          );
          this.selectInput(newIndex);
        }
      });
    }

    keys.ESC.on("down", () => this.goBack());
    keys.ENTER.on("down", () => {
      if (!this.isInputActive) {
        this.continueToGame();
      }
    });
  }

  continueToGame() {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.isInputActive = false;

    // Create player list
    GameManager.playerList = [];
    this.playerNames.forEach((name, index) => {
      const playerName = name.trim() || `Player ${index + 1}`;
      GameManager.playerList.push(new Player(playerName));
    });

    this.playConfirmSound();
    this.transitionToScene("RoleReveal");
  }

  goBack() {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.isInputActive = false;
    this.transitionToScene("PlayerSetup");
  }

  transitionToScene(sceneName) {
    // Fade out all elements
    const allElements = [
      ...Object.values(this.titleElements),
      ...Object.values(this.actionButtons),
      this.instructionsElement,
      this.footerElement,
    ];

    // Add input fields to fade out
    this.inputFields.forEach((field) => {
      allElements.push(field.container);
    });

    this.tweens.add({
      targets: allElements,
      alpha: 0,
      y: "+=30",
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
        this.scene.start(sceneName);
      },
    });
  }

  playEntranceAnimation() {
    // Title animation
    this.tweens.add({
      targets: Object.values(this.titleElements),
      alpha: 1,
      y: "-=20",
      duration: 800,
      delay: 200,
      ease: "Back.easeOut",
    });

    // Stagger input field animations
    this.inputFields.forEach((field, index) => {
      this.tweens.add({
        targets: field.container,
        alpha: 1,
        x: field.container.x,
        duration: 600,
        delay: 400 + index * 100,
        ease: "Back.easeOut",
      });
    });

    // Action buttons animation
    this.tweens.add({
      targets: Object.values(this.actionButtons),
      alpha: 1,
      y: "-=20",
      duration: 500,
      delay: 800 + this.inputFields.length * 100,
      ease: "Back.easeOut",
    });

    // Instructions and footer
    this.tweens.add({
      targets: [this.instructionsElement, this.footerElement],
      alpha: 1,
      duration: 400,
      delay: 1200 + this.inputFields.length * 100,
      ease: "Power2",
    });
  }

  // Sound Effects
  playTypeSound() {
    if (this.sound.get("type")) {
      this.sound.play("type", { volume: 0.2 });
    }
  }

  playNavigateSound() {
    if (this.sound.get("navigate")) {
      this.sound.play("navigate", { volume: 0.3 });
    }
  }

  playConfirmSound() {
    if (this.sound.get("confirm")) {
      this.sound.play("confirm", { volume: 0.5 });
    }
  }

  shutdown() {
    this.isInputActive = false;
    this.particles = [];
    this.inputFields = [];
  }

  destroy() {
    this.isInputActive = false;
    this.particles = [];
    this.inputFields = [];
    super.destroy();
  }
}
