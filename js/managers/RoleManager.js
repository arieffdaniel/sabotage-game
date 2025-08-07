// Enhanced RoleManager.js with more complex abilities
import GameManager from "./GameManager.js";

export default class RoleManager {
  static roleDefinitions = {
    Saboteur: {
      team: "evil",
      priority: 1,
      abilities: ["eliminate"],
      description:
        "Eliminate students each night. Win when saboteurs equal or outnumber students.",
      tips: "Blend in during day phase. Coordinate with other saboteurs if multiple exist.",
    },

    Medic: {
      team: "good",
      priority: 2,
      abilities: ["protect", "heal"],
      description:
        "Protect someone from elimination. Can self-protect once per game.",
      tips: "Save your self-protect for crucial moments. Watch voting patterns.",
      limitedUses: { selfProtect: 1 },
    },

    Investigator: {
      team: "good",
      priority: 3,
      abilities: ["investigate", "track"],
      description:
        "Learn if someone is a saboteur. Can track who someone visited.",
      tips: "Investigate suspicious players. Share info carefully to avoid being targeted.",
      charges: 3, // Limited investigations
    },

    Professor: {
      team: "good",
      priority: 4,
      abilities: ["research", "mentor"],
      description:
        "Research voting patterns. Can mentor a student to give them an ability.",
      tips: "Use research to find inconsistencies. Mentor wisely.",
      special: "knows_innovator",
    },

    Innovator: {
      team: "good",
      priority: 5,
      abilities: ["invent", "convert"],
      description: "Create tools for the team. Can be converted by saboteurs.",
      tips: "Your inventions help everyone. Be careful of conversion attempts.",
      vulnerable: true,
    },

    Security: {
      // New role
      team: "good",
      priority: 6,
      abilities: ["watch", "block"],
      description: "Watch someone at night. Can block one person from acting.",
      tips: "Watch suspicious players. Block confirmed threats.",
    },

    Hacker: {
      // New saboteur role
      team: "evil",
      priority: 7,
      abilities: ["hack", "frame"],
      description: "Hack investigation results. Can frame innocent players.",
      tips: "Misdirect investigations. Frame active good players.",
    },

    "STEM Student": {
      team: "good",
      priority: 8,
      abilities: ["vote"],
      description:
        "No special abilities, but your vote matters. Pay attention to behavior.",
      tips: "Watch for suspicious behavior. Vote based on logic and evidence.",
    },
  };

  static assignRoles() {
    const playerCount = GameManager.playerList.length;
    const roles = this.generateRoleDistribution(playerCount);

    // Shuffle and assign
    const shuffledRoles = Phaser.Utils.Array.Shuffle([...roles]);

    GameManager.playerList.forEach((player, index) => {
      const role = shuffledRoles[index];
      player.role = role;
      player.abilities = [...this.roleDefinitions[role].abilities];
      player.team = this.roleDefinitions[role].team;

      // Initialize role-specific properties
      if (this.roleDefinitions[role].charges) {
        player.charges = this.roleDefinitions[role].charges;
      }

      if (this.roleDefinitions[role].limitedUses) {
        player.limitedUses = { ...this.roleDefinitions[role].limitedUses };
      }

      player.hasUsedAbility = false;
      player.notes = []; // For storing investigation results, etc.
    });

    // Set up special role knowledge (Professor knows Innovator)
    this.setupSpecialKnowledge();
  }

  static generateRoleDistribution(playerCount) {
    const roles = [];

    // Always have 1 saboteur for 5-7 players, 2 for 8-10
    const saboteurCount = playerCount <= 7 ? 1 : 2;

    // Add saboteurs
    for (let i = 0; i < saboteurCount; i++) {
      roles.push(i === 0 ? "Saboteur" : "Hacker");
    }

    // Essential good roles
    roles.push("Medic", "Investigator");

    // Add Professor and Innovator for larger games
    if (playerCount >= 6) {
      roles.push("Professor", "Innovator");
    }

    // Add Security for 8+ players
    if (playerCount >= 8) {
      roles.push("Security");
    }

    // Fill remaining with students
    while (roles.length < playerCount) {
      roles.push("STEM Student");
    }

    return roles;
  }

  static setupSpecialKnowledge() {
    const professor = GameManager.playerList.find(
      (p) => p.role === "Professor"
    );
    const innovator = GameManager.playerList.find(
      (p) => p.role === "Innovator"
    );

    if (professor && innovator) {
      professor.knownPlayers = professor.knownPlayers || [];
      professor.knownPlayers.push({
        name: innovator.name,
        role: "Innovator",
        confirmed: true,
      });
    }
  }

  static getRoleInfo(roleName) {
    return this.roleDefinitions[roleName] || null;
  }

  static canUseAbility(player, abilityName) {
    if (!player.abilities.includes(abilityName)) return false;

    // Check charges
    if (player.charges !== undefined && player.charges <= 0) return false;

    // Check limited uses
    if (player.limitedUses && player.limitedUses[abilityName] !== undefined) {
      return player.limitedUses[abilityName] > 0;
    }

    return true;
  }

  static useAbility(player, abilityName) {
    if (!this.canUseAbility(player, abilityName)) return false;

    // Consume charges
    if (player.charges !== undefined) {
      player.charges--;
    }

    // Consume limited uses
    if (player.limitedUses && player.limitedUses[abilityName] !== undefined) {
      player.limitedUses[abilityName]--;
    }

    return true;
  }
}
