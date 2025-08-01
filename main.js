
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 }, debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, cursors, obstacles, tokens, score = 0, scoreText, background;
let gameOver = false;

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

  // Player setup at fixed X
  player = this.physics.add.sprite(150, config.height - 100, 'zycules')
    .setCollideWorldBounds(true);
  this.anims.create({
    key: 'run', frames: this.anims.generateFrameNumbers('zycules', { start: 0, end: 3 }),
    frameRate: 10, repeat: -1
  });
  player.play('run');

  // Groups
  obstacles = this.physics.add.group();
  tokens = this.physics.add.group();

  // Timers for spawning
  this.time.addEvent({ delay: 2000, callback: spawnObstacle, callbackScope: this, loop: true });
  this.time.addEvent({ delay: 1200, callback: spawnToken, callbackScope: this, loop: true });

  // Score display
  scoreText = this.add.text(16, 16, 'Olympus Meter: 0', { fontSize: '20px', fill: '#fff' });

  // Collisions
  this.physics.add.overlap(player, tokens, collectToken, null, this);
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  // Input
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  if (gameOver) return;

  // Scroll background
  background.tilePositionX += 200 * delta / 1000;

  // Player auto-run (we keep X fixed, world moves instead)
  player.setVelocityX(0);

  // Jump control
  const isGrounded = player.body.blocked.down;
  if ((Phaser.Input.Keyboard.JustDown(cursors.up) || this.input.activePointer.justDown) && isGrounded) {
    player.setVelocityY(-400);
  }

  // Remove off-screen objects
  obstacles.getChildren().forEach(obj => { if (obj.x < -50) obj.destroy(); });
  tokens.getChildren().forEach(obj => { if (obj.x < -50) obj.destroy(); });
}

function spawnObstacle() {
  if (Phaser.Math.RND.frac() < 0.3) return;  // 30% chance to spawn (more gaps)

  const type = Phaser.Math.RND.pick(['rugpull', 'gastrap']);
  const y = config.height - 24;  // Half ground offset (sprite height is 48)

  const obs = obstacles.create(config.width + 50, y, type);
  obs.setOrigin(0.5, 1);
  obs.setDisplaySize(48, 48);
  obs.body.allowGravity = false;
  obs.setVelocityX(-200);
  obs.body.setImmovable(true);
  obs.body.setSize(48, 48, true);
}

function spawnToken() {
  if (Phaser.Math.RND.frac() < 0.5) return;  // 50% chance

  const y = Phaser.Math.Between(config.height - 200, config.height - 100);
  const token = tokens.create(config.width + 50, y, 'token');
  token.setOrigin(0.5, 1);
  token.setDisplaySize(24, 24);
  token.body.allowGravity = false;
  token.setVelocityX(-200);
  token.body.setSize(24, 24, true);
}

function collectToken(player, token) {
  token.destroy();
  score += 10;
  scoreText.setText('Olympus Meter: ' + score);
}

function hitObstacle(player, obstacle) {
  gameOver = true;
  this.physics.pause();
  this.time.removeAllEvents();
  player.setTint(0xff0000);
  scoreText.setText('Game Over! Final Olympus Meter: ' + score);
}
