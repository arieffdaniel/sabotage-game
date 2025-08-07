// Enhanced PhaseManager.js with advanced mechanics
import GameManager from "./GameManager.js";

export default class PhaseManager {
  static nightActions = [];
  static dayEvents = [];
  static gameModifiers = [];

  // Enhanced night resolution with complex interactions
  static resolveNight() {
    console.log("🌙 Resolving night actions...");

    // Sort actions by priority
    this.nightActions.sort((a, b) => a.priority - b.priority);

    const results = [];

    // Process each action type
    this.nightActions.forEach((action) => {
      const result = this.processNightAction(action);
      if (result) results.push(result);
    });

    // Apply all results
    results.forEach((result) => this.applyActionResult(result));

    // Check for special interactions
    this.checkSpecialInteractions();

    // Clear night actions
    this.nightActions = [];

    return results;
  }

  static processNightAction(action) {
    switch (action.type) {
      case "eliminate":
        return this.processElimination(action);
      case "protect":
        return this.processProtection(action);
      case "investigate":
        return this.processInvestigation(action);
      case "hack":
        return this.processHack(action);
      case "watch":
        return this.processWatch(action);
      case "block":
        return this.processBlock(action);
      case "invent":
        return this.processInvention(action);
      default:
        return null;
    }
  }

  static processElimination(action) {
    const target = GameManager.playerList[action.targetIndex];

    // Check if target is protected
    if (target.isProtected) {
      return {
        type: "elimination_blocked",
        actor: action.actor,
        target: target.name,
        message: `${target.name} was protected from elimination`,
      };
    }

    // Check if actor is blocked
    if (this.isPlayerBlocked(action.actorIndex)) {
      return {
        type: "action_blocked",
        actor: action.actor,
        message: `${action.actor} was blocked from acting`,
      };
    }

    return {
      type: "elimination",
      actor: action.actor,
      target: target.name,
      targetIndex: action.targetIndex,
      message: `${target.name} was eliminated`,
    };
  }

  static processProtection(action) {
    const target = GameManager.playerList[action.targetIndex];
    target.isProtected = true;

    return {
      type: "protection",
      actor: action.actor,
      target: target.name,
      message: `${target.name} is protected tonight`,
    };
  }

  static processInvestigation(action) {
    const target = GameManager.playerList[action.targetIndex];
    const isEvil = target.team === "evil";

    // Check for hacker interference
    const hackedResult = this.checkHackedInvestigation(action.targetIndex);
    const result = hackedResult !== null ? hackedResult : isEvil;

    return {
      type: "investigation",
      actor: action.actor,
      actorIndex: action.actorIndex,
      target: target.name,
      result: result,
      message: `Investigation: ${target.name} is ${
        result ? "SUSPICIOUS" : "INNOCENT"
      }`,
    };
  }

  static processHack(action) {
    // Store hack for investigation interference
    GameManager.hackedTargets = GameManager.hackedTargets || [];
    GameManager.hackedTargets.push({
      target: action.targetIndex,
      fakeResult: action.fakeResult || false,
    });

    return {
      type: "hack",
      actor: action.actor,
      target: GameManager.playerList[action.targetIndex].name,
      message: "Investigation results have been compromised",
    };
  }

  static processWatch(action) {
    const target = GameManager.playerList[action.targetIndex];

    // Find who the target visits
    const targetAction = this.nightActions.find(
      (a) => a.actorIndex === action.targetIndex
    );
    const visited = targetAction
      ? GameManager.playerList[targetAction.targetIndex]
      : null;

    return {
      type: "watch",
      actor: action.actor,
      actorIndex: action.actorIndex,
      target: target.name,
      visited: visited ? visited.name : "No one",
      message: `${target.name} visited ${visited ? visited.name : "no one"}`,
    };
  }

  static processBlock(action) {
    const target = GameManager.playerList[action.targetIndex];
    target.isBlocked = true;

    return {
      type: "block",
      actor: action.actor,
      target: target.name,
      message: `${target.name} was blocked from acting`,
    };
  }

