// main.js
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let player, cursors, obstacles, tokens, score = 0, scoreText, ground;

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.spritesheet('zycules', 'assets/zycules.png', { frameWidth: 64, frameHeight: 64 });
  this.load.image('token', 'assets/token.png');
  this.load.image('rugpull', 'assets/rugpull.png');
  this.load.image('gastrap', 'assets/gastrap.png');
  this.load.image('ground', 'assets/ground.png');
}

function create() {
  this.add.tileSprite(0, 0, config.width, config.height, 'background').setOrigin(0, 0);

  ground = this.physics.add.staticGroup();
  ground.create(config.width / 2, config.height - 25, 'ground').setScale(2).refreshBody();

  player = this.physics.add.sprite(100, config.height - 150, 'zycules');
  player.setCollideWorldBounds(true);
  player.setBounce(0);

  this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNumbers('zycules', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  player.play('run');

  obstacles = this.physics.add.group();
  tokens = this.physics.add.group();

  this.time.addEvent({ delay: 2000, callback: spawnObstacle, callbackScope: this, loop: true });
  this.time.addEvent({ delay: 3000, callback: spawnToken, callbackScope: this, loop: true });

  scoreText = this.add.text(16, 16, 'Olympus Meter: 0', { fontSize: '20px', fill: '#fff' });

  this.physics.add.collider(player, ground);
  this.physics.add.collider(obstacles, ground);
  this.physics.add.overlap(player, tokens, collectToken, null, this);
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (!player.active) return;

  player.setVelocityX(0); // Prevent movement to the right

  if ((cursors.up.isDown || this.input.activePointer.isDown) && player.body.blocked.down) {
    player.setVelocityY(-400);
  }
}

function spawnObstacle() {
  const types = ['rugpull', 'gastrap'];
  const type = Phaser.Math.RND.pick(types);
  const obs = obstacles.create(config.width + 50, config.height - 100, type);
  obs.setVelocityX(-150);
  obs.setImmovable(true);
  obs.body.allowGravity = false;
  obs.setScale(0.5);
}

function spawnToken() {
  const y = config.height - 150;
  const token = tokens.create(config.width + 50, y, 'token');
  token.setVelocityX(-150);
  token.body.allowGravity = false;
  token.setScale(0.4);
}

function collectToken(player, token) {
  token.destroy();
  score += 10;
  scoreText.setText('Olympus Meter: ' + score);
}

function hitObstacle(player, obstacle) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.pause();
  player.active = false;
  scoreText.setText('Game Over! Final Olympus Meter: ' + score);
}
