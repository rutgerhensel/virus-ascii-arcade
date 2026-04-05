class Game {
  constructor(p) {
    this.p = p;
    this.tileSize = 20;
    this.viewTilesW = 40;
    this.viewTilesH = 30;
    this.viewW = this.viewTilesW * this.tileSize;
    this.viewH = this.viewTilesH * this.tileSize;
    this.hudH = 40;
    this.canvasW = this.viewW;
    this.canvasH = this.viewH + this.hudH;

    this.state = 'menu';
    this.currentLevel = 0;
    this.levels = Level.getLevels();
    this.score = 0;

    this.wallGrid = [];
    this.viruses = [];
    this.sources = [];
    this.bullets = [];
    this.player = null;
    this.gridW = 0;
    this.gridH = 0;
    this.bounces = 0;
    this.levelName = '';
    this.particles = [];
    this.messageTimer = 0;

    this.cameraX = 0;
    this.cameraY = 0;
  }

  init() {
    this.p.createCanvas(this.canvasW, this.canvasH);
  }

  loadLevel(idx) {
    let config = this.levels[idx];
    let generated = Level.generate(config, this.tileSize);
    let data = Level.parse(generated, this.tileSize);

    this.wallGrid = data.wallGrid;
    this.viruses = data.viruses;
    this.sources = data.sources;
    this.bullets = [];
    this.gridW = data.gridW;
    this.gridH = data.gridH;
    this.bounces = data.bounces;
    this.levelName = data.name;
    this.player = new Player(data.playerStart.x, data.playerStart.y, this.tileSize);
    this.particles = [];
    this.messageTimer = 150;
    this.state = 'playing';

    this.cameraX = this.player.x - this.viewW / 2;
    this.cameraY = this.player.y - this.viewH / 2;
    this.clampCamera();
  }

  clampCamera() {
    let maxX = this.gridW * this.tileSize - this.viewW;
    let maxY = this.gridH * this.tileSize - this.viewH;
    this.cameraX = Math.max(0, Math.min(maxX, this.cameraX));
    this.cameraY = Math.max(0, Math.min(maxY, this.cameraY));
  }

  updateCamera() {
    let tx = this.player.x - this.viewW / 2 + this.tileSize / 2;
    let ty = this.player.y - this.viewH / 2 + this.tileSize / 2;
    this.cameraX += (tx - this.cameraX) * 0.08;
    this.cameraY += (ty - this.cameraY) * 0.08;
    this.clampCamera();
  }

  isVisible(gx, gy) {
    let px = gx * this.tileSize;
    let py = gy * this.tileSize;
    return px + this.tileSize > this.cameraX - this.tileSize &&
           px < this.cameraX + this.viewW + this.tileSize &&
           py + this.tileSize > this.cameraY - this.tileSize &&
           py < this.cameraY + this.viewH + this.tileSize;
  }

  spawnParticles(gx, gy, col, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: gx * this.tileSize + this.tileSize / 2,
        y: gy * this.tileSize + this.tileSize / 2,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 25 + Math.floor(Math.random() * 25),
        maxLife: 50,
        col: col,
        char: ['*', '·', '+', '×'][Math.floor(Math.random() * 4)],
      });
    }
  }

  update() {
    let p = this.p;
    if (this.state !== 'playing') return;

    this.player.handleMovement(p, this.wallGrid, this.gridW, this.gridH);
    this.player.update();

    let bullet = this.player.handleShooting(p, this.bounces);
    if (bullet) this.bullets.push(bullet);

    for (let b of this.bullets) {
      b.update(this.wallGrid, this.gridW, this.gridH);
    }

    for (let b of this.bullets) {
      if (!b.alive) continue;

      for (let v of this.viruses) {
        if (!v.alive) continue;
        if (b.gridX === v.gridX && b.gridY === v.gridY) {
          v.alive = false;
          b.alive = false;
          this.score += 10;
          this.spawnParticles(v.gridX, v.gridY, v.col, 6);
        }
      }

      for (let s of this.sources) {
        if (!s.alive) continue;
        if (b.gridX === s.gridX && b.gridY === s.gridY) {
          b.alive = false;
          if (s.hit()) {
            this.score += 50;
            this.spawnParticles(s.gridX, s.gridY, [255, 100, 100], 12);
          }
        }
      }
    }

    this.bullets = this.bullets.filter(b => b.alive);

    for (let s of this.sources) {
      let v = s.update(this.wallGrid, this.viruses, this.gridW, this.gridH);
      if (v) this.viruses.push(v);
    }

    for (let v of this.viruses) {
      if (!v.alive) continue;
      v.update(this.wallGrid, this.viruses, this.sources, this.gridW, this.gridH, this.player.gridX, this.player.gridY);

      if (v.gridX === this.player.gridX && v.gridY === this.player.gridY) {
        this.player.takeDamage();
        v.alive = false;
        this.spawnParticles(v.gridX, v.gridY, [255, 255, 255], 4);
      }
    }

    this.viruses = this.viruses.filter(v => v.alive);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      let pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    if (this.messageTimer > 0) this.messageTimer--;

    this.updateCamera();

    if (!this.player.alive) {
      this.state = 'gameOver';
      return;
    }

    if (this.sources.every(s => !s.alive) && this.viruses.length === 0) {
      this.state = this.currentLevel < this.levels.length - 1 ? 'levelComplete' : 'win';
    }
  }

  draw() {
    let p = this.p;
    p.background(0);

    switch (this.state) {
      case 'menu':
        this.drawMenu(p);
        break;
      case 'playing':
        this.drawGame(p);
        break;
      case 'levelComplete':
        this.drawGame(p);
        this.drawOverlay(p, 'LEVEL CLEAR!', 'Press ENTER for next level', [80, 255, 80]);
        break;
      case 'gameOver':
        this.drawGame(p);
        this.drawOverlay(p, 'GAME OVER', 'Press ENTER to restart', [255, 80, 80]);
        break;
      case 'win':
        this.drawGame(p);
        this.drawOverlay(p, 'YOU WIN!', 'All viruses eliminated! Press ENTER', [255, 255, 80]);
        break;
    }
  }

  drawMenu(p) {
    p.textFont('Courier New');
    p.fill(80, 255, 80);
    p.textAlign(p.CENTER, p.CENTER);

    p.textSize(48);
    p.text('V I R U S', this.canvasW / 2, 70);

    p.textSize(14);
    p.fill(100, 200, 100);
    p.text('═══════════════════════════════════', this.canvasW / 2, 105);

    let faces = ['☺', '☻', 'Ö', '¤', '♦', 'Θ'];
    p.textSize(26);
    let startX = this.canvasW / 2 - (faces.length - 1) * 32;
    for (let i = 0; i < faces.length; i++) {
      let wave = Math.sin(p.frameCount * 0.05 + i * 0.8) * 10;
      let hue = (p.frameCount * 2 + i * 40) % 360;
      p.fill(
        128 + 127 * Math.sin(hue * 0.017),
        128 + 127 * Math.sin(hue * 0.017 + 2),
        128 + 127 * Math.sin(hue * 0.017 + 4)
      );
      p.text(faces[i], startX + i * 64, 145 + wave);
    }

    p.fill(200);
    p.textSize(16);
    p.text('SELECT LEVEL', this.canvasW / 2, 195);

    p.fill(100, 200, 100);
    p.textSize(14);
    p.text('═══════════════════════════════════', this.canvasW / 2, 215);

    for (let i = 0; i < this.levels.length; i++) {
      let lv = this.levels[i];
      let y = 250 + i * 32;
      let isHover = p.mouseY > y - 14 && p.mouseY < y + 14;
      let info = lv.name + '  ' + lv.width + 'x' + lv.height;
      if (lv.bounces > 0) info += '  [bounce:' + lv.bounces + ']';

      p.textSize(15);
      if (isHover) {
        p.fill(255, 255, 80);
        p.text('► ' + (i + 1) + '. ' + info + ' ◄', this.canvasW / 2, y);
      } else {
        p.fill(180);
        p.text('  ' + (i + 1) + '. ' + info, this.canvasW / 2, y);
      }
    }

    p.fill(100, 200, 100);
    p.textSize(14);
    p.text('═══════════════════════════════════', this.canvasW / 2, 430);

    p.fill(120);
    p.textSize(12);
    p.text('WASD: Move    Arrows: Shoot    ESC: Menu', this.canvasW / 2, 460);
    p.text('Move and shoot independently!', this.canvasW / 2, 480);
    p.text('Click level or press 1-5', this.canvasW / 2, 500);
  }

  drawGame(p) {
    p.textFont('Courier New');

    p.push();
    p.translate(-Math.round(this.cameraX), -Math.round(this.cameraY));

    let sx = Math.max(0, Math.floor(this.cameraX / this.tileSize) - 1);
    let sy = Math.max(0, Math.floor(this.cameraY / this.tileSize) - 1);
    let ex = Math.min(this.gridW, sx + this.viewTilesW + 3);
    let ey = Math.min(this.gridH, sy + this.viewTilesH + 3);

    for (let y = sy; y < ey; y++) {
      for (let x = sx; x < ex; x++) {
        if (this.wallGrid[y][x]) this.wallGrid[y][x].draw(p);
      }
    }

    for (let s of this.sources) {
      if (s.alive && this.isVisible(s.gridX, s.gridY)) s.draw(p);
    }
    for (let v of this.viruses) {
      if (v.alive && this.isVisible(v.gridX, v.gridY)) v.draw(p);
    }
    for (let b of this.bullets) {
      if (this.isVisible(b.gridX, b.gridY)) b.draw(p);
    }

    this.player.draw(p);

    for (let pt of this.particles) {
      let alpha = (pt.life / pt.maxLife) * 255;
      p.fill(pt.col[0], pt.col[1], pt.col[2], alpha);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(10);
      p.text(pt.char, pt.x, pt.y);
    }

    p.pop();

    if (this.messageTimer > 0) {
      let alpha = Math.min(255, this.messageTimer * 3);
      p.fill(255, 255, 80, alpha);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(22);
      p.text('LEVEL ' + (this.currentLevel + 1) + ': ' + this.levelName, this.viewW / 2, this.viewH / 2 - 20);
      p.textSize(14);
      p.fill(100, 255, 100, alpha);
      let info = this.gridW + '×' + this.gridH + ' map';
      if (this.bounces > 0) info += '  ·  Bounces: ' + this.bounces;
      p.text(info, this.viewW / 2, this.viewH / 2 + 10);
    }

    this.drawHUD(p);
    this.drawMinimap(p);
  }

  drawHUD(p) {
    let y = this.viewH;

    p.fill(15, 15, 30);
    p.noStroke();
    p.rect(0, y, this.canvasW, this.hudH);
    p.fill(40, 70, 40);
    p.rect(0, y, this.canvasW, 1);

    p.textFont('Courier New');
    p.textSize(14);

    p.fill(50, 255, 50);
    p.textAlign(p.LEFT, p.CENTER);
    p.text('LIVES: ' + '♥'.repeat(this.player.lives), 10, y + this.hudH / 2);

    p.fill(255, 255, 80);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('SCORE: ' + this.score, this.canvasW / 2, y + this.hudH / 2);

    let srcLeft = this.sources.filter(s => s.alive).length;
    let virLeft = this.viruses.filter(v => v.alive).length;
    p.fill(255, 100, 100);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text('SRC:' + srcLeft + ' VIR:' + virLeft, this.canvasW - 160, y + this.hudH / 2);
  }

  drawMinimap(p) {
    let mmW = 140;
    let mmH = Math.round(mmW * (this.gridH / this.gridW));
    let mmX = this.canvasW - mmW - 8;
    let mmY = this.viewH - mmH - 8;
    let scX = mmW / this.gridW;
    let scY = mmH / this.gridH;

    p.fill(0, 0, 0, 180);
    p.stroke(60, 60, 100);
    p.strokeWeight(1);
    p.rect(mmX, mmY, mmW, mmH);
    p.noStroke();

    let step = Math.max(1, Math.floor(1 / scX));
    for (let y = 0; y < this.gridH; y += step) {
      for (let x = 0; x < this.gridW; x += step) {
        if (this.wallGrid[y][x]) {
          p.fill(50, 50, 90);
          p.rect(mmX + x * scX, mmY + y * scY, Math.max(1, scX * step), Math.max(1, scY * step));
        }
      }
    }

    p.fill(255, 50, 50);
    for (let s of this.sources) {
      if (s.alive) {
        p.rect(mmX + s.gridX * scX - 1, mmY + s.gridY * scY - 1, 3, 3);
      }
    }

    p.fill(255, 80, 80, 200);
    for (let v of this.viruses) {
      if (v.alive) {
        p.rect(mmX + v.gridX * scX, mmY + v.gridY * scY, Math.max(1, scX), Math.max(1, scY));
      }
    }

    p.fill(50, 255, 50);
    p.rect(mmX + this.player.gridX * scX - 1, mmY + this.player.gridY * scY - 1, 3, 3);

    p.noFill();
    p.stroke(50, 255, 50, 80);
    p.strokeWeight(1);
    p.rect(
      mmX + (this.cameraX / this.tileSize) * scX,
      mmY + (this.cameraY / this.tileSize) * scY,
      this.viewTilesW * scX,
      this.viewTilesH * scY
    );
    p.noStroke();
  }

  drawOverlay(p, title, subtitle, col) {
    p.fill(0, 0, 0, 170);
    p.noStroke();
    p.rect(0, 0, this.canvasW, this.canvasH);

    p.textFont('Courier New');
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(36);
    p.fill(col[0], col[1], col[2]);
    p.text(title, this.canvasW / 2, this.canvasH / 2 - 30);

    p.textSize(16);
    p.fill(200);
    p.text(subtitle, this.canvasW / 2, this.canvasH / 2 + 20);

    p.textSize(14);
    p.fill(255, 255, 80);
    p.text('SCORE: ' + this.score, this.canvasW / 2, this.canvasH / 2 + 55);
  }

  keyPressed(key, keyCode) {
    let p = this.p;

    if (this.state === 'menu') {
      let num = parseInt(key);
      if (num >= 1 && num <= this.levels.length) {
        this.currentLevel = num - 1;
        this.score = 0;
        this.loadLevel(this.currentLevel);
      }
    }

    if (this.state === 'levelComplete' && keyCode === p.ENTER) {
      this.currentLevel++;
      this.loadLevel(this.currentLevel);
    }

    if (this.state === 'gameOver' && keyCode === p.ENTER) {
      this.score = 0;
      this.loadLevel(this.currentLevel);
    }

    if (this.state === 'win' && keyCode === p.ENTER) {
      this.state = 'menu';
      this.currentLevel = 0;
    }

    if (this.state === 'playing' && keyCode === p.ESCAPE) {
      this.state = 'menu';
    }
  }

  mousePressed() {
    if (this.state === 'menu') {
      for (let i = 0; i < this.levels.length; i++) {
        let y = 250 + i * 32;
        if (this.p.mouseY > y - 14 && this.p.mouseY < y + 14) {
          this.currentLevel = i;
          this.score = 0;
          this.loadLevel(this.currentLevel);
          break;
        }
      }
    }
  }
}
