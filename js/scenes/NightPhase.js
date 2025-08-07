import GameManager from "../managers/GameManager.js";
import PhaseManager from "../managers/PhaseManager.js";

export default class NightPhase extends Phaser.Scene {
  constructor() {
    super("NightPhase");
    this.currentRole = "";
    this.currentActor = null;
    this.step = 0;
    this.buttons = [];
    this.nightActions = [];
    this.isProcessingAction = false;
    this.phaseState = "transition"; // transition, roleAction, results
  }

  preload() {
    this.load.image("bg", "assets/images/background.png");

    // Optional: Load role-specific images or sounds
    // this.load.image("night_overlay", "assets/images/night_overlay.png");
    // this.load.audio("night_ambient", "assets/audio/night.mp3");
  }

  create() {
    // Guard clause for invalid game state
    if (!GameManager.playerList || GameManager.playerList.length === 0) {
      console.warn("No players found in NightPhase. Returning to MainMenu.");
      this.scene.start("MainMenu");
      return;
    }

    this.setupUI();
    this.initializeNightPhase();
  }

  setupUI() {
    // 🖼️ Dark night background
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "bg")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setAlpha(0.2);

    // 🌙 Phase header
    this.phaseHeader = this.add
      .text(this.scale.width / 2, 50, "🌙 NIGHT PHASE", {
        fontSize: "36px",
        fontFamily: "Poppins",
        color: "#6666ff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // 📊 Progress indicator
    this.progressText = this.add
      .text(this.scale.width / 2, 90, "", {
        fontSize: "18px",
        fontFamily: "Poppins",
        color: "#cccccc",
      })
      .setOrigin(0.5);

    // 📝 Main instruction text
    this.instructionText = this.add
      .text(this.scale.width / 2, 150, "", {
        fontSize: "28px",
        fontFamily: "Poppins",
        color: "#ffffff",
        wordWrap: { width: 600 },
        align: "center",
      })
      .setOrigin(0.5);

    // 🎭 Role-specific information
    this.roleInfoText = this.add
      .text(this.scale.width / 2, 220, "", {
        fontSize: "22px",
        fontFamily: "Poppins",
        color: "#ffcc66",
        wordWrap: { width: 500 },
        align: "center",
      })
      .setOrigin(0.5);

    // 📋 Action summary (for results)
    this.actionSummaryText = this.add
      .text(this.scale.width / 2, 300, "", {
        fontSize: "20px",
        fontFamily: "Poppins",
        color: "#aaaaaa",
        wordWrap: { width: 550 },
        align: "center",
      })
      .setOrigin(0.5)
      .setVisible(false);

    // ▶️ Action button
    this.actionButton = this.add
      .text(this.scale.width / 2, this.scale.height - 100, "Next ▶️", {
        fontSize: "28px",
        fontFamily: "Poppins",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 25, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    // Button hover effects
    this.actionButton.on("pointerover", () => {
      if (this.actionButton.active) {
        this.actionButton.setStyle({ backgroundColor: "#555555" });
      }
    });

    this.actionButton.on("pointerout", () => {
      if (this.actionButton.active) {
        this.actionButton.setStyle({ backgroundColor: "#333333" });
      }
    });
  }

  initializeNightPhase() {
    // Define role processing order and their abilities
    this.roleDefinitions = {
      Saboteur: {
        order: 1,
        actionText: "Choose someone to eliminate",
        emoji: "💀",
        color: "#ff4444",
        canTargetSelf: false,
        description: "Select a player to eliminate during the night",
      },
      Medic: {
        order: 2,
        actionText: "Choose someone to protect",
        emoji: "🛡️",
        color: "#44ff44",
        canTargetSelf: true,
        description: "Protect a player from elimination (including yourself)",
      },
      Investigator: {
        order: 3,
        actionText: "Choose someone to investigate",
        emoji: "🔍",
        color: "#4444ff",
        canTargetSelf: false,
        description: "Learn if a player is the Saboteur",
      },
    };

    // Get alive players with night roles, sorted by action order
    this.rolesToProcess = Object.keys(this.roleDefinitions)
      .sort(
        (a, b) => this.roleDefinitions[a].order - this.roleDefinitions[b].order
      )
      .filter((role) => {
        return GameManager.playerList.some((p) => p.role === role && p.isAlive);
      });

    this.nightActions = [];
    this.step = 0;
    this.processNextRole();
  }

  updateProgress() {
    if (this.rolesToProcess.length === 0) {
      this.progressText.setText("Processing night results...");
    } else {
      this.progressText.setText(
        `Role ${this.step + 1} of ${this.rolesToProcess.length}: ${
          this.currentRole || "Starting..."
        }`
      );
    }
  }

  processNextRole() {
    this.phaseState = "transition";
    this.cleanupButtons();
    this.actionButton.removeAllListeners();
    this.actionSummaryText.setVisible(false);

    if (this.step >= this.rolesToProcess.length) {
      this.resolveNightActions();
      return;
    }

    this.currentRole = this.rolesToProcess[this.step];
    this.currentActor = GameManager.playerList.find(
      (p) => p.role === this.currentRole && p.isAlive
    );

    if (!this.currentActor) {
      // Role player is dead, skip to next
      this.step++;
      this.processNextRole();
      return;
    }

    this.updateProgress();
    this.showPassDevicePrompt();
  }

  showPassDevicePrompt() {
    const roleInfo = this.roleDefinitions[this.currentRole];

    this.instructionText.setText(
      `📱 Pass the device to:\n${this.currentActor.name}\n\n` +
        `${roleInfo.emoji} ${this.currentRole} Phase`
    );

    this.roleInfoText.setText(
      `Your ability: ${roleInfo.description}\n\n` +
        "Tap when ready to use your ability"
    );

    this.actionButton
      .setText("I'm Ready 👁️")
      .setStyle({
        backgroundColor: roleInfo.color,
        color: "#ffffff",
      })
      .setVisible(true)
      .setInteractive();

    this.actionButton.once("pointerdown", () => {
      this.showRoleAction();
    });
  }

  showRoleAction() {
    this.phaseState = "roleAction";
    this.isProcessingAction = false;
    this.cleanupButtons();
    this.actionButton.removeAllListeners().setVisible(false);

    const roleInfo = this.roleDefinitions[this.currentRole];

    this.instructionText.setText(
      `${roleInfo.emoji} ${this.currentActor.name}\n\n${roleInfo.actionText}:`
    );

    this.roleInfoText.setText("");

    this.createTargetButtons(roleInfo);
  }

  createTargetButtons(roleInfo) {
    const availableTargets = GameManager.playerList.filter((player, index) => {
      // Always exclude dead players
      if (!player.isAlive) return false;

      // Check if role can target self
      if (!roleInfo.canTargetSelf && player.name === this.currentActor.name) {
        return false;
      }

      return true;
    });

    if (availableTargets.length === 0) {
      this.handleNoValidTargets();
      return;
    }

    const buttonStartY = 320;
    const buttonSpacing = 55;

    availableTargets.forEach((player, buttonIndex) => {
      const originalIndex = GameManager.playerList.findIndex(
        (p) => p === player
      );
      const yPos = buttonStartY + buttonIndex * buttonSpacing;

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

      // Hover effects
      btn.on("pointerover", () => {
        if (!this.isProcessingAction) {
          btn.setStyle({
            backgroundColor: roleInfo.color,
            color: "#ffffff",
          });
        }
      });

      btn.on("pointerout", () => {
        if (!this.isProcessingAction) {
          btn.setStyle({
            backgroundColor: "#444444",
            color: "#ffffff",
          });
        }
      });

      btn.on("pointerdown", () => {
        if (!this.isProcessingAction) {
          this.handleRoleAction(originalIndex, player, btn, roleInfo);
        }
      });

      this.buttons.push(btn);
    });

    // Add skip/no action button for certain roles
    if (this.currentRole === "Medic") {
      this.addSkipButton(
        roleInfo,
        buttonStartY + availableTargets.length * buttonSpacing + 20
      );
    }
  }

  addSkipButton(roleInfo, yPos) {
    const skipBtn = this.add
      .text(this.scale.width / 2, yPos, "🚫 No Protection Tonight", {
        fontSize: "20px",
        fontFamily: "Poppins",
        color: "#888888",
        backgroundColor: "#333333",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    skipBtn.on("pointerover", () => {
      if (!this.isProcessingAction) {
        skipBtn.setStyle({ backgroundColor: "#555555" });
      }
    });

    skipBtn.on("pointerout", () => {
      if (!this.isProcessingAction) {
        skipBtn.setStyle({ backgroundColor: "#333333" });
      }
    });

    skipBtn.on("pointerdown", () => {
      if (!this.isProcessingAction) {
        this.handleSkipAction(skipBtn);
      }
    });

    this.buttons.push(skipBtn);
  }

  handleNoValidTargets() {
    this.instructionText.setText(
      `${
        this.roleDefinitions[this.currentRole].emoji
      } No valid targets available\n\n` + "Your action is skipped this turn"
    );

    this.showContinueButton("Continue ▶️");
  }

  handleRoleAction(targetIndex, targetPlayer, button, roleInfo) {
    this.isProcessingAction = true;

    // Visual feedback
    button.setStyle({
      backgroundColor: "#00aa00",
      color: "#ffffff",
    });

    // Record the action
    const action = {
      role: this.currentRole,
      actor: this.currentActor.name,
      actorIndex: GameManager.playerList.findIndex(
        (p) => p === this.currentActor
      ),
      targetIndex: targetIndex,
      targetName: targetPlayer.name,
    };

    this.nightActions.push(action);

    // Execute immediate role effects or show results
    this.executeRoleAction(action, targetPlayer);
  }

  handleSkipAction(button) {
    this.isProcessingAction = true;

    button.setStyle({ backgroundColor: "#666666" });

    const action = {
      role: this.currentRole,
      actor: this.currentActor.name,
      actorIndex: GameManager.playerList.findIndex(
        (p) => p === this.currentActor
      ),
      targetIndex: -1,
      targetName: "No Target",
      skipped: true,
    };

    this.nightActions.push(action);
    this.showActionResult(
      `${this.currentActor.name} chose not to use their ability tonight.`
    );
  }

  executeRoleAction(action, targetPlayer) {
    let resultMessage = "";

    switch (action.role) {
      case "Saboteur":
        GameManager.lastSabotageIndex = action.targetIndex;
        resultMessage = `You have chosen to eliminate ${targetPlayer.name}.`;
        break;

      case "Medic":
        // Clear previous protections first
        GameManager.playerList.forEach((p) => (p.isProtected = false));
        targetPlayer.isProtected = true;
        resultMessage = `You are protecting ${targetPlayer.name} tonight.`;
        break;

      case "Investigator":
        const isSaboteur = targetPlayer.role === "Saboteur";
        resultMessage = `🔍 Investigation Result:\n${targetPlayer.name} is ${
          isSaboteur ? "the SABOTEUR! 🚨" : "NOT the Saboteur ✅"
        }`;
        break;

      default:
        resultMessage = `Action completed for ${targetPlayer.name}.`;
    }

    this.showActionResult(resultMessage);
  }

  showActionResult(message) {
    this.cleanupButtons();
    this.instructionText.setText(message);
    this.roleInfoText.setText("");

    this.showContinueButton("Continue to Next Role ▶️");
  }

  showContinueButton(text) {
    this.actionButton
      .setText(text)
      .setStyle({
        backgroundColor: "#333333",
        color: "#ffffff",
      })
      .setVisible(true)
      .setInteractive();

    this.actionButton.once("pointerdown", () => {
      this.step++;
      this.processNextRole();
    });
  }

  resolveNightActions() {
    this.phaseState = "results";
    this.cleanupButtons();
    this.updateProgress();

    // Show night summary
    this.showNightSummary();

    // Process all night actions through PhaseManager
    PhaseManager.resolveNight();

    // Check for win conditions
    const winResult = PhaseManager.checkWin();
    if (winResult && winResult !== "") {
      GameManager.winMessage = winResult;
      this.time.delayedCall(2000, () => {
        this.scene.start("GameOver");
      });
    } else {
      this.actionButton
        .setText("Dawn Breaks - Continue to Day ☀️")
        .setStyle({
          backgroundColor: "#ffaa00",
          color: "#ffffff",
        })
        .setVisible(true)
        .setInteractive();

      this.actionButton.once("pointerdown", () => {
        this.scene.start("DayPhase");
      });
    }
  }

  showNightSummary() {
    this.instructionText.setText("🌅 Night Actions Complete");
    this.roleInfoText.setText("The night activities have concluded...");

    // Show summary of actions (without revealing sensitive information)
    let summary = "📋 Night Summary:\n\n";
    this.nightActions.forEach((action) => {
      if (action.skipped) {
        summary += `• ${action.role} chose not to act\n`;
      } else if (action.role !== "Investigator") {
        // Don't reveal investigation results
        summary += `• ${action.role} performed their night action\n`;
      } else {
        summary += `• ${action.role} conducted an investigation\n`;
      }
    });

    if (this.nightActions.length === 0) {
      summary += "• No night actions were taken\n";
    }

    this.actionSummaryText.setText(summary).setVisible(true);
  }

  cleanupButtons() {
    this.buttons.forEach((btn) => btn.destroy());
    this.buttons = [];
  }

  // Cleanup when scene ends
  destroy() {
    this.cleanupButtons();
    super.destroy();
  }
  // Add this method to your existing NightPhase class

  handleRoleAction(targetIndex, targetPlayer, button, roleInfo) {
    this.isProcessingAction = true;

    // Visual feedback
    button.setStyle({
      backgroundColor: "#00aa00",
      color: "#ffffff",
    });

    // Launch question challenge for important actions
    if (this.shouldRequireChallenge()) {
      // Pause this scene
      this.scene.pause();

      // Launch question scene
      this.scene.launch("QuestionChallenge", {
        type: this.currentRole.toLowerCase(),
        targetPlayer: targetPlayer.name,
        returnScene: "NightPhase",
        callback: (success) => {
          if (success) {
            // Proceed with action
            this.recordSuccessfulAction(targetIndex, targetPlayer);
          } else {
            // Action failed
            this.showFailedAction(targetPlayer);
          }
        },
      });
    } else {
      // Direct action without challenge
      this.recordSuccessfulAction(targetIndex, targetPlayer);
    }
  }

  shouldRequireChallenge() {
    // Implement logic for when to require challenges
    // For example: always for Saboteur, sometimes for others
    if (this.currentRole === "Saboteur") return true;
    if (this.currentRole === "Investigator" && Math.random() < 0.5) return true;
    return false;
  }

  recordSuccessfulAction(targetIndex, targetPlayer) {
    const action = {
      role: this.currentRole,
      actor: this.currentActor.name,
      actorIndex: GameManager.playerList.findIndex(
        (p) => p === this.currentActor
      ),
      targetIndex: targetIndex,
      targetName: targetPlayer.name,
    };

    this.nightActions.push(action);
    this.executeRoleAction(action, targetPlayer);
  }

  showFailedAction(targetPlayer) {
    this.instructionText.setText(
      `❌ Challenge Failed!\n\nYour action on ${targetPlayer.name} was unsuccessful.`
    );

    this.roleInfoText.setText("Study harder next time!");

    this.showContinueButton("Continue to Next Role ▶️");
  }
}
