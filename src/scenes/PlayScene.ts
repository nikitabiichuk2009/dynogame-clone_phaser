import Phaser from "phaser";
import { Player } from "../entities/Player";
import { GameScene } from "./GameScene";

class PlayScene extends GameScene {
  player: Player;
  ground: any;
  startTrigger: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  isGameRunning: boolean = false;
  spawnInterval: number = 1500;
  spawnTime: number = 0;
  gameSpeed: number = 7;
  score: number = 0;
  scoreInterval: number = 200;
  scoreDeltaTime: number = 0;
  scoreText: Phaser.GameObjects.Text;
  highestText: Phaser.GameObjects.Text;
  obstacles: Phaser.Physics.Arcade.Group;
  gameOverText: Phaser.GameObjects.Image;
  restartText: Phaser.GameObjects.Image;
  clouds: Phaser.GameObjects.Group;
  gameOverContainer: Phaser.GameObjects.Container;
  gameSpeedModifier: number = 1;
  highScore: number = 0;
  progressSound: Phaser.Sound.HTML5AudioSound;

  constructor() {
    super("PlayScene");
  }

  create() {
    this.highScore = Number(localStorage.getItem("highScore")) || 0;
    this.createEnvironment();
    this.progressSound = this.sound.add("progress", {
      volume: 0.3,
    }) as Phaser.Sound.HTML5AudioSound;
    this.createPlayer();
    this.createScore();
    this.createObstacles();
    this.createStartTrigger();
    this.createGameOverContainer();
    this.setupColliders();
    this.anims.create({
      key: "enemy-bird",
      frames: this.anims.generateFrameNumbers("enemy-bird"),
      frameRate: 6,
      repeat: -1,
    });
    this.setupEvents();
  }

  update(time: number, delta: number): void {
    if (!this.isGameRunning) return;
    this.spawnTime += delta;
    this.scoreDeltaTime += delta;
    if (this.scoreDeltaTime >= this.scoreInterval) {
      this.score++;
      if (this.score % 100 === 0) {
        this.gameSpeedModifier += 0.1;
        this.progressSound.play();
        this.tweens.add({
          targets: this.scoreText,
          duration: 100,
          repeat: 3,
          yoyo: true,
          alpha: 0,
        });
      }

      this.scoreDeltaTime = 0;
    }
    if (this.spawnTime > this.spawnInterval) {
      this.spawnTime = 0;
      this.spawnObstacle();
    }
    Phaser.Actions.IncX(
      this.obstacles.getChildren(),
      -this.gameSpeed * this.gameSpeedModifier
    );
    Phaser.Actions.IncX(
      this.clouds.getChildren(),
      -this.gameSpeed * this.gameSpeedModifier
    );

    const score = Array.from(String(this.score), Number);
    for (let i = 0; i < 9 - String(this.score).length; i++) {
      score.unshift(0);
    }
    this.scoreText.setText(score.join(""));
    this.obstacles
      .getChildren()
      .forEach(
        (obstacle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
          if (obstacle.getBounds().right < 0) {
            this.obstacles.remove(obstacle);
          }
        }
      );
    this.clouds
      .getChildren()
      .forEach((cloud: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
        if (cloud.getBounds().right < 0) {
          cloud.x = this.gameWidth + 30;
        }
      });
    this.ground.tilePositionX += this.gameSpeed;
  }

  createScore() {
    this.scoreText = this.add
      .text(this.gameWidth, 0, "000000000", {
        fontSize: "30px",
        color: "#000",
      })
      .setOrigin(1, 0)
      .setAlpha(0);
    const highScoreString = this.highScore.toString().padStart(9, "0");
    this.highestText = this.add
      .text(this.gameWidth - 300, 0, `Highest: ${highScoreString}`, {
        fontSize: "30px",
        color: "#000",
      })
      .setOrigin(1, 0)
      .setAlpha(0);
  }

