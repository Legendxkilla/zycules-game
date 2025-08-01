const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let player, cursors, ground, obstacles, tokens, score = 0, scoreText, distance = 0, distanceText, gameOver = false;

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.image('ground', 'assets/ground.png'); // Use placeholder if needed
  this.load.spritesheet('zycules', 'assets/zycules.png', { frameWidth: 64, frameHeight: 64 });
  this.load.image('token', 'assets/token.png');
  this.load.image('rugpull', 'assets/rugpull.png');
  this.load.image('gastrap', 'assets/gastrap.png');
}

function create() {
  this.add.tileSprite(0, 0, config.width, config.height, 'background').setOrigin(0, 0);

  // Ground
  ground = this.physics.add.staticGroup();
  ground.create(400, 430, 'ground').setScale(2).refreshBody(); // Position adjusted

  // Player
  player = this.physics.add.sprite(100, 300, 'zycules');
  player.setCollideWorldBounds(true);
  player.setScale(1);
  player.body.setSize(40, 60).setOffset(10, 4);

  this.anims.create({
    key: 'run',
    frames: this.anims.generateFrameNumbers('zycules', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  player.play('run');

  // Groups
  obstacles = this.physics.add.group();
  tokens = this.physics.add.group();

  // Colliders
  this.physics.add.collider(player, ground);
  this.physics.add.collider(obstacles, ground);
  this.physics.add.overlap(player, tokens, collectToken, null, this);
  this.physics.add.collider(player, obstacles, hitObstacle, null, this);

  // Input
  cursors = this.input.keyboard.createCursorKeys();
  this.input.on('pointerdown', jump, this);

  // Score
  scoreText = this.add.text(16, 16, 'Olympus Meter: 0', { fontSize: '20px', fill: '#fff' });
  distanceText = this.add.text(16, 40, 'Distance: 0', { fontSize: '18px', fill: '#fff' });

  // Spawners
  this.time.addEvent({ delay: 2200, callback: spawnObstacle, callbackScope: this, loop: true });
  this.time.addEvent({ delay: 1500, callback: spawnToken, callbackScope: this, loop: true });
}

function update() {
  if (gameOver) return;

  player.setVelocityX(0);

  if (cursors.up.isDown && player.body.blocked.down) {
    jump.call(this);
  }

  distance += 1;
  distanceText.setText('Distance: ' + distance);

  // Move obstacles & tokens
  obstacles.children.iterate(ob => ob.setVelocityX(-200));
  tokens.children.iterate(tok => tok.setVelocityX(-200));
}

function jump() {
  if (player.body.blocked.down) {
    player.setVelocityY(-500);
  }
}

function spawnObstacle() {
  const types = ['rugpull', 'gastrap'];
  const type = Phaser.Math.RND.pick(types);

  const obstacle = obstacles.create(850, 380, type);
  obstacle.setScale(0.4); // Smaller
  obstacle.setImmovable(true);
  obstacle.body.allowGravity = false;
}

function spawnToken() {
  const y = Phaser.Math.Between(280, 360);
  const token = tokens.create(850, y, 'token');
  token.setScale(0.3);
  token.body.allowGravity = false;
}

function collectToken(player, token) {
  token.destroy();
  score += 10;
  scoreText.setText('Olympus Meter: ' + score);
}

function hitObstacle() {
  if (gameOver) return;
  this.physics.pause();
  player.setTint(0xff0000);
  gameOver = true;
  scoreText.setText('Game Over! Final Olympus Meter: ' + score);
}
