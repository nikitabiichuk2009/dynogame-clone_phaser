import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.image("ground", "/assets/ground.png");
    this.load.image("cloud", "assets/cloud.png");
    this.load.spritesheet("dyno-run", "assets/dino-run.png", {
      frameHeight: 94,
      frameWidth: 88,
    });
    this.load.spritesheet("dyno-down", "assets/dino-down-2.png", {
      frameWidth: 118,
      frameHeight: 94,
    });
    this.load.spritesheet("enemy-bird", "assets/enemy-bird.png", {
      frameWidth: 92,
      frameHeight: 77,
    });
    this.load.image("dyno-hurt", "assets/dino-hurt.png");
    this.load.image("restart", "assets/restart.png");
    this.load.image("game-over", "assets/game-over.png");
    for (let i = 0; i < 6; i++) {
      this.load.image(`obstacle-${i + 1}`, `assets/cactuses_${i + 1}.png`);
    }
    this.load.audio("jump", "assets/jump.m4a");
    this.load.audio("hit", "assets/hit.m4a");
    this.load.audio("progress", "assets/reach.m4a");
  }

  create() {
    this.scene.start("PlayScene");
  }
}

export default PreloadScene;