  createEnvironment() {
    this.ground = this.add
      .tileSprite(0, this.gameHeight, 88, 26, "ground")
      .setOrigin(0, 1);

    this.clouds = this.add.group();
    this.clouds = this.clouds.addMultiple([
      this.add.image(this.gameWidth / 2, 170, "cloud"),
      this.add.image(this.gameWidth - 80, 80, "cloud"),
      this.add.image(this.gameWidth / 1.3, 100, "cloud"),
    ]);
    this.clouds.setAlpha(0);
  }

  createPlayer() {
    this.player = new Player(this, 0, this.gameHeight);
  }

  createObstacles() {
    this.obstacles = this.physics.add.group();
  }

  createStartTrigger() {
    this.startTrigger = this.physics.add
      .sprite(0, 10, null)
      .setOrigin(0, 1)
      .setAlpha(0);
  }

  createGameOverContainer() {
    this.gameOverText = this.add.image(0, 0, "game-over");
    this.restartText = this.add.image(0, 80, "restart").setInteractive();
    this.restartText.on("pointerdown", () => {
      this.restartGame();
    });
    this.gameOverContainer = this.add
      .container(this.gameWidth / 2, this.gameHeight / 2)
      .add([this.gameOverText, this.restartText])
      .setAlpha(0);
  }

  setupColliders() {
    this.physics.add.collider(this.obstacles, this.player, () => {
      this.endGame();
    });
  }

  setupEvents() {
    this.physics.add.overlap(this.startTrigger, this.player, () => {
      if (this.startTrigger.y === 10) {
        this.startTrigger.body.reset(0, this.gameHeight);
        return;
      }
      this.startTrigger.body.reset(9999, 9999);
      const rollOutEvent = this.time.addEvent({
        delay: 1000 / 60,
        loop: true,
        callback: () => {
          this.player.playRunAnimation();
          this.ground.width += 34;
          this.player.setVelocityX(80);
          if (this.ground.width >= this.gameWidth) {
            this.player.setVelocityX(0);
            rollOutEvent.remove();
            this.isGameRunning = true;
            this.clouds.setAlpha(1);
            this.scoreText.setAlpha(1);
            this.highestText.setAlpha(1);
          }
        },
      });
    });
  }

  restartGame() {
    this.physics.resume();
    this.player.setVelocityY(0);
    this.obstacles.clear(true, true);
    this.gameOverContainer.setAlpha(0);
    this.anims.resumeAll();
    this.isGameRunning = true;
    this.clouds.setAlpha(1);
    this.scoreText.setAlpha(1);
    this.highestText.setAlpha(1);
    this.score = 0;
    this.gameSpeedModifier = 1;
  }

  endGame() {
    this.isGameRunning = false;
    this.physics.pause();
    this.player.die();
    this.gameSpeed = 7;
    this.spawnTime = 0;
    this.spawnInterval = 1500;
    this.anims.pauseAll();
    this.gameOverContainer.setAlpha(1);
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("highScore", String(this.highScore));
    }
    const highScoreString = this.highScore.toString().padStart(9, "0");
    this.highestText.setText(`Highest: ${highScoreString}`);
    this.highestText.setAlpha(1);
    this.gameSpeedModifier = 1;
  }

  spawnObstacle() {
    const obstacleNumber = Math.floor(Math.random() * 7) + 1;
    const distance = Phaser.Math.Between(150, 300);
    if (obstacleNumber > 6) {
      const enemyheight = [20, 70];
      const height = enemyheight[Math.floor(Math.random() * 2)];
      this.obstacles
        .create(
          this.gameWidth + distance,
          this.gameHeight - height,
          `enemy-bird`
        )
        .setImmovable()
        .setOrigin(0, 1)
        .play("enemy-bird", true);
    } else {
      this.obstacles
        .create(
          this.gameWidth + distance,
          this.gameHeight,
          `obstacle-${obstacleNumber}`
        )
        .setImmovable()
        .setOrigin(0, 1);
    }
  }
}

export default PlayScene;
