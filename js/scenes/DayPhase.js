import GameManager from "../managers/GameManager.js";
import GameUtils from "../managers/GameUtils.js";
import PhaseManager from "../managers/PhaseManager.js";

export default class DayPhase extends Phaser.Scene {
  constructor() {
    super("DayPhase");
    this.votes = [];
    this.currentVoter = 0;
    this.voteHistory = [];
    this.isVotingActive = false;
    this.buttons = [];
  }

  preload() {
    this.load.image("bg", "assets/images/background.png");

    // Optional sound effects
    // this.load.audio("vote_sound", "assets/audio/vote.mp3");
    // this.load.audio("elimination_sound", "assets/audio/elimination.mp3");
  }

  create() {
    // ✨ IMPROVED: Better validation
    if (!GameManager.isValidGameState()) {
      console.warn("Invalid game state in DayPhase");
      GameUtils.fadeToScene(this, "MainMenu");
      return;
    }

    this.setupUI();
    if (!this.initializeVoting()) {
      return; // Stop if initialization fails
    }
  }

  setupUI() {
    // Background
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "bg")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setAlpha(0.3);

    // ✨ IMPROVED: Use GameUtils for consistent text
    this.phaseHeader = GameUtils.centerText(
      this,
      "☀️ DAY PHASE - VOTING TIME",
      50,
      {
        fontSize: "32px",
        color: "#ffcc00",
        stroke: "#000000",
        strokeThickness: 2,
      }
    );

    this.instructionText = GameUtils.centerText(this, "", 140, {
      fontSize: "28px",
      wordWrap: { width: 640 },
      align: "center",
    });

