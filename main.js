const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 }, debug: false }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let player, cursors, obstacles, tokens, score = 0, scoreText;

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.spritesheet('zycules', 'assets/zycules.png', { frameWidth: 64, frameHeight: 64 });
  this.load.image('token', 'assets/token.png');
  this.load.image('rugpull', 'assets/rugpull.png');
  this.load.image('gastrap', 'assets/gastrap.png');
}

function create() {
  this.add.tileSprite(0, 0, config.width, config.height, 'background').setOrigin(0, 0);

  player = this.physics.add.sprite(100, config.height - 150, 'zycules');
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNumbers('zycules', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  player.play('run');

  obstacles = this.physics.add.group();
  tokens = this.physics.add.group();

  this.time.addEvent({ delay: 1500, callback: spawnObstacle, callbackScope: this, loop: true });
  this.time.addEvent({ delay: 1000, callback: spawnToken, callbackScope: this, loop: true });

  scoreText = this.add.text(16, 16, 'Olympus Meter: 0', { fontSize: '20px', fill: '#fff' });

  this.physics.add.overlap(player, tokens, collectToken, null, this);
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  player.setVelocityX(200);

  // Optional: Better control for jump
  if ((Phaser.Input.Keyboard.JustDown(cursors.up) || this.input.activePointer.justDown) && player.body.onFloor()) {
    player.setVelocityY(-400);
  }
}

function spawnObstacle() {
  const types = ['rugpull', 'gastrap'];
  const type = Phaser.Math.RND.pick(types);
  const y = config.height - 100;

  const obs = obstacles.create(config.width + 50, y, type);
  obs.setScale(0.5);  // Shrink obstacle size

  obs.setVelocityX(-200);
  obs.setImmovable(true);
  obs.body.allowGravity = false;

  // Optional hitbox tuning
  obs.body.setSize(obs.displayWidth, obs.displayHeight);
}

function spawnToken() {
  const y = Phaser.Math.Between(config.height - 200, config.height - 100);

  const token = tokens.create(config.width + 50, y, 'token');
  token.setScale(0.4);  // Shrink token size

  token.setVelocityX(-200);
  token.body.allowGravity = false;

  // Optional hitbox tuning
  token.body.setSize(token.displayWidth, token.displayHeight);
}

function collectToken(player, token) {
  token.destroy();
  score += 10;
  scoreText.setText('Olympus Meter: ' + score);
}

function hitObstacle(player, obstacle) {
  this.physics.pause();
  player.setTint(0xff0000);
  scoreText.setText('Game Over! Final Olympus Meter: ' + score);
}
