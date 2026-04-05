class Source {
  constructor(gridX, gridY, tileSize, virusType = 0, spawnRate = 400) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
    this.virusType = virusType;
    this.alive = true;
    this.hp = 4;
    this.maxHp = 4;
    this.spawnRate = spawnRate;
    this.spawnTimer = Math.floor(Math.random() * spawnRate);
    this.animFrame = 0;
    this.animTimer = 0;
    this.hitFlash = 0;
  }

  get x() { return this.gridX * this.tileSize; }
  get y() { return this.gridY * this.tileSize; }

  hit() {
    this.hp--;
    this.hitFlash = 12;
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  update(wallGrid, viruses, gridW, gridH) {
    if (!this.alive) return null;

    this.animTimer++;
    if (this.animTimer > 10) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    if (this.hitFlash > 0) this.hitFlash--;

    let activeViruses = viruses.filter(v => v.alive).length;
    this.spawnTimer++;

    if (this.spawnTimer >= this.spawnRate && activeViruses < 40) {
      this.spawnTimer = 0;

      let dirs = [
        { x: 0, y: -1 }, { x: 0, y: 1 },
        { x: -1, y: 0 }, { x: 1, y: 0 },
      ];

      for (let d of dirs) {
        let sx = this.gridX + d.x;
        let sy = this.gridY + d.y;
        if (sx < 0 || sx >= gridW || sy < 0 || sy >= gridH) continue;
        if (wallGrid[sy][sx]) continue;
        let occupied = viruses.some(v => v.alive && v.gridX === sx && v.gridY === sy);
        if (!occupied) {
          return new Virus(sx, sy, this.tileSize, this.virusType);
        }
      }
    }
    return null;
  }

  draw(p) {
    if (!this.alive) return;

    let baseCol;
    if (this.hitFlash > 0) {
      baseCol = p.color(255, 255, 255);
    } else {
      let hpRatio = this.hp / this.maxHp;
      baseCol = p.color(200 + 55 * (1 - hpRatio), 50 * hpRatio, 50 * hpRatio);
    }

    let frames = ['◙', '◘', '○', '◘'];
    let ch = frames[this.animFrame];

    p.fill(baseCol);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(this.tileSize * 0.95);
    p.text(ch, this.x + this.tileSize / 2, this.y + this.tileSize / 2);

    let pulse = Math.sin(p.frameCount * 0.12) * 0.3 + 0.7;
    p.fill(255, 60, 60, 120 * pulse);
    p.textSize(this.tileSize * 0.35);
    p.text('♥', this.x + this.tileSize * 0.82, this.y + this.tileSize * 0.18);
  }
}