  static processInvention(action) {
    const inventor = GameManager.playerList[action.actorIndex];
    const invention = action.inventionType;

    GameManager.inventions = GameManager.inventions || [];
    GameManager.inventions.push({
      type: invention,
      creator: inventor.name,
      active: true,
    });

    return {
      type: "invention",
      actor: action.actor,
      invention: invention,
      message: `${inventor.name} created a ${invention}`,
    };
  }

  // Helper methods
  static isPlayerBlocked(playerIndex) {
    return GameManager.playerList[playerIndex]?.isBlocked || false;
  }

  static checkHackedInvestigation(targetIndex) {
    const hackedTargets = GameManager.hackedTargets || [];
    const hack = hackedTargets.find((h) => h.target === targetIndex);
    return hack ? hack.fakeResult : null;
  }

  static applyActionResult(result) {
    switch (result.type) {
      case "elimination":
        GameManager.playerList[result.targetIndex].isAlive = false;
        break;
      case "investigation":
        const investigator = GameManager.playerList[result.actorIndex];
        investigator.notes = investigator.notes || [];
        investigator.notes.push({
          night: GameManager.roundNumber,
          target: result.target,
          result: result.result ? "SUSPICIOUS" : "INNOCENT",
        });
        break;
      case "watch":
        const watcher = GameManager.playerList[result.actorIndex];
        watcher.notes = watcher.notes || [];
        watcher.notes.push({
          night: GameManager.roundNumber,
          target: result.target,
          visited: result.visited,
        });
        break;
    }
  }

  static checkSpecialInteractions() {
    // Clear temporary effects
    GameManager.playerList.forEach((player) => {
      player.isProtected = false;
      player.isBlocked = false;
    });

    // Clear hacked results after use
    GameManager.hackedTargets = [];
  }

  // Enhanced win condition checking
  static checkWin() {
    const alivePlayers = GameManager.playerList.filter((p) => p.isAlive);
    const aliveEvil = alivePlayers.filter((p) => p.team === "evil");
    const aliveGood = alivePlayers.filter((p) => p.team === "good");

    // Check for special win conditions
    if (this.checkSpecialWinConditions(alivePlayers)) {
      return GameManager.winMessage;
    }

    // Standard win conditions
    if (aliveEvil.length === 0) {
      GameManager.winMessage = "🎉 Good Team Wins! All saboteurs eliminated!";
      return GameManager.winMessage;
    }

    if (aliveEvil.length >= aliveGood.length) {
      GameManager.winMessage =
        "💀 Evil Team Wins! Saboteurs control the facility!";
      return GameManager.winMessage;
    }

    if (alivePlayers.length <= 2) {
      GameManager.winMessage = "⚖️ Draw! Too few players remain!";
      return GameManager.winMessage;
    }

    return "";
  }

  static checkSpecialWinConditions(alivePlayers) {
    // Innovator conversion win
    const innovator = alivePlayers.find((p) => p.role === "Innovator");
    if (innovator && innovator.team === "evil") {
      const aliveEvil = alivePlayers.filter((p) => p.team === "evil");
      const aliveGood = alivePlayers.filter((p) => p.team === "good");

      if (aliveEvil.length >= aliveGood.length) {
        GameManager.winMessage =
          "🔧 Evil Wins! The converted Innovator sealed the victory!";
        return true;
      }
    }

    return false;
  }

  // Day phase enhancements
  static processDayPhase() {
    // Add daily events, special votes, etc.
    this.generateDayEvent();
  }

  static generateDayEvent() {
    const events = [
      {
        name: "Power Outage",
        description: "Votes are anonymous this round",
        effect: "anonymous_voting",
      },
      {
        name: "Emergency Meeting",
        description: "Double elimination this round",
        effect: "double_elimination",
      },
      {
        name: "Lockdown",
        description: "No one can be eliminated",
        effect: "no_elimination",
      },
    ];

    // 10% chance of random event
    if (Math.random() < 0.1) {
      const event = Phaser.Utils.Array.GetRandom(events);
      this.dayEvents.push(event);
      return event;
    }

    return null;
  }
}
