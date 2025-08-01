
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
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);
let player, cursors, obstacles, tokens, score = 0, scoreText, background;
const RUN_SPEED = 200;

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.spritesheet('zycules', 'assets/zycules.png', { frameWidth: 64, frameHeight: 64 });
  this.load.image('token', 'assets/token.png');
  this.load.image('rugpull', 'assets/rugpull.png');
  this.load.image('gastrap', 'assets/gastrap.png');
}

function create() {
  // Scrolling background
  background = this.add.tileSprite(0, 0, config.width, config.height, 'background').setOrigin(0);

  // Player setup - static X position
  player = this.physics.add.sprite(150, config.height - 100, 'zycules');
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNumbers('zycules', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  player.play('run');

  // Groups for obstacles & tokens
  obstacles = this.physics.add.group();
  tokens = this.physics.add.group();

  // Spawn loops
  this.time.addEvent({ delay: 1200, callback: spawnObstacle, callbackScope: this, loop: true });
  this.time.addEvent({ delay: 900, callback: spawnToken, callbackScope: this, loop: true });

  // Score Text
  scoreText = this.add.text(16, 16, 'Olympus Meter: 0', { fontSize: '20px', fill: '#fff' });

  // Collisions & overlaps
  this.physics.add.overlap(player, tokens, collectToken, null, this);
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  // Input
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // Scroll background to left
  background.tilePositionX += RUN_SPEED * delta / 1000;

  // Make world move left by moving obstacles and tokens towards player
  Phaser.Actions.IncX(obstacles.getChildren(), -RUN_SPEED * delta / 1000);
  Phaser.Actions.IncX(tokens.getChildren(), -RUN_SPEED * delta / 1000);

  // Remove off-screen
  obstacles.getChildren().forEach(obj => {
    if (obj.x < -50) obj.destroy();
  });
  tokens.getChildren().forEach(obj => {
    if (obj.x < -50) obj.destroy();
  });

  // Player jump
  const isGrounded = player.body.blocked.down || player.body.touching.down;
  if ((Phaser.Input.Keyboard.JustDown(cursors.up) || this.input.activePointer.justDown) && isGrounded) {
    player.setVelocityY(-400);
  }
}

function spawnObstacle() {
  const types = ['rugpull', 'gastrap'];
  const type = Phaser.Math.RND.pick(types);
  const groundY = config.height - 80;

  const obs = obstacles.create(config.width + 50, groundY, type);
  obs.setDisplaySize(48, 48);
  obs.body.allowGravity = false;
  obs.body.setSize(48, 48, true);
}

function spawnToken() {
  const groundY = config.height - 80;
  const tokenY = Phaser.Math.Between(groundY - 100, groundY - 20);

  const token = tokens.create(config.width + 50, tokenY, 'token');
  token.setDisplaySize(24, 24);
  token.body.allowGravity = false;
  token.body.setSize(24, 24, true);
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