    this.progressText = GameUtils.centerText(this, "", 90, {
      fontSize: "18px",
      color: "#cccccc",
    });
  }

  initializeVoting() {
    // ✨ IMPROVED: Use GameManager helper
    this.alivePlayers = GameManager.getAlivePlayers();

    if (this.alivePlayers.length < 2) {
      this.handleInsufficientPlayers();
      return false;
    }

    this.votes = new Array(GameManager.playerList.length).fill(0);
    this.voteHistory = [];
    this.currentVoter = 0;
    this.isVotingActive = true;

    this.startVoting();
    return true;
  }

  handleInsufficientPlayers() {
    this.instructionText.setText(
      "⚠️ Not enough players alive to hold a vote!\nProceeding to night phase..."
    );
    this.time.delayedCall(2000, () => {
      GameUtils.fadeToScene(this, "NightPhase");
    });
  }

  startVoting() {
    if (this.currentVoter >= this.alivePlayers.length) {
      this.resolveVote();
      return;
    }

    const voter = this.alivePlayers[this.currentVoter];
    this.instructionText.setText(
      `🗳️ ${voter.name}, choose someone to eliminate:\n\n` +
        `(${this.currentVoter + 1}/${this.alivePlayers.length} votes cast)`
    );

    this.updateProgress();
    this.showVoteButtons();
  }

  updateProgress() {
    this.progressText.setText(
      `Voter ${this.currentVoter + 1} of ${this.alivePlayers.length}`
    );
  }

  showVoteButtons() {
    this.clearButtons();

    const voter = this.alivePlayers[this.currentVoter];
    const targets = this.alivePlayers.filter((p) => p.name !== voter.name);

    let yPos = 300;

    targets.forEach((target) => {
      const originalIndex = GameManager.playerList.findIndex(
        (p) => p.name === target.name
      );

      // ✨ IMPROVED: Use GameUtils for consistent buttons
      const button = GameUtils.createButton(
        this,
        this.scale.width / 2,
        yPos,
        `🔘 ${target.name}`,
        () => this.castVote(originalIndex),
        {
          fontSize: "24px",
          backgroundColor: "#444444",
          hoverColor: "#666666",
        }
      );

      this.buttons.push(button);
      yPos += 60;
    });

    // Abstain button
    const abstainBtn = GameUtils.createButton(
      this,
      this.scale.width / 2,
      yPos + 20,
      "🚫 Abstain",
      () => this.castVote(-1),
      {
        fontSize: "20px",
        backgroundColor: "#333333",
        hoverColor: "#555555",
      }
    );

    this.buttons.push(abstainBtn);
  }

  castVote(targetIndex) {
    if (!this.isVotingActive) return;

    const voter = this.alivePlayers[this.currentVoter];

    // Record vote
    if (targetIndex >= 0) {
      this.votes[targetIndex]++;
      const target = GameManager.playerList[targetIndex];
      this.voteHistory.push({
        voter: voter.name,
        target: target.name,
        targetIndex: targetIndex,
      });
    } else {
      this.voteHistory.push({
        voter: voter.name,
        target: "Abstain",
        targetIndex: -1,
      });
    }

    // ✨ IMPROVED: Safe sound playing
    GameUtils.playSound(this, "startBell", 0.3);

    this.currentVoter++;
    this.time.delayedCall(500, () => {
      this.startVoting();
    });
  }

  resolveVote() {
    this.isVotingActive = false;
    this.clearButtons();

    const maxVotes = Math.max(...this.votes);

    if (maxVotes === 0) {
      this.showResults("⚖️ No elimination - no votes cast");
      return;
    }

    // ✨ IMPROVED: Cleaner elimination logic
    const eliminatedCandidates = [];
    this.votes.forEach((voteCount, index) => {
      if (voteCount === maxVotes && GameManager.playerList[index].isAlive) {
        eliminatedCandidates.push({
          player: GameManager.playerList[index],
          index,
        });
      }
    });

    let resultMessage;
    let eliminatedPlayerIndex = -1; // Default to no elimination

    if (eliminatedCandidates.length === 1) {
      const eliminated = eliminatedCandidates[0];
      eliminatedPlayerIndex = eliminated.index;
      resultMessage = `❌ ELIMINATED: ${eliminated.player.name} (${maxVotes} votes)`;
    } else {
      // Handle tie
      const eliminated =
        eliminatedCandidates[
          Math.floor(Math.random() * eliminatedCandidates.length)
        ];
      eliminatedPlayerIndex = eliminated.index;
      resultMessage = `⚖️ Tie broken: ${eliminated.player.name} eliminated`;
    }

    this.showResults(resultMessage, eliminatedPlayerIndex);
  }

  showResults(message, eliminatedPlayerIndex = -1) {
    this.instructionText.setText(message);

    // ✨ IMPROVED: Use GameUtils for continue button
    const continueBtn = GameUtils.createButton(
      this,
      this.scale.width / 2,
      this.scale.height - 100,
      "Continue ▶️",
      () => this.proceedToNext(eliminatedPlayerIndex),
      {
        backgroundColor: "#00aa44",
        hoverColor: "#00cc55",
      }
    );

    this.buttons.push(continueBtn);
  }

  proceedToNext(eliminatedPlayerIndex) {
    // Apply elimination
    if (eliminatedPlayerIndex >= 0) {
      GameManager.eliminatedPlayerIndex = eliminatedPlayerIndex;
      const eliminatedPlayer = GameManager.playerList[eliminatedPlayerIndex];
      if (eliminatedPlayer) {
        eliminatedPlayer.isAlive = false;
      }
    } else {
      GameManager.eliminatedPlayerIndex = -1; // No one was eliminated
    }

    // Check for win conditions
    const winResult = PhaseManager.checkWin();
    if (winResult && winResult !== "") {
      GameManager.winMessage = winResult;
      GameUtils.fadeToScene(this, "GameOver");
    } else {
      GameUtils.fadeToScene(this, "NightPhase");
    }
  }

  clearButtons() {
    if (this.buttons) {
      this.buttons.forEach((btn) => btn.destroy());
      this.buttons = [];
    }
  }

  // ✨ IMPROVED: Better cleanup
  destroy() {
    this.clearButtons();
    super.destroy();
  }
}
