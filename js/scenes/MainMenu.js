export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
    this.particles = [];
    this.starField = [];
    this.menuItems = [];
    this.selectedIndex = 0;
    this.isTransitioning = false;
  }

  preload() {
    // 🎨 Assets
    this.load.image("bg", "assets/images/background.png");
    this.load.image("titleImage", "assets/images/Title.png");

    // 🎵 Sounds
    this.load.audio("bgm", "assets/sound/tanzil-old-school-music-339335.mp3");
    this.load.audio("startBell", "assets/sound/school-bell-310293.mp3");
    this.load.audio("hover", "assets/sound/hover.mp3"); // Optional hover sound
    this.load.audio("click", "assets/sound/click.mp3"); // Optional click sound

    // Error handling
    this.load.on("fileerror", (key) => {
      console.warn(`Failed to load asset: ${key}`);
    });
  }

  create() {
    const { width, height } = this.cameras.main;

    // ✨ Create animated background layers
    this.createAnimatedBackground();

    // 🌟 Add floating particles
    this.createParticleSystem();

    // ✅ Add main background with gradient overlay
    this.add
      .image(width * 0.5, height * 0.5, "bg")
      .setOrigin(0.5)
      .setDisplaySize(width, height)
      .setAlpha(0.6);

    // 🎨 Add gradient overlay
    this.createGradientOverlay();

    // ✅ Enhanced sound management
    this.setupAudio();

    // 🎨 Enhanced title with multiple effects
    this.createEnhancedTitle();

    // 🚀 Create menu buttons with animations
    this.createMenuButtons();

    // 📱 Add version info and credits
    this.createFooter();

    // ⌨️ Setup keyboard controls
    this.setupKeyboardControls();

    // 🎬 Entrance animation
    this.playEntranceAnimation();

    // 👆 Setup touch/mouse controls
    this.setupInputControls();
  }

  createAnimatedBackground() {
    const { width, height } = this.cameras.main;

    // Create animated star field
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.8)
      );

      this.starField.push(star);

      // Twinkling animation
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  createParticleSystem() {
    const { width, height } = this.cameras.main;

    // Create floating particles
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        height + 50,
        Phaser.Math.Between(2, 6),
        0x4444ff,
        0.3
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

    // Create gradient effect using rectangles
    const gradientSteps = 10;
    for (let i = 0; i < gradientSteps; i++) {
      const alpha = (1 - i / gradientSteps) * 0.3;
      const rect = this.add.rectangle(
        width * 0.5,
        (height / gradientSteps) * i,
        width,
        height / gradientSteps,
        0x000033,
        alpha
      );
    }
  }

  setupAudio() {
    // Stop all sounds before playing BGM
    this.sound.stopAll();

    // Setup BGM with fade in
    if (this.sound.get("bgm")) {
      this.bgm = this.sound.add("bgm", { loop: true, volume: 0 });
      this.bgm.play();

      // Fade in BGM
      this.tweens.add({
        targets: this.bgm,
        volume: 0.4,
        duration: 2000,
        ease: "Power2",
      });
    }
  }

  createEnhancedTitle() {
    const { width } = this.cameras.main;

    // Main title with glow effect
    const title = this.add
      .image(width * 0.5, 200, "titleImage")
      .setOrigin(0.5)
      .setScale(0.7)
      .setAlpha(0);

    // Title glow
    const titleGlow = this.add
      .image(width * 0.5, 200, "titleImage")
      .setOrigin(0.5)
      .setScale(0.75)
      .setAlpha(0)
      .setTint(0x4444ff);

    // Enhanced title animations
    this.tweens.add({
      targets: [title, titleGlow],
      scale: 0.8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Rotation animation
    this.tweens.add({
      targets: [title, titleGlow],
      rotation: 0.05,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Store references
    this.titleElements = { title, titleGlow };
  }

  createMenuButtons() {
    const { width, height } = this.cameras.main;
    const startY = height * 0.5;
    const spacing = 120;

    const buttonConfigs = [
      {
        label: "🚀 START ADVENTURE",
        action: () => this.startGame(),
        color: 0x4444ff,
        hoverColor: 0x6666ff,
        icon: "🚀",
      },
      {
        label: "📚 HOW TO PLAY",
        action: () => this.showHowToPlay(),
        color: 0x44aa44,
        hoverColor: 0x66cc66,
        icon: "📚",
      },
      {
        label: "⚙️ SETTINGS",
        action: () => this.showSettings(),
        color: 0xaa4444,
        hoverColor: 0xcc6666,
        icon: "⚙️",
      },
      {
        label: "❌ EXIT",
        action: () => this.exitGame(),
        color: 0x666666,
        hoverColor: 0x888888,
        icon: "❌",
      },
    ];

    buttonConfigs.forEach((config, index) => {
      const y = startY + index * spacing;
      const button = this.createEnhancedButton(
        width * 0.5,
        y,
        config.label,
        config.action,
        config.color,
        config.hoverColor,
        index
      );
      this.menuItems.push(button);
    });
  }

  createEnhancedButton(x, y, label, onClick, color, hoverColor, index) {
    // Button background with rounded corners effect
    const bg = this.add
      .rectangle(x, y, 450, 80, color, 0.8)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xffffff, 0.6)
      .setInteractive({ useHandCursor: true });

    // Button glow effect
    const glow = this.add
      .rectangle(x, y, 460, 90, color, 0.3)
      .setOrigin(0.5)
      .setVisible(false);

    // Button text with shadow
    const textShadow = this.add
      .text(x + 2, y + 2, label, {
        fontFamily: "Arial Black",
        fontSize: "24px",
        color: "#000000",
        alpha: 0.5,
      })
      .setOrigin(0.5);

    const text = this.add
      .text(x, y, label, {
        fontFamily: "Arial Black",
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Container for the button
    const container = this.add.container(0, 0, [glow, bg, textShadow, text]);
    container.setAlpha(0);

    // Pulse animation for glow
    this.tweens.add({
      targets: glow,
      scaleX: 1.1,
      scaleY: 1.1,
      alpha: 0.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Button interactions
    bg.on("pointerover", () => {
      this.selectMenuItem(index);
      this.playHoverSound();
    });

    bg.on("pointerdown", () => {
      this.activateMenuItem();
    });

    // Store references
    container.bg = bg;
    container.glow = glow;
    container.text = text;
    container.textShadow = textShadow;
    container.onClick = onClick;
    container.originalColor = color;
    container.hoverColor = hoverColor;
    container.index = index;

    return container;
  }

  selectMenuItem(index) {
    if (this.isTransitioning) return;

    this.selectedIndex = index;

    // Update all buttons
    this.menuItems.forEach((button, i) => {
      const isSelected = i === index;

      // Update colors
      button.bg.setFillStyle(
        isSelected ? button.hoverColor : button.originalColor
      );
      button.glow.setVisible(isSelected);

      // Scale animation
      this.tweens.add({
        targets: button,
        scaleX: isSelected ? 1.05 : 1,
        scaleY: isSelected ? 1.05 : 1,
        duration: 200,
        ease: "Back.easeOut",
      });

      // Text glow
      button.text.setTint(isSelected ? 0xffff00 : 0xffffff);
    });
  }

  activateMenuItem() {
    if (this.isTransitioning) return;

    this.playClickSound();
    const selectedButton = this.menuItems[this.selectedIndex];

    // Button press animation
    this.tweens.add({
      targets: selectedButton,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        selectedButton.onClick();
      },
    });
  }

  setupKeyboardControls() {
    const cursors = this.input.keyboard.createCursorKeys();
    const wasd = this.input.keyboard.addKeys("W,S,A,D,ENTER,SPACE");

    // Navigation
    cursors.up.on("down", () => this.navigateMenu(-1));
    cursors.down.on("down", () => this.navigateMenu(1));
    wasd.W.on("down", () => this.navigateMenu(-1));
    wasd.S.on("down", () => this.navigateMenu(1));

    // Activation
    cursors.space.on("down", () => this.activateMenuItem());
    wasd.ENTER.on("down", () => this.activateMenuItem());
    wasd.SPACE.on("down", () => this.activateMenuItem());
  }

  navigateMenu(direction) {
    if (this.isTransitioning) return;

    this.selectedIndex = Phaser.Math.Wrap(
      this.selectedIndex + direction,
      0,
      this.menuItems.length
    );

    this.selectMenuItem(this.selectedIndex);
    this.playHoverSound();
  }

  setupInputControls() {
    // Mobile/touch support
    this.input.on("pointerdown", (pointer) => {
      if (pointer.y < 300) {
        // Clicked on title - add easter egg
        this.titleEasterEgg();
      }
    });
  }

  createFooter() {
    const { width, height } = this.cameras.main;

    // Version info
    this.add
      .text(width * 0.5, height - 100, "v1.2.0", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#666666",
      })
      .setOrigin(0.5);

    // Credits with typewriter effect
    const credits = "© 2025 Arieff Daniel | Enhanced Edition";
    const creditsText = this.add
      .text(width * 0.5, height - 60, "", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#888888",
      })
      .setOrigin(0.5);

    // Typewriter animation
    let i = 0;
    const timer = this.time.addEvent({
      delay: 50,
      callback: () => {
        creditsText.text += credits[i];
        i++;
        if (i >= credits.length) {
          timer.remove();
        }
      },
      repeat: credits.length - 1,
    });
  }

  playEntranceAnimation() {
    // Fade in title elements
    this.tweens.add({
      targets: [this.titleElements.title, this.titleElements.titleGlow],
      alpha: 1,
      scale: 0.8,
      duration: 1000,
      ease: "Back.easeOut",
    });

    // Stagger menu items animation
    this.menuItems.forEach((button, index) => {
      this.tweens.add({
        targets: button,
        alpha: 1,
        x: button.x,
        duration: 600,
        delay: 200 + index * 150,
        ease: "Back.easeOut",
        onComplete: () => {
          if (index === 0) {
            this.selectMenuItem(0);
          }
        },
      });
    });

    // Screen flash effect
    const flash = this.add.rectangle(
      this.cameras.main.width * 0.5,
      this.cameras.main.height * 0.5,
      this.cameras.main.width,
      this.cameras.main.height,
      0xffffff,
      0.8
    );

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });
  }

  // Menu Actions
  startGame() {
    this.transitionToScene("PlayerSetup", () => {
      this.playStartSound();
    });
  }

  showHowToPlay() {
    this.transitionToScene("HowToPlay");
  }

  showSettings() {
    // Implement settings scene
    console.log("Settings - Coming Soon!");
  }

  exitGame() {
    // Add confirmation dialog or exit logic
    console.log("Thanks for playing!");
  }

  transitionToScene(sceneName, callback) {
    if (this.isTransitioning) return;

    this.isTransitioning = true;

    // Fade out BGM
    if (this.bgm?.isPlaying) {
      this.tweens.add({
        targets: this.bgm,
        volume: 100,
        duration: 500,
        onComplete: () => this.bgm.stop(),
      });
    }

    // Execute callback if provided
    if (callback) callback();

    // Scene transition effect
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
      duration: 500,
      onComplete: () => {
        this.scene.start(sceneName);
      },
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
      this.sound.play("click", { volume: 0.5 });
    }
  }

  playStartSound() {
    if (this.sound.get("startBell")) {
      this.sound.play("startBell", { volume: 0.6 });
    }
  }

  titleEasterEgg() {
    // Fun easter egg when clicking title
    this.tweens.add({
      targets: [this.titleElements.title, this.titleElements.titleGlow],
      rotation: Math.PI * 2,
      scale: 1.2,
      duration: 1000,
      ease: "Bounce.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: [this.titleElements.title, this.titleElements.titleGlow],
          rotation: 0,
          scale: 0.8,
          duration: 500,
          ease: "Back.easeOut",
        });
      },
    });
  }

  // Cleanup
  destroy() {
    if (this.bgm) {
      this.bgm.destroy();
    }

    // Clean up arrays
    this.particles = [];
    this.starField = [];
    this.menuItems = [];

    super.destroy();
  }
}
