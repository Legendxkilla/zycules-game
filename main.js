
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
let player, cursors, obstacles, tokens, score = 0, scoreText, background, ground;
let gameOver = false;

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.spritesheet('zycules', 'assets/zycules.png', { frameWidth: 64, frameHeight: 64 });
  this.load.image('token', 'assets/token.png');
  this.load.image('rugpull', 'assets/rugpull.png');
  this.load.image('gastrap', 'assets/gastrap.png');
}

function create() {
  // Background scroll
  background = this.add.tileSprite(0, 0, config.width, config.height, 'background').setOrigin(0);

  // Invisible ground for collisions
  ground = this.physics.add.staticGroup();
  ground.create(config.width/2, config.height - 5, null)
    .setDisplaySize(config.width, 10)
    .refreshBody();

  // Player setup
  player = this.physics.add.sprite(150, config.height - 100, 'zycules')
    .setCollideWorldBounds(true);
  this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNumbers('zycules', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  player.play('run');
  this.physics.add.collider(player, ground);

  // Groups
  obstacles = this.physics.add.group();
  tokens = this.physics.add.group();

  // Spawn loops
  this.time.addEvent({ delay: 2500, callback: spawnObstacle, callbackScope: this, loop: true });
  this.time.addEvent({ delay: 1500, callback: spawnToken, callbackScope: this, loop: true });

  // Score
  scoreText = this.add.text(16, 16, 'Olympus Meter: 0', { fontSize: '20px', fill: '#fff' });
  this.physics.add.overlap(player, tokens, collectToken, null, this);
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  if (gameOver) return;

  // Scroll background
  background.tilePositionX += 150 * delta / 1000;

  // Move obstacles & tokens left
  obstacles.getChildren().forEach(obj => obj.setX(obj.x - 150 * delta / 1000));
  tokens.getChildren().forEach(obj => obj.setX(obj.x - 150 * delta / 1000));

  // Remove off-screen
  obstacles.getChildren().forEach(obj => { if (obj.x < -50) obj.destroy(); });
  tokens.getChildren().forEach(obj => { if (obj.x < -50) obj.destroy(); });

  // Jump input (only when touching ground)
  const isGrounded = player.body.blocked.down;
  if ((Phaser.Input.Keyboard.JustDown(cursors.up) || this.input.activePointer.justDown) && isGrounded) {
    player.setVelocityY(-350);
  }
}

function spawnObstacle() {
  if (Phaser.Math.RND.frac() < 0.2) return; // 20% chance to spawn
  const type = Phaser.Math.RND.pick(['rugpull', 'gastrap']);
  const y = config.height - 15;
  const obs = obstacles.create(config.width + 50, y, type)
    .setDisplaySize(48, 48)
    .setOrigin(0.5, 1);
  obs.body.allowGravity = false;
  obs.body.setSize(48, 48, true);
}

function spawnToken() {
  if (Phaser.Math.RND.frac() < 0.4) return; // 40% chance to spawn
  const y = Phaser.Math.Between(config.height - 150, config.height - 50);
  const token = tokens.create(config.width + 50, y, 'token')
    .setDisplaySize(24, 24)
    .setOrigin(0.5, 1);
  token.body.allowGravity = false;
  token.body.setSize(24, 24, true);
}

function collectToken(player, token) {
  token.destroy(); score += 10;
  scoreText.setText('Olympus Meter: ' + score);
}

function hitObstacle(player, obstacle) {
  gameOver = true;
  this.physics.pause();
  player.setTint(0xff0000);
  scoreText.setText('Game Over! Final Olympus Meter: ' + score);
}
