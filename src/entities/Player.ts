import { GameScene } from "./../scenes/GameScene";

export class Player extends Phaser.Physics.Arcade.Sprite {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  scene: GameScene;
  jumpSound: Phaser.Sound.HTML5AudioSound;
  hitSound: Phaser.Sound.HTML5AudioSound;
  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "dyno-run");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.init();
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }
  init() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.setOrigin(0, 1)
      .setGravityY(5000)
      .setCollideWorldBounds(true)
      .setBodySize(42, 92)
      .setOffset(20, 0)
      .setDepth(1);
    // this.handleInputs();
    this.registerAnimations();
    this.jumpSound = this.scene.sound.add("jump", {
      volume: 0.9,
    }) as Phaser.Sound.HTML5AudioSound;
    this.hitSound = this.scene.sound.add("hit", {
      volume: 1,
    }) as Phaser.Sound.HTML5AudioSound;
  }
  // handleInputs() {
  //   const spaceBar = this.scene.input.keyboard.addKey(
  //     Phaser.Input.Keyboard.KeyCodes.SPACE
  //   );
  //   const upArrow = this.scene.input.keyboard.addKey(
  //     Phaser.Input.Keyboard.KeyCodes.UP
  //   );

  //   const setVelocity = () => {
  //     this.setVelocityY(-1600);
  //   };

  //   spaceBar.on("down", setVelocity);
  //   upArrow.on("down", setVelocity);
  // }

  update() {
    const { space, up, down } = this.cursors;
    const isSpaceJustdown = Phaser.Input.Keyboard.JustDown(space);
    const isArrowUpJustdown = Phaser.Input.Keyboard.JustDown(up);
    const isArrowDownJustDown = Phaser.Input.Keyboard.JustDown(down);
    const isArrowDownJusUp = Phaser.Input.Keyboard.JustUp(down);

    const onFloor = (this.body as Phaser.Physics.Arcade.Body).onFloor();

    if ((isSpaceJustdown || isArrowUpJustdown) && onFloor) {
      this.setVelocityY(-1600);
      this.jumpSound.play();
    }

    if (isArrowDownJustDown && onFloor) {
      this.body.setSize(this.body.width, 58);
      this.setOffset(60, 34);
    }

    if (isArrowDownJusUp && onFloor) {
      this.body.setSize(42, 92);
      this.setOffset(20, 0);
    }

    if (!(this.scene as any).isGameRunning) {
      return;
    }
    if (this.body.deltaAbsY() > 0) {
      this.anims.stop();
      this.setTexture("dyno-run", 0);
    } else {
      this.playRunAnimation();
    }
  }

  die() {
    this.anims.pause();
    this.setTexture("dyno-hurt");
    this.hitSound.play();
  }

  playRunAnimation() {
    if (this.body.height === 58) {
      this.play("dyno-down", true);
    } else {
      this.play("dyno-run", true);
    }
  }

  registerAnimations() {
    this.anims.create({
      key: "dyno-run",
      frames: this.anims.generateFrameNames("dyno-run", {
        start: 2,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "dyno-down",
      frames: this.anims.generateFrameNames("dyno-down"),
      frameRate: 10,
      repeat: -1,
    });
  }
}
