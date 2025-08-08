import GameManager from "../managers/GameManager.js";
import PhaseManager from "../managers/PhaseManager.js";

export default class DayPhase extends Phaser.Scene {
  constructor() {
    super("DayPhase");
    this.votes = [];
    this.currentVoter = 0;
    this.buttons = [];
    this.voteHistory = []; // Track who voted for whom (hidden until results)
    this.isVotingLocked = false;
    this.phaseState = "voting"; // voting, summary, eliminating
    this.privateCurtain = null;
  }

  preload() {
    this.load.image("bg", "assets/images/background.png");

    // Optional sound effects
    // this.load.audio("vote_sound", "assets/audio/vote.mp3");
    // this.load.audio("elimination_sound", "assets/audio/elimination.mp3");
  }

  create() {
    // Guard clause for invalid game state
    if (!GameManager.playerList || GameManager.playerList.length === 0) {
      console.warn("No players found in DayPhase. Returning to MainMenu.");
      this.scene.start("MainMenu");
      return;
    }

    // 🖼️ Background
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "bg")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setAlpha(0.3);

    // 📅 Phase Header
    this.phaseHeader = this.add
      .text(this.scale.width / 2, 50, "☀️ DAY PHASE - VOTING TIME", {
        fontSize: "32px",
        fontFamily: "Poppins",
        color: "#ffcc00",
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

    // 📝 Instructions Text
    this.instructionText = this.add
      .text(this.scale.width / 2, 140, "", {
        fontSize: "28px",
        fontFamily: "Poppins",
        color: "#ffffff",
        wordWrap: { width: 640 },
        align: "center",
      })
      .setOrigin(0.5);

    // 🎭 Privacy curtain for secret voting
    this.createPrivacyCurtain();

    // Initialize voting data
    this.initializeVoting();
    this.startVotingPhase();
  }

  createPrivacyCurtain() {
    // Create a full-screen overlay for privacy
    this.privateCurtain = this.add.container(0, 0);

    // Black background
    const curtainBg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.95
    );

    // Privacy message
    const privacyText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 - 100,
        "🔒 PRIVATE VOTING\n\nOthers: Please look away!\n\nVoter: Make your selection",
        {
          fontSize: "32px",
          fontFamily: "Poppins",
          color: "#ffffff",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Warning icons
    const leftEye = this.add
      .text(this.scale.width / 4, this.scale.height / 2 + 100, "👁️", {
        fontSize: "64px",
      })
      .setOrigin(0.5);

    const rightEye = this.add
      .text((3 * this.scale.width) / 4, this.scale.height / 2 + 100, "👁️", {
        fontSize: "64px",
      })
      .setOrigin(0.5);

    // Add pulsing animation to eyes
    this.tweens.add({
      targets: [leftEye, rightEye],
      alpha: 0.3,
      scale: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.privateCurtain.add([curtainBg, privacyText, leftEye, rightEye]);
    this.privateCurtain.setVisible(false);
  }

  initializeVoting() {
    // Filter alive players and store their original indices
    this.alivePlayers = GameManager.playerList
      .map((player, index) => ({ ...player, originalIndex: index }))
      .filter((p) => p.isAlive);

    // Initialize vote arrays
    this.votes = new Array(GameManager.playerList.length).fill(0);
    this.voteHistory = [];
    this.currentVoter = 0;

    // Check if there are enough players to vote
    if (this.alivePlayers.length < 2) {
      this.handleInsufficientPlayers();
      return false;
    }

    return true;
  }

  handleInsufficientPlayers() {
    this.instructionText.setText(
      "⚠️ Not enough players alive to hold a vote!\nProceeding to night phase..."
    );
    this.time.delayedCall(2000, () => {
      this.scene.start("NightPhase");
    });
  }

  startVotingPhase() {
    this.phaseState = "voting";
    this.updateProgress();
    this.showPassDevicePrompt();
  }

  showPassDevicePrompt() {
    if (this.currentVoter >= this.alivePlayers.length) {
      this.resolveVote();
      return;
    }

    this.isVotingLocked = false;
    this.privateCurtain.setVisible(false);

    const voter = this.alivePlayers[this.currentVoter];

    this.instructionText.setText(
      `📱 Pass the device to:\n\n${voter.name}\n\n🔒 Tap when you have the device and are ready to vote privately`
    );

    this.cleanupButtons();

    // Create "I'm Ready" button
    const readyBtn = this.add
      .text(this.scale.width / 2, 400, "🗳️ I'm Ready to Vote", {
        fontSize: "28px",
        fontFamily: "Poppins",
        color: "#ffffff",
        backgroundColor: "#4444ff",
        padding: { x: 30, y: 15 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Button hover effects
    readyBtn.on("pointerover", () => {
      readyBtn.setStyle({ backgroundColor: "#6666ff" });
    });

    readyBtn.on("pointerout", () => {
      readyBtn.setStyle({ backgroundColor: "#4444ff" });
    });

    readyBtn.on("pointerdown", () => {
      this.showPrivateVoting(voter);
    });

    this.buttons.push(readyBtn);
  }

  showPrivateVoting(voter) {
    // Show privacy curtain
    this.privateCurtain.setVisible(true);
    this.cleanupButtons();

    // Wait a moment then show voting options
    this.time.delayedCall(1500, () => {
      this.showVotingOptions(voter);
    });
  }

  showVotingOptions(voter) {
    this.privateCurtain.setVisible(false);
    this.isVotingLocked = false;

    this.instructionText.setText(
      `🗳️ ${voter.name}, choose someone to eliminate:\n\n` +
        `(Your vote is secret until results are revealed)`
    );

    this.showVoteButtons(voter);
  }

  updateProgress() {
    if (this.phaseState === "voting") {
      this.progressText.setText(
        `Voter ${this.currentVoter + 1} of ${this.alivePlayers.length}`
      );
    } else {
      this.progressText.setText("Tallying votes...");
    }
  }

  showVoteButtons(voter) {
    this.cleanupButtons();

    let yPos = 350;
    const buttonSpacing = 55;

    // Create voting buttons for all alive players except the voter
    this.alivePlayers.forEach((candidate) => {
      if (candidate.originalIndex === voter.originalIndex) return; // Skip self-vote

      const btn = this.add
        .text(this.scale.width / 2, yPos, `🗳️ ${candidate.name}`, {
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
        if (!this.isVotingLocked) {
          btn.setStyle({ backgroundColor: "#666666", color: "#ffff00" });
        }
      });

      btn.on("pointerout", () => {
        if (!this.isVotingLocked) {
          btn.setStyle({ backgroundColor: "#444444", color: "#ffffff" });
        }
      });

      // Vote handling
      btn.on("pointerdown", () => {
        if (this.isVotingLocked) return;
        this.castVote(voter, candidate, btn);
      });

      this.buttons.push(btn);
      yPos += buttonSpacing;
    });

    // Add abstain option
    const abstainBtn = this.add
      .text(this.scale.width / 2, yPos + 20, "🚫 Abstain", {
        fontSize: "20px",
        fontFamily: "Poppins",
        color: "#888888",
        backgroundColor: "#333333",
        padding: { x: 20, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    abstainBtn.on("pointerover", () => {
      if (!this.isVotingLocked) {
        abstainBtn.setStyle({ backgroundColor: "#555555" });
      }
    });

    abstainBtn.on("pointerout", () => {
      if (!this.isVotingLocked) {
        abstainBtn.setStyle({ backgroundColor: "#333333" });
      }
    });

    abstainBtn.on("pointerdown", () => {
      if (this.isVotingLocked) return;
      this.castVote(voter, null, abstainBtn);
    });

    this.buttons.push(abstainBtn);
  }

  castVote(voter, candidate, button) {
    this.isVotingLocked = true;

    // Visual feedback
    button.setStyle({ backgroundColor: "#00aa00", color: "#ffffff" });

    // Record the vote (secretly)
    if (candidate) {
      this.votes[candidate.originalIndex]++;
      this.voteHistory.push({
        voter: voter.name,
        target: candidate.name,
        targetIndex: candidate.originalIndex,
      });
    } else {
      this.voteHistory.push({
        voter: voter.name,
        target: "Abstain",
        targetIndex: -1,
      });
    }

    // Optional: Play vote sound
    // if (this.sound.get("vote_sound")) {
    //   this.sound.play("vote_sound", { volume: 0.3 });
    // }

    // Show confirmation and privacy screen
    this.showVoteConfirmation(voter);
  }

  showVoteConfirmation(voter) {
    this.cleanupButtons();

    this.instructionText.setText(
      `✅ Vote recorded!\n\n🔒 Your vote is secret until all votes are cast.`
    );

    // Create continue button
    const continueBtn = this.add
      .text(this.scale.width / 2, 450, "Continue to Next Voter", {
        fontSize: "24px",
        fontFamily: "Poppins",
        color: "#ffffff",
        backgroundColor: "#00aa44",
        padding: { x: 25, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    continueBtn.on("pointerover", () => {
      continueBtn.setStyle({ backgroundColor: "#00cc55" });
    });

    continueBtn.on("pointerout", () => {
      continueBtn.setStyle({ backgroundColor: "#00aa44" });
    });

    continueBtn.on("pointerdown", () => {
      this.moveToNextVoter();
    });

    this.buttons.push(continueBtn);
  }

  moveToNextVoter() {
    this.currentVoter++;

    if (this.currentVoter >= this.alivePlayers.length) {
      this.resolveVote();
    } else {
      // Show device passing screen
      this.showDevicePassing();
    }
  }

  showDevicePassing() {
    this.cleanupButtons();
    this.privateCurtain.setVisible(true);

    // Brief transition message
    this.time.delayedCall(2000, () => {
      this.showPassDevicePrompt();
    });
  }

  resolveVote() {
    this.phaseState = "summary";
    this.cleanupButtons();
    this.privateCurtain.setVisible(false);
    this.updateProgress();

    // Find players with maximum votes
    const maxVotes = Math.max(...this.votes);
    const eliminatedCandidates = [];

    this.votes.forEach((voteCount, index) => {
      if (voteCount === maxVotes && voteCount > 0) {
        const player = GameManager.playerList[index];
        if (player && player.isAlive) {
          eliminatedCandidates.push({ player, index, voteCount });
        }
      }
    });

    this.handleEliminationResult(eliminatedCandidates, maxVotes);
  }

  handleEliminationResult(eliminatedCandidates, maxVotes) {
    let summary = "📊 VOTING RESULTS REVEALED!\n\n";

    // Show vote counts for all players who received votes
    const playersWithVotes = [];
    this.votes.forEach((voteCount, index) => {
      if (voteCount > 0) {
        const player = GameManager.playerList[index];
        if (player) {
          playersWithVotes.push({ name: player.name, votes: voteCount });
        }
      }
    });

    // Sort by vote count (descending)
    playersWithVotes.sort((a, b) => b.votes - a.votes);

    playersWithVotes.forEach(({ name, votes }) => {
      summary += `🗳️ ${name}: ${votes} vote${votes !== 1 ? "s" : ""}\n`;
    });

    // Handle elimination logic
    if (eliminatedCandidates.length === 0 || maxVotes === 0) {
      summary += "\n⚖️ No elimination - no votes cast or tie at zero votes";
      GameManager.eliminatedPlayerIndex = -1;
    } else if (eliminatedCandidates.length === 1) {
      const eliminated = eliminatedCandidates[0];
      summary += `\n❌ ELIMINATED: ${eliminated.player.name}`;
      GameManager.eliminatedPlayerIndex = eliminated.index;
    } else {
      // Handle ties - could implement tiebreaker or random selection
      summary += `\n⚖️ TIE VOTE - Multiple players tied with ${maxVotes} votes`;
      // For now, eliminate the first tied player (could be randomized)
      const eliminated = eliminatedCandidates[0];
      summary += `\n🎲 Random elimination: ${eliminated.player.name}`;
      GameManager.eliminatedPlayerIndex = eliminated.index;
    }

    this.displayVoteSummary(summary);
  }

  displayVoteSummary(summary) {
    // Clear previous content
    this.instructionText.setText("");

    // Create summary display
    if (this.voteSummaryText) this.voteSummaryText.destroy();
    this.voteSummaryText = this.add
      .text(this.scale.width / 2, 300, summary, {
        fontSize: "22px",
        fontFamily: "Poppins",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 600 },
      })
      .setOrigin(0.5);

    // Show detailed vote history (now revealed)
    this.showDetailedVoteHistory();

    // Create continue button
    this.createContinueButton();
  }

  showDetailedVoteHistory() {
    if (this.voteHistory.length === 0) return;

    let historyText = "\n📝 How Everyone Voted:\n";
    this.voteHistory.forEach((vote, index) => {
      historyText += `${index + 1}. ${vote.voter} voted for ${vote.target}\n`;
    });

    if (this.voteHistoryText) this.voteHistoryText.destroy();
    this.voteHistoryText = this.add
      .text(this.scale.width / 2, 500, historyText, {
        fontSize: "16px",
        fontFamily: "Poppins",
        color: "#cccccc",
        align: "center",
        wordWrap: { width: 500 },
      })
      .setOrigin(0.5);
  }

  createContinueButton() {
    if (this.continueBtn) this.continueBtn.destroy();

    this.continueBtn = this.add
      .text(
        this.scale.width / 2,
        this.scale.height - 100,
        "Continue to Results ▶️",
        {
          fontSize: "28px",
          color: "#ffffff",
          backgroundColor: "#00aa44",
          fontFamily: "Poppins",
          padding: { x: 30, y: 15 },
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.continueBtn.on("pointerover", () => {
      this.continueBtn.setStyle({ backgroundColor: "#00cc55" });
    });

    this.continueBtn.on("pointerout", () => {
      this.continueBtn.setStyle({ backgroundColor: "#00aa44" });
    });

    this.continueBtn.on("pointerdown", () => {
      this.continueBtn.disableInteractive().setAlpha(0.6);
      this.finalizeElimination();
    });
  }

  finalizeElimination() {
    this.phaseState = "eliminating";

    // Apply elimination if there is one
    if (GameManager.eliminatedPlayerIndex >= 0) {
      const eliminatedPlayer =
        GameManager.playerList[GameManager.eliminatedPlayerIndex];
      if (eliminatedPlayer && eliminatedPlayer.isAlive) {
        eliminatedPlayer.isAlive = false;

        // Optional: Play elimination sound
        // if (this.sound.get("elimination_sound")) {
        //   this.sound.play("elimination_sound", { volume: 0.5 });
        // }
      }
    }

    // Check for win conditions
    const winResult = PhaseManager.checkWin();
    if (winResult && winResult !== "") {
      GameManager.winMessage = winResult;
      this.scene.start("GameOver");
    } else {
      // Continue to night phase
      this.time.delayedCall(1000, () => {
        this.scene.start("NightPhase");
      });
    }
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
}
