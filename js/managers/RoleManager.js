import GameManager from "./GameManager.js";

export default class RoleManager {
  // Complete role definitions matching your card game
  static roleDefinitions = {
    Saboteur: {
      team: "evil",
      priority: 1,
      abilities: ["eliminate"],
      description:
        "Can sabotage (eliminate) one student per night. Wins if they outnumber others.",
      cardColor: "#ff4444",
      emoji: "💀",
      image: "saboteur_card.jpg",
    },

    "STEM Student": {
      team: "good",
      priority: 8,
      abilities: ["vote"],
      description:
        "Regular players who vote to remove the Saboteur. Use logic, reasoning, and teamwork to find the culprit.",
      cardColor: "#4444ff",
      emoji: "🎓",
      image: "stem_students_card.jpg",
    },

    "Medic (Biology Major)": {
      team: "good",
      priority: 2,
      abilities: ["protect"],
      description: "Can save one student per night from being sabotaged.",
      cardColor: "#44ff44",
      emoji: "🛡️",
      image: "medic_card.jpg",
      spaceTimeReset: true,
    },

    "Investigator (Forensic Scientist)": {
      team: "good",
      priority: 3,
      abilities: ["investigate"],
      description:
        "Can investigate one person per night to determine if they're the Saboteur.",
      cardColor: "#6666ff",
      emoji: "🔍",
      image: "investigator_card.jpg",
    },

    "Professor (STEM Teacher)": {
      team: "good",
      priority: 4,
      abilities: ["silence", "quantum_swap"],
      description:
        "Can silence (mute) one person during the day, preventing them from talking or voting that round.",
      cardColor: "#ff6600",
      emoji: "📚",
      image: "professor_card.jpg",
      quantumSwap: true,
    },

    "Innovator (Engineer)": {
      team: "good",
      priority: 5,
      abilities: ["invent"],
      description:
        "If the Saboteur is removed in Round 2 or 4, they invent a new strategy and secretly become the new Saboteur!",
      cardColor: "#ffaa00",
      emoji: "🔧",
      image: "innovator_card.jpg",
      convertible: true,
    },

    "Student Council President": {
      team: "moderator",
      priority: 0,
      abilities: ["moderate"],
      description: "The moderator, who runs the game and announces events.",
      cardColor: "#666666",
      emoji: "🎤",
      image: "president_card.jpg",
    },
  };

  // Card game role distribution rules
  static generateRoleDistribution(playerCount) {
    const roles = [];

    if (playerCount < 5 || playerCount > 10) {
      throw new Error("Player count must be between 5-10");
    }

    // Always 1 Saboteur
    roles.push("Saboteur");

    // Essential good roles
    roles.push("Medic (Biology Major)");
    roles.push("Investigator (Forensic Scientist)");

    // Add Professor for 6+ players
    if (playerCount >= 6) {
      roles.push("Professor (STEM Teacher)");
    }

    // Add Innovator for 7+ players
    if (playerCount >= 7) {
      roles.push("Innovator (Engineer)");
    }

    // Fill remaining with STEM Students
    while (roles.length < playerCount) {
      roles.push("STEM Student");
    }

    return roles;
  }

  static assignRoles() {
    const playerCount = GameManager.playerList.length;
    const roles = this.generateRoleDistribution(playerCount);

    // PROPER RANDOMIZATION: Use crypto.getRandomValues for true randomness
    const shuffledRoles = this.cryptoShuffle([...roles]);

    GameManager.playerList.forEach((player, index) => {
      const roleName = shuffledRoles[index];
      const roleInfo = this.roleDefinitions[roleName];

      player.role = roleName;
      player.team = roleInfo.team;
      player.abilities = [...roleInfo.abilities];
      player.description = roleInfo.description;
      player.cardColor = roleInfo.cardColor;
      player.emoji = roleInfo.emoji;
      player.image = roleInfo.image;

      // Special role properties
      player.spaceTimeReset = roleInfo.spaceTimeReset || false;
      player.quantumSwap = roleInfo.quantumSwap || false;
      player.convertible = roleInfo.convertible || false;

      // Initialize role-specific counters
      player.hasUsedAbility = false;
      player.notes = [];
      player.isSilenced = false;
      player.isProtected = false;
      player.wasConverted = false;
    });

    // Set up special relationships
    this.setupSpecialKnowledge();

    console.log(
      "Roles assigned:",
      GameManager.playerList.map((p) => `${p.name}: ${p.role}`)
    );
  }

