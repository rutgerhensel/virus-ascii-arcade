class Bullet {
  constructor(gridX, gridY, dirX, dirY, tileSize, bouncesLeft = 0) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.dirX = dirX;
    this.dirY = dirY;
    this.tileSize = tileSize;
    this.bouncesLeft = bouncesLeft;
    this.alive = true;
    this.moveTimer = 0;
    this.moveInterval = 4;
    this.char = this.getDirectionChar();
    this.trail = [];
  }

  getDirectionChar() {
    if (this.dirX === 0 && this.dirY === -1) return '│';
    if (this.dirX === 0 && this.dirY === 1)  return '│';
    if (this.dirX === -1 && this.dirY === 0) return '─';
    if (this.dirX === 1 && this.dirY === 0)  return '─';
    if (this.dirX === 1 && this.dirY === -1)  return '/';
    if (this.dirX === -1 && this.dirY === 1)  return '/';
    if (this.dirX === -1 && this.dirY === -1) return '\\';
    if (this.dirX === 1 && this.dirY === 1)   return '\\';
    return '·';
  }

  get x() { return this.gridX * this.tileSize; }
  get y() { return this.gridY * this.tileSize; }

  update(wallGrid, gridW, gridH) {
    this.moveTimer++;
    if (this.moveTimer < this.moveInterval) return;
    this.moveTimer = 0;

    this.trail.push({ x: this.gridX, y: this.gridY });
    if (this.trail.length > 3) this.trail.shift();

    let nextX = this.gridX + this.dirX;
    let nextY = this.gridY + this.dirY;

    if (nextX < 0 || nextX >= gridW || nextY < 0 || nextY >= gridH) {
      this.alive = false;
      return;
    }

    let hitWall = wallGrid[nextY] && wallGrid[nextY][nextX];

    if (hitWall) {
      if (hitWall.type === 'destructible') {
        let destroyed = hitWall.hit();
        if (destroyed) wallGrid[nextY][nextX] = null;
        this.alive = false;
        return;
      }

      if (this.bouncesLeft > 0 || hitWall.bounces) {
        this.bounce(wallGrid, gridW, gridH);
        this.char = this.getDirectionChar();
        this.bouncesLeft = Math.max(0, this.bouncesLeft - 1);
        return;
      }

      this.alive = false;
      return;
    }

    this.gridX = nextX;
    this.gridY = nextY;
  }

  bounce(wallGrid, gridW, gridH) {
    let newDirX = this.dirX;
    let newDirY = this.dirY;

    let hx = this.gridX + this.dirX, hy = this.gridY;
    let vx = this.gridX, vy = this.gridY + this.dirY;

    let wallH = (hx >= 0 && hx < gridW && hy >= 0 && hy < gridH) ? wallGrid[hy][hx] : true;
    let wallV = (vx >= 0 && vx < gridW && vy >= 0 && vy < gridH) ? wallGrid[vy][vx] : true;

    if (this.dirX !== 0 && this.dirY !== 0) {
      if (wallH && wallV) {
        newDirX = -this.dirX;
        newDirY = -this.dirY;
      } else if (wallH) {
        newDirX = -this.dirX;
      } else if (wallV) {
        newDirY = -this.dirY;
      } else {
        newDirX = -this.dirX;
        newDirY = -this.dirY;
      }
    } else {
      if (this.dirX !== 0) newDirX = -this.dirX;
      if (this.dirY !== 0) newDirY = -this.dirY;
    }

    this.dirX = newDirX;
    this.dirY = newDirY;

    let ax = this.gridX + this.dirX;
    let ay = this.gridY + this.dirY;
    let blocked = (ax < 0 || ax >= gridW || ay < 0 || ay >= gridH) ||
                  (wallGrid[ay] && wallGrid[ay][ax]);
    if (!blocked) {
      this.gridX = ax;
      this.gridY = ay;
    }
  }

  draw(p) {
    for (let i = 0; i < this.trail.length; i++) {
      let t = this.trail[i];
      let alpha = (i / this.trail.length) * 100 + 30;
      p.fill(255, 255, 100, alpha);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(this.tileSize * 0.5);
      p.text('·', t.x * this.tileSize + this.tileSize / 2, t.y * this.tileSize + this.tileSize / 2);
    }

    p.fill(255, 255, 80);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(this.tileSize * 0.8);
    p.text(this.char, this.x + this.tileSize / 2, this.y + this.tileSize / 2);
  }
}
