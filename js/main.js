import MainMenu from "./scenes/MainMenu.js";
import PlayerSetup from "./scenes/PlayerSetup.js";
import NameEntry from "./scenes/NameEntry.js";
import RoleReveal from "./scenes/RoleReveal.js";
import NightPhase from "./scenes/NightPhase.js";
import DayPhase from "./scenes/DayPhase.js";
import GameOver from "./scenes/GameOver.js";
import HowToPlay from "./scenes/HowToPlay.js";

// 🔧 Optional: Add HowToPlay or other future scenes here
// import HowToPlay from "./scenes/HowToPlay.js";

const config = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  backgroundColor: "#141414",
  scene: [
    MainMenu,
    PlayerSetup,
    NameEntry,
    RoleReveal,
    NightPhase,
    DayPhase,
    GameOver,
    HowToPlay,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
};

// 🚀 Launch the game
window.addEventListener("load", () => {
  window.game = new Phaser.Game(config);
});