  // Cryptographically secure shuffle algorithm (Fisher-Yates with crypto randomness)
  static cryptoShuffle(array) {
    const shuffled = [...array];

    // Use crypto.getRandomValues for true randomness if available
    const getRandomInt = (max) => {
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const randomArray = new Uint32Array(1);
        crypto.getRandomValues(randomArray);
        return randomArray[0] % max;
      } else {
        // Fallback to enhanced Math.random
        return Math.floor(Math.random() * max);
      }
    };

    // Fisher-Yates shuffle with crypto random
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  // Alternative secure shuffle using multiple entropy sources
  static enhancedShuffle(array) {
    const shuffled = [...array];

    // Combine multiple entropy sources
    const getEnhancedRandom = () => {
      let entropy = 0;

      // Time-based entropy
      entropy += Date.now() % 1000000;

      // Performance entropy (if available)
      if (typeof performance !== "undefined") {
        entropy += performance.now() * 1000;
      }

      // Math.random entropy
      entropy += Math.random() * 1000000;

      // Mouse/touch entropy (if available)
      if (typeof window !== "undefined" && window.lastPointerEvent) {
        entropy += window.lastPointerEvent.x + window.lastPointerEvent.y;
      }

      return (entropy % 1000000) / 1000000;
    };

    // Enhanced Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(getEnhancedRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  static setupSpecialKnowledge() {
    // Professor knows Innovator (from card game rules)
    const professor = GameManager.playerList.find(
      (p) => p.role === "Professor (STEM Teacher)"
    );
    const innovator = GameManager.playerList.find(
      (p) => p.role === "Innovator (Engineer)"
    );

    if (professor && innovator) {
      professor.knownPlayers = professor.knownPlayers || [];
      professor.knownPlayers.push({
        name: innovator.name,
        role: "Innovator (Engineer)",
        confirmed: true,
      });
    }
  }

  // Innovator conversion mechanic (Rounds 2 and 4)
  static handleInnovatorConversion() {
    if (GameManager.roundNumber !== 2 && GameManager.roundNumber !== 4) {
      return false;
    }

    const innovator = GameManager.playerList.find(
      (p) => p.role === "Innovator (Engineer)" && p.isAlive && !p.wasConverted
    );

    if (!innovator) return false;

    // Check if Saboteur was just eliminated
    const eliminatedPlayer =
      GameManager.playerList[GameManager.eliminatedPlayerIndex];
    if (eliminatedPlayer && eliminatedPlayer.role === "Saboteur") {
      // Convert Innovator to new Saboteur
      innovator.role = "Saboteur";
      innovator.team = "evil";
      innovator.abilities = ["eliminate"];
      innovator.description =
        "The new Saboteur! You've invented a new strategy.";
      innovator.wasConverted = true;

      console.log(`${innovator.name} converted from Innovator to Saboteur!`);
      return true;
    }

    return false;
  }

  // Professor silencing ability
  static canSilencePlayer(professorPlayer, targetPlayer) {
    if (
      !professorPlayer ||
      professorPlayer.role !== "Professor (STEM Teacher)"
    ) {
      return false;
    }
    if (!targetPlayer || !targetPlayer.isAlive || targetPlayer.isSilenced) {
      return false;
    }
    return true;
  }

  static silencePlayer(targetIndex) {
    if (targetIndex >= 0 && targetIndex < GameManager.playerList.length) {
      const player = GameManager.playerList[targetIndex];
      player.isSilenced = true;
      return true;
    }
    return false;
  }

