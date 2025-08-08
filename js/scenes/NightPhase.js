import GameManager from "../managers/GameManager.js";

export default class NightPhase extends Phaser.Scene {
  constructor() {
    super("NightPhase");
    this.currentPlayerIndex = 0;
    this.allPlayers = []; // Now includes ALL players
    this.nightActions = [];
    this.buttons = [];
    this.currentState = "starting";
  }

  preload() {
    this.load.image("bg", "assets/images/background.png");
  }

  create() {
    if (!GameManager.playerList || GameManager.playerList.length === 0) {
      this.scene.start("MainMenu");
      return;
    }

    this.setupUI();
    this.setupAllPlayers();
    this.startNightPhase();
  }

  setupUI() {
    // Background
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "bg")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setAlpha(0.3);

    // Title
    this.add
      .text(this.scale.width / 2, 100, "🌙 NIGHT PHASE", {
        fontSize: "32px",
        fontFamily: "Poppins",
        color: "#6666ff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Progress indicator
    this.progressText = this.add
      .text(this.scale.width / 2, 150, "", {
        fontSize: "18px",
        fontFamily: "Poppins",
        color: "#cccccc",
      })
      .setOrigin(0.5);

    // Main text
    this.mainText = this.add
      .text(this.scale.width / 2, 300, "", {
        fontSize: "28px",
        fontFamily: "Poppins",
        color: "#ffffff",
        wordWrap: { width: 550 },
        align: "center",
      })
      .setOrigin(0.5);

    // Sub text
    this.subText = this.add
      .text(this.scale.width / 2, 400, "", {
        fontSize: "22px",
        fontFamily: "Poppins",
        color: "#ffcc66",
        wordWrap: { width: 500 },
        align: "center",
      })
      .setOrigin(0.5);

    // Continue button
    this.continueBtn = this.add
      .text(this.scale.width / 2, this.scale.height - 120, "Continue", {
        fontSize: "26px",
        fontFamily: "Poppins",
        color: "#ffffff",
        backgroundColor: "#4444ff",
        padding: { x: 30, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Button hover effects
    this.continueBtn.on("pointerover", () => {
      this.continueBtn.setStyle({ backgroundColor: "#6666ff" });
    });

    this.continueBtn.on("pointerout", () => {
      this.continueBtn.setStyle({ backgroundColor: "#4444ff" });
    });
  }

  setupAllPlayers() {
    // FIXED: Include ALL alive players in night phase
    this.allPlayers = [];

    GameManager.playerList.forEach((player, index) => {
      if (!player.isAlive) return;

      // Create player entry for EVERYONE
      const playerEntry = {
        player: player,
        playerIndex: index,
        actualRole: player.role, // Keep track of actual role
        hasNightAction: false,
        actionDescription:
          "You have no special action tonight. Sleep peacefully!",
        actionEmoji: "😴",
      };

      // Check if this player has a night action
      if (player.role === "Saboteur") {
        playerEntry.hasNightAction = true;
        playerEntry.actionDescription = "Choose someone to eliminate";
        playerEntry.actionEmoji = "💀";
      } else if (player.role === "Medic (Biology Major)") {
        playerEntry.hasNightAction = true;
        playerEntry.actionDescription = "Choose someone to protect (or skip)";
        playerEntry.actionEmoji = "🛡️";
      } else if (player.role === "Investigator (Forensic Scientist)") {
        playerEntry.hasNightAction = true;
        playerEntry.actionDescription = "Choose someone to investigate";
        playerEntry.actionEmoji = "🔍";
      }

      this.allPlayers.push(playerEntry);
    });

    // Shuffle the order so roles can't be deduced from turn order
    this.shufflePlayerOrder();
  }

  shufflePlayerOrder() {
    // Fisher-Yates shuffle to randomize player order
    for (let i = this.allPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.allPlayers[i], this.allPlayers[j]] = [
        this.allPlayers[j],
        this.allPlayers[i],
      ];
    }
  }

  startNightPhase() {
    this.currentPlayerIndex = 0;
    this.nightActions = [];

    if (this.allPlayers.length === 0) {
      this.skipToMorning();
      return;
    }

    this.showPassDevice();
  }

  showPassDevice() {
    this.currentState = "pass_device";
    this.clearButtons();

    if (this.currentPlayerIndex >= this.allPlayers.length) {
      this.resolveNight();
      return;
    }

    const currentPlayer = this.allPlayers[this.currentPlayerIndex];

    // Everyone sees the same generic message
    this.updateProgress();
    this.mainText.setText(
      `📱 Pass the device to:\n\n${currentPlayer.player.name}`
    );
    this.subText.setText(
      `${currentPlayer.player.name}: Tap when you have the device\n\n🔒 Other players: Please look away now`
    );

    this.continueBtn.setText("I Have The Device");

    this.continueBtn.removeAllListeners("pointerdown");
    this.continueBtn.once("pointerdown", () => {
      this.showPlayerNightInfo();
    });
  }

  showPlayerNightInfo() {
    this.currentState = "show_role";

    const currentPlayer = this.allPlayers[this.currentPlayerIndex];

    // Show the player their night status (whether they have an action or not)
    this.mainText.setText(
      `${currentPlayer.actionEmoji} Night Phase\n\n${currentPlayer.actionDescription}`
    );

    if (currentPlayer.hasNightAction) {
      this.subText.setText("Tap to see your options");
      this.continueBtn.setText("Show My Options");

      this.continueBtn.removeAllListeners("pointerdown");
      this.continueBtn.once("pointerdown", () => {
        this.showActionOptions();
      });
    } else {
      // Player has no action - just continue to next player
      this.subText.setText("Your turn is complete.\nTap to continue");
      this.continueBtn.setText("Next Player");

      this.continueBtn.removeAllListeners("pointerdown");
      this.continueBtn.once("pointerdown", () => {
        this.moveToNextPlayer();
      });
    }
  }

  showActionOptions() {
    this.currentState = "take_action";

    const currentPlayer = this.allPlayers[this.currentPlayerIndex];

    // Show specific action options only to players with night actions
    this.mainText.setText(
      `${currentPlayer.actionEmoji} ${currentPlayer.actionDescription}`
    );
    this.subText.setText("Choose your target:");

    this.continueBtn.setVisible(false);
    this.createTargetButtons(currentPlayer);
  }

  createTargetButtons(playerInfo) {
    const targets = GameManager.playerList.filter((player, index) => {
      if (!player.isAlive) return false;

      // Saboteur and Investigator can't target themselves
      if (
        (playerInfo.actualRole === "Saboteur" ||
          playerInfo.actualRole === "Investigator (Forensic Scientist)") &&
        index === playerInfo.playerIndex
      ) {
        return false;
      }

      return true;
    });

    let yPos = 500;
    const buttonHeight = 50;

    targets.forEach((player) => {
      const originalIndex = GameManager.playerList.indexOf(player);

      const btn = this.add
        .text(
          this.scale.width / 2,
          yPos,
          `${playerInfo.actionEmoji} ${player.name}`,
          {
            fontSize: "24px",
            fontFamily: "Poppins",
            color: "#ffffff",
            backgroundColor: "#444444",
            padding: { x: 25, y: 12 },
          }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      // Hover effects
      btn.on("pointerover", () => {
        btn.setStyle({ backgroundColor: "#666666" });
      });

      btn.on("pointerout", () => {
        btn.setStyle({ backgroundColor: "#444444" });
      });

      btn.on("pointerdown", () => {
        this.selectTarget(playerInfo, player, originalIndex);
      });

      this.buttons.push(btn);
      yPos += buttonHeight;
    });

    // Add skip option for Medic only
    if (playerInfo.actualRole === "Medic (Biology Major)") {
      const skipBtn = this.add
        .text(this.scale.width / 2, yPos + 20, "🚫 Don't Protect Anyone", {
          fontSize: "20px",
          fontFamily: "Poppins",
          color: "#888888",
          backgroundColor: "#333333",
          padding: { x: 20, y: 10 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      skipBtn.on("pointerover", () => {
        skipBtn.setStyle({ backgroundColor: "#555555" });
      });

      skipBtn.on("pointerout", () => {
        skipBtn.setStyle({ backgroundColor: "#333333" });
      });

      skipBtn.on("pointerdown", () => {
        this.skipAction(playerInfo);
      });

      this.buttons.push(skipBtn);
    }
  }

  selectTarget(playerInfo, targetPlayer, targetIndex) {
    // Record action
    const action = {
      role: playerInfo.actualRole,
      actor: playerInfo.player.name,
      actorIndex: playerInfo.playerIndex,
      target: targetPlayer.name,
      targetIndex: targetIndex,
    };

    this.nightActions.push(action);

    // Show immediate feedback for Investigator only
    let message = "";
    if (playerInfo.actualRole === "Investigator (Forensic Scientist)") {
      const isSaboteur = targetPlayer.role === "Saboteur";
      message = `🔍 ${targetPlayer.name} is ${
        isSaboteur ? "SUSPICIOUS! 🚨" : "INNOCENT ✅"
      }`;
    } else {
      message = `✅ Action confirmed!\nTarget: ${targetPlayer.name}`;
    }

    this.showActionComplete(message);
  }

  skipAction(playerInfo) {
    const action = {
      role: playerInfo.actualRole,
      actor: playerInfo.player.name,
      actorIndex: playerInfo.playerIndex,
      skipped: true,
    };

    this.nightActions.push(action);
    this.showActionComplete("✅ You chose not to act");
  }

  showActionComplete(message) {
    this.clearButtons();

    this.mainText.setText(message);
    this.subText.setText(
      "Your turn is complete.\nTap to continue to next player"
    );

    this.continueBtn.setVisible(true);
    this.continueBtn.setText("Next Player");

    this.continueBtn.removeAllListeners("pointerdown");
    this.continueBtn.once("pointerdown", () => {
      this.moveToNextPlayer();
    });
  }

  moveToNextPlayer() {
    this.currentPlayerIndex++;

    if (this.currentPlayerIndex >= this.allPlayers.length) {
      this.resolveNight();
    } else {
      // Show device passing screen
      this.showDevicePassing();
    }
  }

  showDevicePassing() {
    this.clearButtons();

    this.mainText.setText("📱 Passing Device...");
    this.subText.setText(
      "🔒 Everyone look away!\n\nNext player tap when ready"
    );

    this.continueBtn.setText("Ready for Next Player");
    this.continueBtn.setVisible(true);

    this.continueBtn.removeAllListeners("pointerdown");
    this.continueBtn.once("pointerdown", () => {
      this.showPassDevice();
    });
  }

  resolveNight() {
    this.currentState = "results";
    this.clearButtons();

    this.mainText.setText("🌅 Night Results");
    this.subText.setText("Everyone can look now!\nProcessing actions...");

    this.continueBtn.setVisible(false);

    let eliminated = null;

    // Process night actions
    const protectAction = this.nightActions.find(
      (a) => a.role === "Medic (Biology Major)" && !a.skipped
    );
    if (protectAction) {
      GameManager.playerList[protectAction.targetIndex].isProtected = true;
    }

    const eliminateAction = this.nightActions.find(
      (a) => a.role === "Saboteur"
    );
    if (eliminateAction) {
      const target = GameManager.playerList[eliminateAction.targetIndex];

      if (target.isProtected) {
        this.subText.setText("Someone was protected from elimination!");
      } else {
        target.isAlive = false;
        eliminated = target;
        GameManager.eliminatedPlayerIndex = eliminateAction.targetIndex;
      }
    }

    // Clear protections
    GameManager.playerList.forEach((p) => (p.isProtected = false));

    // Show results after delay
    this.time.delayedCall(3000, () => {
      this.showFinalResults(eliminated);
    });
  }

  showFinalResults(eliminated) {
    let message = "🌅 Dawn Breaks";
    if (eliminated) {
      message += `\n\n💀 ${eliminated.name} was eliminated during the night`;
    } else {
      message += `\n\n✅ Everyone survived the night`;
    }

    this.mainText.setText(message);
    this.subText.setText("The survivors gather to discuss what happened");

    this.continueBtn.setText("Begin Day Phase");
    this.continueBtn.setVisible(true);

    this.continueBtn.removeAllListeners("pointerdown");
    this.continueBtn.once("pointerdown", () => {
      // Check win condition
      const alive = GameManager.playerList.filter((p) => p.isAlive);
      const aliveSaboteurs = alive.filter((p) => p.role === "Saboteur");
      const aliveInnocents = alive.filter((p) => p.role !== "Saboteur");

      if (aliveSaboteurs.length === 0) {
        GameManager.winMessage = "🎉 Innocents Win! Saboteur eliminated!";
        this.scene.start("GameOver");
      } else if (aliveSaboteurs.length >= aliveInnocents.length) {
        GameManager.winMessage = "💀 Saboteurs Win! They control the facility!";
        this.scene.start("GameOver");
      } else {
        GameManager.roundNumber++;
        this.scene.start("DayPhase");
      }
    });
  }

  updateProgress() {
    if (this.allPlayers.length > 0) {
      this.progressText.setText(
        `Player ${this.currentPlayerIndex + 1} of ${this.allPlayers.length}`
      );
    }
  }

  skipToMorning() {
    this.mainText.setText("🌅 A quiet night...");
    this.subText.setText("No players are active");

    this.time.delayedCall(2000, () => {
      GameManager.roundNumber++;
      this.scene.start("DayPhase");
    });
  }

  clearButtons() {
    this.buttons.forEach((btn) => btn.destroy());
    this.buttons = [];
  }

  destroy() {
    this.clearButtons();
    super.destroy();
  }
}
