class Wall {
  constructor(gridX, gridY, tileSize, type = 'solid') {
    this.gridX = gridX;
    this.gridY = gridY;
    this.tileSize = tileSize;
    this.type = type;
    this.hp = type === 'destructible' ? 2 : -1;
    this.char = '╬';
  }

  setBoxChar(up, down, left, right) {
    let chars = [
      '○', '═', '═', '═',
      '║', '╔', '╗', '╦',
      '║', '╚', '╝', '╩',
      '║', '╠', '╣', '╬',
    ];
    let idx = (up ? 8 : 0) | (down ? 4 : 0) | (left ? 2 : 0) | (right ? 1 : 0);
    this.char = chars[idx];
  }

  get x() { return this.gridX * this.tileSize; }
  get y() { return this.gridY * this.tileSize; }

  hit() {
    if (this.type === 'destructible') {
      this.hp--;
      if (this.hp <= 0) return true;
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
        col = p.color(80, 200, 80);
        break;
      case 'destructible':
        col = this.hp > 1 ? p.color(200, 160, 60) : p.color(140, 100, 40);
        break;
    }
    p.fill(col);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(this.tileSize * 0.95);
    p.text(this.char, this.x + this.tileSize / 2, this.y + this.tileSize / 2);
  }
}