  // Quantum Swap ability
  static performQuantumSwap(player1Index, player2Index) {
    if (
      player1Index < 0 ||
      player2Index < 0 ||
      player1Index >= GameManager.playerList.length ||
      player2Index >= GameManager.playerList.length ||
      player1Index === player2Index
    ) {
      return false;
    }

    const player1 = GameManager.playerList[player1Index];
    const player2 = GameManager.playerList[player2Index];

    if (!player1.isAlive || !player2.isAlive) return false;

    // Swap roles
    const tempRole = player1.role;
    const tempTeam = player1.team;
    const tempAbilities = player1.abilities;
    const tempDescription = player1.description;

    player1.role = player2.role;
    player1.team = player2.team;
    player1.abilities = player2.abilities;
    player1.description = player2.description;

    player2.role = tempRole;
    player2.team = tempTeam;
    player2.abilities = tempAbilities;
    player2.description = tempDescription;

    console.log(`Quantum Swap: ${player1.name} ↔ ${player2.name}`);
    return true;
  }

  // Space-Time Reset (Medic revival)
  static canUseSpaceTimeReset() {
    const medic = GameManager.playerList.find(
      (p) =>
        p.role === "Medic (Biology Major)" &&
        !p.isAlive &&
        p.spaceTimeReset &&
        !p.hasUsedSpaceTimeReset
    );
    return !!medic;
  }

  static useSpaceTimeReset() {
    const medic = GameManager.playerList.find(
      (p) =>
        p.role === "Medic (Biology Major)" &&
        !p.isAlive &&
        p.spaceTimeReset &&
        !p.hasUsedSpaceTimeReset
    );

    if (!medic) return null;

    // Find a random eliminated player to revive
    const eliminatedPlayers = GameManager.playerList.filter(
      (p) => !p.isAlive && p !== medic
    );
    if (eliminatedPlayers.length === 0) return null;

    const revivedPlayer =
      eliminatedPlayers[Math.floor(Math.random() * eliminatedPlayers.length)];
    revivedPlayer.isAlive = true;
    medic.hasUsedSpaceTimeReset = true;

    console.log(`Space-Time Reset: ${revivedPlayer.name} has been revived!`);
    return revivedPlayer;
  }

  // Utility methods
  static getRoleInfo(roleName) {
    return this.roleDefinitions[roleName] || null;
  }

  static shuffleArray(array) {
    // Use the enhanced crypto shuffle by default
    return this.cryptoShuffle(array);
  }

  // Clear temporary effects between rounds
  static clearTemporaryEffects() {
    GameManager.playerList.forEach((player) => {
      player.isSilenced = false;
      player.isProtected = false;
    });
  }

  // Get all players by team
  static getPlayersByTeam(team) {
    return GameManager.playerList.filter((p) => p.team === team && p.isAlive);
  }

  // Check if special round mechanics should trigger
  static shouldTriggerSTEMDisaster() {
    return GameManager.roundNumber % 3 === 0; // Every 3rd round
  }

  static shouldAllowInnovatorConversion() {
    return GameManager.roundNumber === 2 || GameManager.roundNumber === 4;
  }

  // Add entropy from user interactions
  static addUserEntropy(x, y) {
    if (typeof window !== "undefined") {
      window.lastPointerEvent = { x, y, timestamp: Date.now() };
    }
  }

  // Initialize entropy collection
  static initializeEntropyCollection() {
    if (typeof window !== "undefined") {
      // Collect mouse/touch events for entropy
      window.addEventListener("pointermove", (e) => {
        this.addUserEntropy(e.clientX, e.clientY);
      });

      window.addEventListener("touchmove", (e) => {
        if (e.touches.length > 0) {
          this.addUserEntropy(e.touches[0].clientX, e.touches[0].clientY);
        }
      });
    }
  }
}
