export default class HowToPlay extends Phaser.Scene {
  constructor() {
    super("HowToPlay");
    this.scrollY = 0;
    this.maxScroll = 0;
    this.scrollSpeed = 20;
  }

  preload() {
    this.load.image("bg", "assets/images/background.png");
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background with darker overlay for better readability
    this.add
      .image(width / 2, height / 2, "bg")
      .setDisplaySize(width, height)
      .setAlpha(0.3);

    // Dark overlay for text readability
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4);

    // Main title
    this.add
      .text(width / 2, 80, "📖 HOW TO PLAY SABOTAGE!", {
        fontSize: "36px",
        fontFamily: "Arial Black",
        color: "#ffffff",
        stroke: "#4444ff",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Create scrollable content container
    this.contentContainer = this.add.container(0, 0);
    this.createScrollableContent(width);

    // Navigation buttons
    this.createNavigationButtons(width, height);

    // Scroll instructions
    this.add
      .text(
        width / 2,
        height - 160,
        "Scroll up/down or use arrow keys to read more",
        {
          fontSize: "16px",
          fontFamily: "Arial",
          color: "#888888",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Setup controls
    this.setupControls();

    // Calculate max scroll
    this.calculateMaxScroll(height);
  }

  createScrollableContent(width) {
    let yPos = 140;
    const leftMargin = 60;
    const rightMargin = 60;
    const contentWidth = width - leftMargin - rightMargin;

    // Game Overview Section
    const overviewText = this.add
      .text(width / 2, yPos, "🎯 GAME OVERVIEW", {
        fontSize: "28px",
        fontFamily: "Arial Black",
        color: "#ffcc00",
        align: "center",
      })
      .setOrigin(0.5);
    this.contentContainer.add(overviewText);
    yPos += 50;

    const overviewContent = `SABOTAGE! is a social deduction game where players work together to complete missions while hidden saboteurs try to destroy everything from within. Use logic, deduction, and teamwork to identify the traitors before it's too late!`;

    const overviewDesc = this.add
      .text(width / 2, yPos, overviewContent, {
        fontSize: "18px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: contentWidth },
      })
      .setOrigin(0.5, 0);
    this.contentContainer.add(overviewDesc);
    yPos += overviewDesc.height + 40;

    // Objectives Section
    const objectiveTitle = this.add
      .text(width / 2, yPos, "🏆 OBJECTIVES", {
        fontSize: "28px",
        fontFamily: "Arial Black",
        color: "#44ff44",
        align: "center",
      })
      .setOrigin(0.5);
    this.contentContainer.add(objectiveTitle);
    yPos += 50;

    const objectives = [
      "👥 GOOD TEAM: Find and eliminate all Saboteurs through voting",
      "💀 SABOTEURS: Survive until you equal or outnumber the good players",
      "🧠 EVERYONE: Use deduction, discussion, and strategy to achieve your goal",
    ];

    objectives.forEach((objective) => {
      const objText = this.add
        .text(leftMargin, yPos, objective, {
          fontSize: "18px",
          fontFamily: "Arial",
          color: "#ffffff",
          wordWrap: { width: contentWidth },
        })
        .setOrigin(0, 0);
      this.contentContainer.add(objText);
      yPos += objText.height + 15;
    });

    yPos += 30;

    // Roles Section
    const rolesTitle = this.add
      .text(width / 2, yPos, "🎭 PLAYER ROLES", {
        fontSize: "28px",
        fontFamily: "Arial Black",
        color: "#ff6644",
        align: "center",
      })
      .setOrigin(0.5);
    this.contentContainer.add(rolesTitle);
    yPos += 50;

    const roles = [
      {
        name: "💀 SABOTEUR",
        team: "(Evil Team)",
        description:
          "Eliminates one player each night. Must remain hidden during day discussions. Wins by surviving until saboteurs equal or outnumber good players.",
      },
      {
        name: "🛡️ MEDIC",
        team: "(Good Team)",
        description:
          "Can protect one player from elimination each night. Choose wisely - you cannot protect the same person twice in a row!",
      },
      {
        name: "🔍 INVESTIGATOR",
        team: "(Good Team)",
        description:
          "Can investigate one player each night to learn if they are a Saboteur. Share information carefully to avoid being targeted.",
      },
      {
        name: "📚 PROFESSOR",
        team: "(Good Team)",
        description:
          "Has special knowledge and knows the identity of the Innovator. Can provide guidance and strategic thinking.",
      },
      {
        name: "🔧 INNOVATOR",
        team: "(Good Team)",
        description:
          "Starts good but can be converted to evil if the Saboteur is eliminated in rounds 2 or 4. A powerful wildcard role!",
      },
      {
        name: "🎓 STEM STUDENT",
        team: "(Good Team)",
        description:
          "No special abilities, but every vote counts! Use observation, logic, and discussion to identify suspicious behavior.",
      },
    ];

    roles.forEach((role) => {
      const roleHeader = this.add
        .text(leftMargin, yPos, `${role.name} ${role.team}`, {
          fontSize: "20px",
          fontFamily: "Arial Bold",
          color: "#ffcc00",
        })
        .setOrigin(0, 0);
      this.contentContainer.add(roleHeader);
      yPos += 30;

      const roleDesc = this.add
        .text(leftMargin + 20, yPos, role.description, {
          fontSize: "16px",
          fontFamily: "Arial",
          color: "#cccccc",
          wordWrap: { width: contentWidth - 20 },
        })
        .setOrigin(0, 0);
      this.contentContainer.add(roleDesc);
      yPos += roleDesc.height + 25;
    });

    // Game Flow Section
    const flowTitle = this.add
      .text(width / 2, yPos, "⏰ GAME FLOW", {
        fontSize: "28px",
        fontFamily: "Arial Black",
        color: "#6644ff",
        align: "center",
      })
      .setOrigin(0.5);
    this.contentContainer.add(flowTitle);
    yPos += 50;

    const gameFlow = [
      {
        phase: "🌙 NIGHT PHASE",
        description:
          "Special roles act in secret. Pass the device to each player with a night action. Saboteurs eliminate, Medics protect, Investigators investigate.",
      },
      {
        phase: "🌅 MORNING RESULTS",
        description:
          "Discover what happened during the night. If someone was eliminated, they are removed from the game.",
      },
      {
        phase: "☀️ DAY PHASE",
        description:
          "All living players discuss what happened and vote to eliminate someone they suspect is a Saboteur. Majority vote wins.",
      },
      {
        phase: "🔄 REPEAT",
        description:
          "Continue alternating between night and day phases until one team achieves their victory condition.",
      },
    ];

    gameFlow.forEach((phase) => {
      const phaseHeader = this.add
        .text(leftMargin, yPos, phase.phase, {
          fontSize: "20px",
          fontFamily: "Arial Bold",
          color: "#ffcc00",
        })
        .setOrigin(0, 0);
      this.contentContainer.add(phaseHeader);
      yPos += 30;

      const phaseDesc = this.add
        .text(leftMargin + 20, yPos, phase.description, {
          fontSize: "16px",
          fontFamily: "Arial",
          color: "#cccccc",
          wordWrap: { width: contentWidth - 20 },
        })
        .setOrigin(0, 0);
      this.contentContainer.add(phaseDesc);
      yPos += phaseDesc.height + 25;
    });

    // Strategy Tips Section
    const tipsTitle = this.add
      .text(width / 2, yPos, "💡 STRATEGY TIPS", {
        fontSize: "28px",
        fontFamily: "Arial Black",
        color: "#ff8844",
        align: "center",
      })
      .setOrigin(0.5);
    this.contentContainer.add(tipsTitle);
    yPos += 50;

    const tips = [
      "🗣️ COMMUNICATE: Share information, but be careful about revealing your role too early",
      "👀 OBSERVE: Watch how players vote and behave - saboteurs often try to blend in",
      "🤝 BUILD TRUST: Work with confirmed good players to eliminate threats",
      "🎭 BLUFF CAREFULLY: Sometimes misdirection can help, but don't overdo it",
      "⏰ TIMING MATTERS: Save special abilities for crucial moments",
      "🧠 THINK LOGICALLY: Use deductive reasoning to narrow down suspects",
    ];

    tips.forEach((tip) => {
      const tipText = this.add
        .text(leftMargin, yPos, tip, {
          fontSize: "16px",
          fontFamily: "Arial",
          color: "#ffffff",
          wordWrap: { width: contentWidth },
        })
        .setOrigin(0, 0);
      this.contentContainer.add(tipText);
      yPos += tipText.height + 15;
    });

    yPos += 30;

    // Win Conditions Section
    const winTitle = this.add
      .text(width / 2, yPos, "🏁 WIN CONDITIONS", {
        fontSize: "28px",
        fontFamily: "Arial Black",
        color: "#44ff88",
        align: "center",
      })
      .setOrigin(0.5);
    this.contentContainer.add(winTitle);
    yPos += 50;

    const winConditions = [
      "✅ GOOD TEAM WINS: All Saboteurs are eliminated through voting",
      "💀 SABOTEURS WIN: Saboteurs equal or outnumber good players",
      "🔧 CONVERTED WIN: If Innovator becomes evil and helps saboteurs win",
    ];

    winConditions.forEach((condition) => {
      const condText = this.add
        .text(leftMargin, yPos, condition, {
          fontSize: "18px",
          fontFamily: "Arial",
          color: "#ffffff",
          wordWrap: { width: contentWidth },
        })
        .setOrigin(0, 0);
      this.contentContainer.add(condText);
      yPos += condText.height + 15;
    });

    yPos += 50; // Extra space at bottom
  }

  createNavigationButtons(width, height) {
    // Back button
    const backBtn = this.add
      .text(width / 2, height - 100, "⬅️ BACK TO MENU", {
        fontSize: "28px",
        fontFamily: "Arial Black",
        color: "#ffffff",
        backgroundColor: "#4444ff",
        padding: { x: 30, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Button effects
    backBtn.on("pointerover", () => {
      backBtn.setStyle({ backgroundColor: "#6666ff" });
      this.tweens.add({
        targets: backBtn,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    backBtn.on("pointerout", () => {
      backBtn.setStyle({ backgroundColor: "#4444ff" });
      this.tweens.add({
        targets: backBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    backBtn.on("pointerdown", () => {
      this.tweens.add({
        targets: backBtn,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: () => {
          this.scene.start("MainMenu");
        },
      });
    });
  }

  setupControls() {
    // Keyboard controls
    const cursors = this.input.keyboard.createCursorKeys();
    const keys = this.input.keyboard.addKeys("ESC,SPACE");

    cursors.up.on("down", () => this.scroll(-this.scrollSpeed));
    cursors.down.on("down", () => this.scroll(this.scrollSpeed));
    keys.ESC.on("down", () => this.scene.start("MainMenu"));

    // Mouse wheel support
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
      this.scroll(deltaY * 0.5);
    });

    // Touch/swipe support for mobile
    let startY = 0;
    let currentY = 0;

    this.input.on("pointerdown", (pointer) => {
      startY = pointer.y;
      currentY = pointer.y;
    });

    this.input.on("pointermove", (pointer) => {
      if (pointer.isDown) {
        const deltaY = currentY - pointer.y;
        currentY = pointer.y;
        this.scroll(deltaY * 2);
      }
    });
  }

  scroll(deltaY) {
    this.scrollY += deltaY;
    this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScroll);
    this.contentContainer.y = -this.scrollY;
  }

  calculateMaxScroll(screenHeight) {
    // Calculate total content height
    let maxY = 0;
    this.contentContainer.list.forEach((child) => {
      const childBottom = child.y + (child.height || 0);
      if (childBottom > maxY) {
        maxY = childBottom;
      }
    });

    // Set max scroll to allow scrolling to see all content
    this.maxScroll = Math.max(0, maxY - screenHeight + 200);
  }
}
