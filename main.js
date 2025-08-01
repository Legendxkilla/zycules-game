
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

  // Create ground (invisible static body)
  const ground = this.add.rectangle(config.width / 2, config.height - 10, config.width, 20)
    .setOrigin(0.5, 0.5)
    .setVisible(false);
  this.physics.add.existing(ground, true);

  // Player setup - fixed X, falls onto ground
  player = this.physics.add.sprite(150, config.height - 100, 'zycules').setCollideWorldBounds(true);
  this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNumbers('zycules', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  player.play('run');

  // Collide player with ground
  this.physics.add.collider(player, ground);

  // Groups
  obstacles = this.physics.add.group();
  tokens = this.physics.add.group();

  // Spawn loops (easier: more space between obstacles)
  this.time.addEvent({ delay: 2000, callback: spawnObstacle, callbackScope: this, loop: true });
  this.time.addEvent({ delay: 1000, callback: spawnToken, callbackScope: this, loop: true });

  // Score Text
  scoreText = this.add.text(16, 16, 'Olympus Meter: 0', { fontSize: '20px', fill: '#fff' });

  // Overlaps & collisions
  this.physics.add.overlap(player, tokens, collectToken, null, this);
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  // Input
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // Scroll background
  background.tilePositionX += config.physics.arcade.velocityX ? 0 : 0; // no horizontal camera, world is static

  // Move obstacles & tokens left manually
  obstacles.getChildren().forEach(obj => obj.x -= 300 * delta / 1000);
  tokens.getChildren().forEach(obj => obj.x -= 300 * delta / 1000);

  // Clean up off-screen
  obstacles.getChildren().forEach(obj => { if (obj.x < -50) obj.destroy(); });
  tokens.getChildren().forEach(obj => { if (obj.x < -50) obj.destroy(); });

  // Jump control
  const isGrounded = player.body.blocked.down || player.body.touching.down;
  if ((Phaser.Input.Keyboard.JustDown(cursors.up) || this.input.activePointer.justDown) && isGrounded) {
    player.setVelocityY(-400);
  }
}

function spawnObstacle() {
  // 60% chance to spawn (gaps)
  if (Phaser.Math.RND.frac() > 0.6) return;
  const types = ['rugpull', 'gastrap'];
  const type = Phaser.Math.RND.pick(types);

  // Y aligned to ground
  const obsHeight = 48;
  const y = config.height - 10 - obsHeight / 2;

  const obs = obstacles.create(config.width + 50, y, type);
  obs.setDisplaySize(48, obsHeight);
  obs.body.allowGravity = false;
  obs.body.setSize(48, obsHeight, true);
}

function spawnToken() {
  // 50% chance to spawn
  if (Phaser.Math.RND.frac() > 0.5) return;
  const tokenHeight = 24;
  const groundY = config.height - 10;
  const y = Phaser.Math.Between(groundY - 100, groundY - tokenHeight);

  const token = tokens.create(config.width + 50, y, 'token');
  token.setDisplaySize(24, tokenHeight);
  token.body.allowGravity = false;
  token.body.setSize(24, tokenHeight, true);
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

