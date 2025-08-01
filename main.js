
// main.js
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1000 }, debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, cursors, obstacles, tokens, distance = 0, distanceText;
let speed = 200, gameOver = false;

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.spritesheet('zycules', 'assets/zycules.png', { frameWidth: 64, frameHeight: 64 });
  this.load.image('token', 'assets/token.png');
  this.load.image('rugpull', 'assets/rugpull.png');
  this.load.image('gastrap', 'assets/gastrap.png');
}

function create() {
  // Scrolling background
  this.background = this.add.tileSprite(0, 0, config.width, config.height, 'background').setOrigin(0);

  // Ground as invisible static platform
  const ground = this.physics.add.staticGroup();
  ground.create(config.width/2, config.height - 10, null)
    .setDisplaySize(config.width, 20)
    .refreshBody();

  // Player
  player = this.physics.add.sprite(100, config.height - 30, 'zycules')
    .setScale(0.75)
    .setCollideWorldBounds(true);
  this.anims.create({
    key: 'run', frames: this.anims.generateFrameNumbers('zycules', { start: 0, end: 3 }), frameRate: 10, repeat: -1
  });
  player.play('run');

  // Collide with ground
  this.physics.add.collider(player, ground);

  // Groups
  obstacles = this.physics.add.group();
  tokens = this.physics.add.group();

  // Spawning
  this.time.addEvent({ delay: 2500, callback: spawnObstacle, callbackScope: this, loop: true });
  this.time.addEvent({ delay: 1800, callback: spawnToken, callbackScope: this, loop: true });

  // Distance text
  distanceText = this.add.text(16, 16, 'Distance: 0', { fontSize: '20px', fill: '#fff' });

  // Collisions
  this.physics.add.overlap(player, tokens, collectToken, null, this);
  this.physics.add.collider(player, obstacles, endGame, null, this);

  // Input
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  if (gameOver) return;

  // Scroll background
  this.background.tilePositionX += speed * delta / 1000;

  // Move obstacles/tokens
  obstacles.children.iterate(obs => obs.setX(obs.x - speed * delta / 1000));
  tokens.children.iterate(tok => tok.setX(tok.x - speed * delta / 1000));

  // Clean up off-screen
  obstacles.children.iterate(obs => { if (obs.x < -50) obs.destroy(); });
  tokens.children.iterate(tok => { if (tok.x < -50) tok.destroy(); });

  // Jump
  if (Phaser.Input.Keyboard.JustDown(cursors.up) && player.body.blocked.down) {
    player.setVelocityY(-450);
  }

  // Update distance
  distance += speed * delta / 1000;
  distanceText.setText('Distance: ' + Math.floor(distance));
}

function spawnObstacle() {
  if (Math.random() < 0.6) return;  // 40% spawn rate
  const type = Phaser.Math.RND.pick(['rugpull', 'gastrap']);
  const y = config.height - 10;
  const obs = obstacles.create(config.width + 50, y, type)
    .setOrigin(0.5, 1)
    .setDisplaySize(32, 32);
  obs.body.allowGravity = false;
}

function spawnToken() {
  if (Math.random() < 0.5) return;  // 50% spawn rate
  const y = Phaser.Math.Between(config.height - 150, config.height - 30);
  const tok = tokens.create(config.width + 50, y, 'token')
    .setOrigin(0.5, 1)
    .setDisplaySize(16, 16);
  tok.body.allowGravity = false;
}

function collectToken(player, token) {
  token.destroy();
}

function endGame(player, obs) {
  gameOver = true;
  this.physics.pause();
  player.setTint(0xff0000);
  distanceText.setText('Game Over! Distance: ' + Math.floor(distance));
}
