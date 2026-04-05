class Player {
  constructor(gridX, gridY, tileSize) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
    this.lives = 3;
    this.alive = true;
    this.aimDirX = 1;
    this.aimDirY = 0;
    this.shootCooldown = 0;
    this.shootDelay = 12;
    this.invincible = 0;
    this.moveTimer = 0;
    this.moveDelay = 6;
    this.char = '☺';
  }

  get x() { return this.gridX * this.tileSize; }
  get y() { return this.gridY * this.tileSize; }

  handleMovement(p, wallGrid, gridW, gridH) {
    this.moveTimer++;
    if (this.moveTimer < this.moveDelay) return;

    let dx = 0, dy = 0;
    if (p.keyIsDown(87)) dy = -1; // W
    if (p.keyIsDown(83)) dy = 1;  // S
    if (p.keyIsDown(65)) dx = -1; // A
    if (p.keyIsDown(68)) dx = 1;  // D

    if (dx === 0 && dy === 0) return;
    this.moveTimer = 0;

    let nextX = this.gridX + dx;
    let nextY = this.gridY + dy;

    if (nextX < 0 || nextX >= gridW || nextY < 0 || nextY >= gridH) return;
    if (wallGrid[nextY][nextX]) return;

    this.gridX = nextX;
    this.gridY = nextY;
  }

  handleShooting(p, bounces) {
    if (this.shootCooldown > 0) this.shootCooldown--;

    let sx = 0, sy = 0;
    if (p.keyIsDown(p.UP_ARROW))    sy = -1;
    if (p.keyIsDown(p.DOWN_ARROW))  sy = 1;
    if (p.keyIsDown(p.LEFT_ARROW))  sx = -1;
    if (p.keyIsDown(p.RIGHT_ARROW)) sx = 1;

    if (sx === 0 && sy === 0) return null;

    this.aimDirX = sx;
    this.aimDirY = sy;

    if (this.shootCooldown > 0) return null;
    this.shootCooldown = this.shootDelay;

    return new Bullet(
      this.gridX + sx, this.gridY + sy,
      sx, sy, this.tileSize, bounces
    );
  }

  takeDamage() {
    if (this.invincible > 0) return;
    this.lives--;
    this.invincible = 120;
    if (this.lives <= 0) {
      this.alive = false;
    }
  }

  update() {
    if (this.invincible > 0) this.invincible--;
  }

  draw(p) {
    if (!this.alive) return;
    if (this.invincible > 0 && Math.floor(this.invincible / 5) % 2 === 0) return;

    p.fill(50, 255, 50);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(this.tileSize * 0.9);
    p.text(this.char, this.x + this.tileSize / 2, this.y + this.tileSize / 2);

    let aimX = this.x + this.tileSize / 2 + this.aimDirX * this.tileSize * 0.45;
    let aimY = this.y + this.tileSize / 2 + this.aimDirY * this.tileSize * 0.45;
    p.fill(50, 255, 50, 140);
    p.textSize(this.tileSize * 0.35);
    p.text('+', aimX, aimY);
  }
}
