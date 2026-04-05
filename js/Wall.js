class Wall {
  constructor(gridX, gridY, tileSize, type = 'solid') {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
    this.type = type; // 'solid', 'bouncy', 'destructible'
    this.hp = type === 'destructible' ? 2 : -1;
    this.char = this.getChar();
  }

  getChar() {
    switch (this.type) {
      case 'solid':       return '█';
      case 'bouncy':      return '▓';
      case 'destructible': return '▒';
      default:            return '█';
    }
  }

  get x() { return this.gridX * this.tileSize; }
  get y() { return this.gridY * this.tileSize; }

  hit() {
    if (this.type === 'destructible') {
      this.hp--;
      if (this.hp <= 0) return true; // destroyed
      this.char = '░';
    }
    return false;
  }

  get bounces() {
    return this.type === 'bouncy';
  }

  draw(p) {
    let col;
    switch (this.type) {
      case 'solid':
        col = p.color(100, 100, 180);
        break;
      case 'bouncy':
        col = p.color(80, 180, 80);
        break;
      case 'destructible':
        col = this.hp > 1 ? p.color(180, 140, 60) : p.color(120, 90, 40);
        break;
    }
    p.fill(col);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(this.tileSize * 0.9);
    p.text(this.char, this.x + this.tileSize / 2, this.y + this.tileSize / 2);
  }
}
