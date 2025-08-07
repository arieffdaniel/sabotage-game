export default class HowToPlay extends Phaser.Scene {
  constructor() {
    super("HowToPlay");
  }

  preload() {
    this.load.image("bg", "assets/images/background.png");
  }

  create() {
    // 📱 Dimmed background
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "bg")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setAlpha(0.3);

    const howToPlayText = `
🎯 Objective:
Find and eliminate all Saboteurs—or sabotage without getting caught!

👥 Roles:
• Saboteur: Secretly sabotage students each night.
• Medic: Protect a player from being sabotaged.
• Investigator: Reveal if someone is a Saboteur.
• Professor: Knows the Innovator.
• Innovator: Win with Students, but can be converted.
• Student: No special powers.

🌙 Night Phase:
Roles act in secret. Saboteur picks a target. Medic protects. Investigator investigates.

🌞 Day Phase:
All players vote to eliminate a suspicious player.

🔚 Game Ends When:
• All Saboteurs are eliminated (Students Win)
• Saboteurs outnumber Students (Saboteurs Win)
`;

    this.add
      .text(this.scale.width / 2, 150, "📖 How to Play", {
        fontSize: "36px",
        fontFamily: "Poppins",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(this.scale.width / 2, 250, howToPlayText, {
        fontSize: "20px",
        fontFamily: "Poppins",
        color: "#ffffff",
        wordWrap: { width: 600 },
        align: "left",
      })
      .setOrigin(0.5, 0);

    // 🔙 Back to Main Menu
    const backBtn = this.add
      .text(this.scale.width / 2, 1150, "⬅️ Back", {
        fontSize: "28px",
        fontFamily: "Poppins",
        color: "#00ff88",
        backgroundColor: "#222",
        padding: { x: 20, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive();

    backBtn.on("pointerover", () =>
      backBtn.setStyle({ backgroundColor: "#444" })
    );
    backBtn.on("pointerout", () =>
      backBtn.setStyle({ backgroundColor: "#222" })
    );
    backBtn.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
  }
}
