class Virus {
  constructor(gridX, gridY, tileSize, virusType = 0) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
    this.virusType = virusType;
    this.alive = true;
    this.moveTimer = 0;
    this.moveInterval = 25 + Math.floor(Math.random() * 30);
    this.animFrame = 0;
    this.animTimer = 0;
    this.dirX = 0;
    this.dirY = 0;
    this.pickDirection();

    this.faces = [
      ['☺', '☻'],
      ['Ö', 'ö'],
      ['¤', '◊'],
      ['♦', '◘'],
      ['Θ', 'θ'],
    ];

    this.colors = [
      [255, 80, 80],
      [255, 120, 255],
      [80, 255, 120],
      [255, 200, 50],
      [120, 200, 255],
    ];
  }

  pickDirection() {
    let dirs = [
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: -1, y: 0 }, { x: 1, y: 0 },
    ];
    let d = dirs[Math.floor(Math.random() * dirs.length)];
    this.dirX = d.x;
    this.dirY = d.y;
  }

  update(wallGrid, viruses, sources, gridW, gridH, playerGridX, playerGridY) {
    this.animTimer++;
    if (this.animTimer > 12) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }

    this.moveTimer++;
    if (this.moveTimer < this.moveInterval) return;
    this.moveTimer = 0;

    let dist = Math.abs(playerGridX - this.gridX) + Math.abs(playerGridY - this.gridY);
    let chaseChance = dist < 15 ? 0.5 : 0.05;

    if (Math.random() < chaseChance) {
      let dx = playerGridX - this.gridX;
      let dy = playerGridY - this.gridY;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.dirX = dx > 0 ? 1 : -1;
        this.dirY = 0;
      } else {
        this.dirX = 0;
        this.dirY = dy > 0 ? 1 : -1;
      }
    } else if (Math.random() < 0.25) {
      this.pickDirection();
    }

    let nextX = this.gridX + this.dirX;
    let nextY = this.gridY + this.dirY;

    if (nextX < 0 || nextX >= gridW || nextY < 0 || nextY >= gridH) {
      this.pickDirection();
      return;
    }

    if (wallGrid[nextY][nextX]) {
      this.pickDirection();
      return;
    }

    let blocked = viruses.some(v => v !== this && v.alive && v.gridX === nextX && v.gridY === nextY);
    if (!blocked) blocked = sources.some(s => s.alive && s.gridX === nextX && s.gridY === nextY);

    if (blocked) {
      this.pickDirection();
      return;
    }

    this.gridX = nextX;
    this.gridY = nextY;
  }

  get x() { return this.gridX * this.tileSize; }
  get y() { return this.gridY * this.tileSize; }

  get face() {
    let idx = this.virusType % this.faces.length;
    return this.faces[idx][this.animFrame];
  }

  get col() {
    let idx = this.virusType % this.colors.length;
    return this.colors[idx];
  }

  draw(p) {
    if (!this.alive) return;
    let c = this.col;
    let pulse = Math.sin(p.frameCount * 0.08 + this.gridX + this.gridY) * 25;
    p.fill(c[0] + pulse, c[1] + pulse, c[2] + pulse);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(this.tileSize * 0.85);
    p.text(this.face, this.x + this.tileSize / 2, this.y + this.tileSize / 2);
  }
}
