
// main.js
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
let player, cursors, obstacles, tokens, score = 0, scoreText;
let gameOver = false;

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.spritesheet('zycules', 'assets/zycules.png', { frameWidth: 64, frameHeight: 64 });
  this.load.image('token', 'assets/token.png');
  this.load.image('rugpull', 'assets/rugpull.png');
  this.load.image('gastrap', 'assets/gastrap.png');
}

function create() {
  // Background
  this.add.tileSprite(0, 0, config.width, config.height, 'background').setOrigin(0, 0);

  // Invisible ground using a physics-enabled rectangle
  const groundRect = this.add.rectangle(config.width / 2, config.height - 10, config.width, 20);
  this.physics.add.existing(groundRect, true); // true = static body

  // Player setup
  player = this.physics.add.sprite(150, config.height - 50, 'zycules')
    .setCollideWorldBounds(true)
    .setScale(0.75);
  this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNumbers('zycules', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  player.play('run');

  // Collide player with ground
  this.physics.add.collider(player, groundRect);

  // Groups
  obstacles = this.physics.add.group();
  tokens = this.physics.add.group();

  // Spawn loops (easy mode)
  this.time.addEvent({ delay: 3000, callback: spawnObstacle, callbackScope: this, loop: true });
  this.time.addEvent({ delay: 2000, callback: spawnToken, callbackScope: this, loop: true });

  // Score text
  scoreText = this.add.text(16, 16, 'Olympus Meter: 0', { fontSize: '20px', fill: '#fff' });
  this.physics.add.overlap(player, tokens, collectToken, null, this);
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  // Input
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (gameOver) return;

  // Jump when on the ground
  if ((Phaser.Input.Keyboard.JustDown(cursors.up) || this.input.activePointer.justDown) && player.body.blocked.down) {
    player.setVelocityY(-350);
  }
}

function spawnObstacle() {
  if (Math.random() < 0.5) return; // 50% chance gap
  const type = Phaser.Math.RND.pick(['rugpull', 'gastrap']);
  const obs = obstacles.create(config.width + 50, config.height - 10, type)
    .setOrigin(0.5, 1)
    .setDisplaySize(32, 32);
  obs.body.allowGravity = false;
  obs.setVelocityX(-100);
}

function spawnToken() {
  if (Math.random() < 0.5) return; // 50% chance
  const y = Phaser.Math.Between(config.height - 150, config.height - 50);
  const token = tokens.create(config.width + 50, y, 'token')
    .setOrigin(0.5, 1)
    .setDisplaySize(16, 16);
  token.body.allowGravity = false;
  token.setVelocityX(-100);
}

function collectToken(player, token) {
  token.destroy();
  score += 10;
  scoreText.setText('Olympus Meter: ' + score);
}

function hitObstacle(player, obstacle) {
  gameOver = true;
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.pause();
  scoreText.setText('Game Over! Final Olympus Meter: ' + score);
}
