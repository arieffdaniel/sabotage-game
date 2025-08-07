import GameManager from "../managers/GameManager.js";

export default class NightPhase extends Phaser.Scene {
  constructor() {
    super("NightPhase");
    this.currentRoleIndex = 0;
    this.nightRoles = [];
    this.nightActions = [];
    this.buttons = [];
    this.currentState = "starting"; // starting, pass_device, show_role, take_action, results
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
    this.findNightRoles();
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

    // Main text (larger, more prominent)
    this.mainText = this.add
      .text(this.scale.width / 2, 300, "", {
        fontSize: "28px",
        fontFamily: "Poppins",
        color: "#ffffff",
        wordWrap: { width: 550 },
        align: "center",
      })
      .setOrigin(0.5);

    // Sub text (instructions)
    this.subText = this.add
      .text(this.scale.width / 2, 400, "", {
        fontSize: "22px",
        fontFamily: "Poppins",
        color: "#ffcc66",
        wordWrap: { width: 500 },
        align: "center",
      })
      .setOrigin(0.5);

    // Single continue button
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

  findNightRoles() {
    this.nightRoles = [];

    GameManager.playerList.forEach((player, index) => {
      if (!player.isAlive) return;

      if (player.role === "Saboteur") {
        this.nightRoles.push({
          player: player,
          playerIndex: index,
          role: "Saboteur",
          emoji: "💀",
          description: "Choose someone to eliminate",
        });
      } else if (player.role === "Medic") {
        this.nightRoles.push({
          player: player,
          playerIndex: index,
          role: "Medic",
          emoji: "🛡️",
          description: "Choose someone to protect (or skip)",
        });
      } else if (player.role === "Investigator") {
        this.nightRoles.push({
          player: player,
          playerIndex: index,
          role: "Investigator",
          emoji: "🔍",
          description: "Choose someone to investigate",
        });
      }
    });
  }

  startNightPhase() {
    this.currentRoleIndex = 0;
    this.nightActions = [];

    if (this.nightRoles.length === 0) {
      this.skipToMorning();
      return;
    }

    this.showPassDevice();
  }

  showPassDevice() {
    this.currentState = "pass_device";
    this.clearButtons();

    const currentRole = this.nightRoles[this.currentRoleIndex];

    // ✅ SIMPLE: Clear, direct instructions
    this.updateProgress();
    this.mainText.setText(
      `📱 Pass the device to:\n\n${currentRole.player.name}`
    );
    this.subText.setText(
      `${currentRole.player.name}: Tap when you have the device\n\n🔒 Other players: Please look away now`
    );

    this.continueBtn.setText("I Have The Device");

    this.continueBtn.removeAllListeners("pointerdown");
    this.continueBtn.once("pointerdown", () => {
      this.showPlayerRole();
    });
  }

  showPlayerRole() {
    this.currentState = "show_role";

    const currentRole = this.nightRoles[this.currentRoleIndex];

    // ✅ SIMPLE: Show role immediately, no extra steps
    this.mainText.setText(
      `${currentRole.emoji} You are the ${currentRole.role}!`
    );
    this.subText.setText(
      `${currentRole.description}\n\nTap to see your options`
    );

    this.continueBtn.setText("Show My Options");

    this.continueBtn.removeAllListeners("pointerdown");
    this.continueBtn.once("pointerdown", () => {
      this.showActionOptions();
    });
  }

  showActionOptions() {
    this.currentState = "take_action";

    const currentRole = this.nightRoles[this.currentRoleIndex];

    this.mainText.setText(`${currentRole.emoji} ${currentRole.description}`);
    this.subText.setText("Choose your target:");

    this.continueBtn.setVisible(false);
    this.createTargetButtons(currentRole);
  }

  createTargetButtons(roleInfo) {
    const targets = GameManager.playerList.filter((player, index) => {
      if (!player.isAlive) return false;

      // Saboteur and Investigator can't target themselves
      if (
        (roleInfo.role === "Saboteur" || roleInfo.role === "Investigator") &&
        index === roleInfo.playerIndex
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
        .text(this.scale.width / 2, yPos, `${roleInfo.emoji} ${player.name}`, {
          fontSize: "24px",
          fontFamily: "Poppins",
          color: "#ffffff",
          backgroundColor: "#444444",
          padding: { x: 25, y: 12 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      // Simple hover effect
      btn.on("pointerover", () => {
        btn.setStyle({ backgroundColor: "#666666" });
      });

      btn.on("pointerout", () => {
        btn.setStyle({ backgroundColor: "#444444" });
      });

      btn.on("pointerdown", () => {
        this.selectTarget(roleInfo, player, originalIndex);
      });

      this.buttons.push(btn);
      yPos += buttonHeight;
    });

    // Add skip option for Medic only
    if (roleInfo.role === "Medic") {
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
        this.skipAction(roleInfo);
      });

      this.buttons.push(skipBtn);
    }
  }

  selectTarget(roleInfo, targetPlayer, targetIndex) {
    // Record action
    const action = {
      role: roleInfo.role,
      actor: roleInfo.player.name,
      actorIndex: roleInfo.playerIndex,
      target: targetPlayer.name,
      targetIndex: targetIndex,
    };

    this.nightActions.push(action);

    // Show immediate feedback for Investigator
    let message = "";
    if (roleInfo.role === "Investigator") {
      const isSaboteur = targetPlayer.role === "Saboteur";
      message = `🔍 ${targetPlayer.name} is ${
        isSaboteur ? "SUSPICIOUS! 🚨" : "INNOCENT ✅"
      }`;
    } else {
      message = `✅ Action confirmed!\nTarget: ${targetPlayer.name}`;
    }

    this.showActionComplete(message);
  }

  skipAction(roleInfo) {
    const action = {
      role: roleInfo.role,
      actor: roleInfo.player.name,
      actorIndex: roleInfo.playerIndex,
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
    this.currentRoleIndex++;

    if (this.currentRoleIndex >= this.nightRoles.length) {
      this.resolveNight();
    } else {
      // ✅ SIMPLE: Just show "device passing" screen
      this.showDevicePassing();
    }
  }

  showDevicePassing() {
    this.clearButtons();

    this.mainText.setText("📱 Passing Device...");
    this.subText.setText(
      "🔒 Everyone look away!\n\nNext player tap when ready"
    );

    // ✅ FIX: Show button instead of auto-advance
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

    // Simple resolution logic
    const protectAction = this.nightActions.find(
      (a) => a.role === "Medic" && !a.skipped
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
    if (this.nightRoles.length > 0) {
      this.progressText.setText(
        `Player ${this.currentRoleIndex + 1} of ${this.nightRoles.length}`
      );
    }
  }

  skipToMorning() {
    this.mainText.setText("🌅 A quiet night...");
    this.subText.setText("No special roles are active");

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

/*
✅ SIMPLIFIED FLOW:

1. "Pass device to [Name]" → Clear instructions
2. "[Name] tap when you have device" → One simple action
3. "You are [Role]!" → Immediate reveal
4. "Show my options" → One button to continue  
5. Target selection → Simple buttons
6. "Action complete" → Clear confirmation
7. "Next player" → Move on
8. Auto 3-second transition → No confusion
9. Repeat for next player

🚫 REMOVED CONFUSING ELEMENTS:
- Multiple privacy screens
- Complex state transitions  
- Unclear "ready" states
- Too many confirmation steps
- Confusing color changes
- Unclear instructions

✅ CLEAR BENEFITS:
- One button per screen (except target selection)
- Clear progress indicator
- Simple language
- Obvious next steps
- Auto-transitions where helpful
- Consistent flow for all players
*/
