import GameManager from "../managers/GameManager.js";
import RoleManager from "../managers/RoleManager.js";

export default class RoleReveal extends Phaser.Scene {
  constructor() {
    super("RoleReveal");
    this.index = 0;
    this.revealStep = 0; // 0 = pass device, 1 = show role
    this.inputLocked = false;
    this.totalPlayers = 0;
  }

  preload() {
    this.load.image("bg", "assets/images/background.png");

    // Preload role images
    const roles = [
      "Saboteur",
      "Medic",
      "Professor",
      "Innovator",
      "Investigator",
      "Student",
    ];
    roles.forEach((role) => {
      this.load.image(`role_${role}`, `assets/images/roles/${role}.png`);
    });

    // Load sound effects (optional)
    // this.load.audio("reveal_sound", "assets/audio/reveal.mp3");
    // this.load.audio("transition_sound", "assets/audio/transition.mp3");
  }

  create() {
    // 🛡 Guard if no players
    if (!GameManager.playerList || GameManager.playerList.length === 0) {
      console.warn("No players found. Returning to Main Menu.");
      this.scene.start("MainMenu");
      return;
    }

    this.totalPlayers = GameManager.playerList.length;

    // 🖼 Background
    this.add
      .image(this.cameras.main.centerX, this.cameras.main.centerY, "bg")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setAlpha(0.3);

    // 🎲 Assign roles
    RoleManager.assignRoles();

    // 📊 Progress indicator
    this.progressText = this.add
      .text(this.scale.width / 2, 100, "", {
        fontSize: "18px",
        color: "#cccccc",
        fontFamily: "Poppins",
      })
      .setOrigin(0.5);

    // 📋 Name and role texts
    this.nameText = this.add
      .text(this.scale.width / 2, 200, "", {
        fontSize: "30px",
        color: "#ffffff",
        fontFamily: "Poppins",
        align: "center",
      })
      .setOrigin(0.5);

    this.roleText = this.add
      .text(this.scale.width / 2, 300, "", {
        fontSize: "26px",
        color: "#ffcc00",
        fontFamily: "Poppins",
        align: "center",
      })
      .setOrigin(0.5);

    // 🖼 Role image (hidden by default)
    this.roleImage = this.add
      .image(this.scale.width / 2, 480, "")
      .setVisible(false)
      .setScale(0.5);

    // 📝 Role description (optional enhancement)
    this.roleDescription = this.add
      .text(this.scale.width / 2, 580, "", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: "Poppins",
        align: "center",
        wordWrap: { width: this.scale.width - 100 },
      })
      .setOrigin(0.5)
      .setVisible(false);

    // ▶️ Continue Button
    this.continueButton = this.add
      .text(this.scale.width / 2, 700, "Tap to Continue ▶️", {
        fontSize: "26px",
        color: "#ffffff",
        backgroundColor: "#333",
        fontFamily: "Poppins",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerover", () =>
        this.continueButton.setStyle({ backgroundColor: "#555" })
      )
      .on("pointerout", () =>
        this.continueButton.setStyle({ backgroundColor: "#333" })
      )
      .on("pointerdown", () => this.handleTap());

    // ⏭️ Skip button (for testing or impatient players)
    this.skipButton = this.add
      .text(this.scale.width - 20, this.scale.height - 20, "Skip All", {
        fontSize: "16px",
        color: "#999",
        fontFamily: "Poppins",
      })
      .setOrigin(1, 1)
      .setInteractive()
      .on("pointerdown", () => this.skipToEnd())
      .setVisible(false); // Hide in production, show for testing

    // Keyboard support
    this.input.keyboard.on("keydown-SPACE", () => this.handleTap());
    this.input.keyboard.on("keydown-ENTER", () => this.handleTap());

    // Begin with pass prompt
    this.revealStep = 0;
    this.showPassPrompt();
  }

