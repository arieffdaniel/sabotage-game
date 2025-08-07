export default class GameUtils {
  // Create consistent buttons across all scenes
  static createButton(scene, x, y, text, onClick, style = {}) {
    const defaultStyle = {
      fontSize: "24px",
      fontFamily: "Poppins",
      color: "#ffffff",
      backgroundColor: "#4444ff",
      padding: { x: 25, y: 12 },
    };

    const button = scene.add
      .text(x, y, text, { ...defaultStyle, ...style })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover effects
    button.on("pointerover", () => {
      button.setStyle({ backgroundColor: style.hoverColor || "#6666ff" });
      scene.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    button.on("pointerout", () => {
      button.setStyle({ backgroundColor: style.backgroundColor || "#4444ff" });
      scene.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    button.on("pointerdown", () => {
      // Click animation
      scene.tweens.add({
        targets: button,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: onClick,
      });
    });

    return button;
  }

  // Center text easily
  static centerText(scene, text, y, style = {}) {
    const defaultStyle = {
      fontSize: "24px",
      fontFamily: "Poppins",
      color: "#ffffff",
    };

    return scene.add
      .text(scene.cameras.main.centerX, y, text, { ...defaultStyle, ...style })
      .setOrigin(0.5);
  }

  // Smooth scene transitions
  static fadeToScene(scene, targetScene, duration = 500) {
    const overlay = scene.add.rectangle(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY,
      scene.cameras.main.width,
      scene.cameras.main.height,
      0x000000,
      0
    );

    scene.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: duration,
      onComplete: () => {
        scene.scene.start(targetScene);
      },
    });
  }

  // Safe sound playing
  static playSound(scene, soundKey, volume = 0.5) {
    try {
      if (scene.sound.get(soundKey)) {
        scene.sound.play(soundKey, { volume });
      }
    } catch (e) {
      console.warn(`Could not play sound: ${soundKey}`);
    }
  }

  // Enhanced loading with progress
  static setupLoadingBar(scene) {
    const { width, height } = scene.cameras.main;

    const progressBox = scene.add.graphics();
    const progressBar = scene.add.graphics();

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = GameUtils.centerText(
      scene,
      "Loading...",
      height / 2 - 60,
      {
        fontSize: "20px",
        color: "#ffffff",
      }
    );

    scene.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x4444ff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
    });

    scene.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    scene.load.on("fileerror", (key) => {
      console.warn(`Failed to load: ${key}`);
    });
  }
}