  updateProgress() {
    this.progressText.setText(
      `Player ${this.index + 1} of ${this.totalPlayers}`
    );
  }

  showPassPrompt() {
    if (this.index >= this.totalPlayers) {
      this.proceedToNextPhase();
      return;
    }

    this.inputLocked = false;
    this.roleImage.setVisible(false);
    this.roleDescription.setVisible(false);
    this.updateProgress();

    const player = GameManager.playerList[this.index];
    this.nameText.setText(`📱 Pass the device to:\n${player.name}`);
    this.roleText.setText("🔒 Tap when ready to view your secret role");
    this.continueButton.setText("Tap to Reveal Role 👁️");
  }

  showRoleReveal() {
    const player = GameManager.playerList[this.index];
    this.nameText.setText(`Player: ${player.name}`);
    this.roleText.setText(`🎭 Your role is: ${player.role}`);

    // Show role description if available
    const description = this.getRoleDescription(player.role);
    if (description) {
      this.roleDescription.setText(description).setVisible(true);
    }

    // 🔍 Show image if exists
    const imageKey = `role_${player.role}`;
    if (this.textures.exists(imageKey)) {
      this.roleImage.setTexture(imageKey).setVisible(true);

      // Add a subtle scale animation
      this.roleImage.setScale(0.3);
      this.tweens.add({
        targets: this.roleImage,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 300,
        ease: "Back.easeOut",
      });
    } else {
      this.roleImage.setVisible(false);
      console.warn(`Role image not found: ${imageKey}`);
    }

    // Update button text
    const isLastPlayer = this.index === this.totalPlayers - 1;
    this.continueButton.setText(
      isLastPlayer ? "Start Game! 🚀" : "Next Player ▶️"
    );

    // Optional: Play reveal sound
    // if (this.sound.get("reveal_sound")) {
    //   this.sound.play("reveal_sound", { volume: 0.3 });
    // }
  }

  getRoleDescription(role) {
    const descriptions = {
      Saboteur: "Your goal is to sabotage the mission without being detected.",
      Medic: "You can heal players and detect poison attempts.",
      Professor: "You have extensive knowledge and can research clues.",
      Innovator: "You can create tools and solve technical problems.",
      Investigator: "You can gather information and interrogate suspects.",
      Student: "You're eager to learn and can assist other roles.",
    };
    return descriptions[role] || "";
  }

  handleTap() {
    if (this.inputLocked) return;

    if (this.revealStep === 0) {
      // Show the role
      this.revealStep = 1;
      this.showRoleReveal();
    } else {
      // Move to next player
      this.revealStep = 0;
      this.index++;
      this.inputLocked = true;
      this.fadeToNextPlayer();
    }
  }

  fadeToNextPlayer() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.showPassPrompt();
      this.cameras.main.fadeIn(300, 0, 0, 0);

      // Unlock input after fade completes
      this.cameras.main.once("camerafadein complete", () => {
        this.inputLocked = false;
      });
    });
  }

  proceedToNextPhase() {
    // Optional: Show a summary screen before proceeding
    this.nameText.setText("🎭 All roles have been revealed!");
    this.roleText.setText("The game begins now...");
    this.roleImage.setVisible(false);
    this.roleDescription.setVisible(false);
    this.progressText.setText("");

    this.continueButton.setText("Begin Night Phase 🌙");
    this.continueButton.removeAllListeners("pointerdown");
    this.continueButton.on("pointerdown", () => {
      this.scene.start("NightPhase");
    });

    // Auto-proceed after a few seconds
    this.time.delayedCall(3000, () => {
      this.scene.start("NightPhase");
    });
  }

  skipToEnd() {
    // For testing purposes - skip all remaining reveals
    this.index = this.totalPlayers;
    this.proceedToNextPhase();
  }

  // Clean up when scene ends
  destroy() {
    if (this.input && this.input.keyboard) {
      this.input.keyboard.removeAllListeners();
    }
    super.destroy();
  }
}
