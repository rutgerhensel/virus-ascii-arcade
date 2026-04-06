class Level {

  static getLevels() {
    return [
      { name: 'OUTBREAK',     width: 100, height: 80,  bounces: 3, numSources: 3,  virusPerSource: 3, spawnRate: 500, bouncyChance: 0,    destructChance: 0.01 },
      { name: 'BOUNCE HOUSE', width: 120, height: 90,  bounces: 3, numSources: 5,  virusPerSource: 3, spawnRate: 450, bouncyChance: 0.12, destructChance: 0.02 },
      { name: 'THE MAZE',     width: 140, height: 100, bounces: 3, numSources: 6,  virusPerSource: 4, spawnRate: 400, bouncyChance: 0.04, destructChance: 0.06 },
      { name: 'CROSSFIRE',    width: 160, height: 110, bounces: 3, numSources: 8,  virusPerSource: 4, spawnRate: 350, bouncyChance: 0.08, destructChance: 0.04 },
      { name: 'LAST STAND',   width: 180, height: 120, bounces: 3, numSources: 10, virusPerSource: 5, spawnRate: 300, bouncyChance: 0.10, destructChance: 0.05 },
    ];
  }

  static generate(config, tileSize) {
    let { width, height, numSources, virusPerSource, spawnRate,
          bounces, name, bouncyChance, destructChance } = config;

    let grid = [];
    for (let y = 0; y < height; y++) {
      grid[y] = new Array(width).fill('#');
    }

    let wallThick = 1;
    let targetTube = 10;
    let innerW = width - 2;
    let innerH = height - 2;

    let numCX = Math.max(2, Math.round(innerW / (targetTube + wallThick)));
    let numCY = Math.max(2, Math.round(innerH / (targetTube + wallThick)));

    let totalWX = (numCX - 1) * wallThick;
    let baseTW = Math.floor((innerW - totalWX) / numCX);
    let extraTW = (innerW - totalWX) - baseTW * numCX;

    let totalWY = (numCY - 1) * wallThick;
    let baseTH = Math.floor((innerH - totalWY) / numCY);
    let extraTH = (innerH - totalWY) - baseTH * numCY;

    let cellsX = [];
    let cx = 1;
    for (let i = 0; i < numCX; i++) {
      let tw = baseTW + (i < extraTW ? 1 : 0);
      cellsX.push({ start: cx, end: cx + tw - 1 });
      cx += tw + wallThick;
    }

    let cellsY = [];
    let cy = 1;
    for (let i = 0; i < numCY; i++) {
      let th = baseTH + (i < extraTH ? 1 : 0);
      cellsY.push({ start: cy, end: cy + th - 1 });
      cy += th + wallThick;
    }

    // Clear all cell interiors (they start as walls)
    for (let r = 0; r < numCY; r++) {
      for (let c = 0; c < numCX; c++) {
        for (let y = cellsY[r].start; y <= cellsY[r].end; y++) {
          for (let x = cellsX[c].start; x <= cellsX[c].end; x++) {
            grid[y][x] = '.';
          }
        }
      }
    }

    // Maze via randomised DFS
    let visited = [];
    for (let r = 0; r < numCY; r++) visited[r] = new Array(numCX).fill(false);

    let connections = [];
    let stack = [{ cx: 0, cy: 0 }];
    visited[0][0] = true;

    while (stack.length > 0) {
      let cur = stack[stack.length - 1];
      let nb = [];
      for (let d of [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }]) {
        let nx = cur.cx + d.dx, ny = cur.cy + d.dy;
        if (nx >= 0 && nx < numCX && ny >= 0 && ny < numCY && !visited[ny][nx]) {
          nb.push({ cx: nx, cy: ny });
        }
      }
      if (nb.length > 0) {
        let next = nb[Math.floor(Math.random() * nb.length)];
        connections.push({ cx1: cur.cx, cy1: cur.cy, cx2: next.cx, cy2: next.cy });
        visited[next.cy][next.cx] = true;
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    // Few extra connections for occasional loops (keeps long tubes)
    let extras = Math.floor(numCX * numCY * 0.12);
    for (let i = 0; i < extras; i++) {
      let rx = Math.floor(Math.random() * numCX);
      let ry = Math.floor(Math.random() * numCY);
      let dir = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }][Math.floor(Math.random() * 2)];
      let nx = rx + dir.dx, ny = ry + dir.dy;
      if (nx >= numCX || ny >= numCY) continue;
      let exists = connections.some(c =>
        (c.cx1 === rx && c.cy1 === ry && c.cx2 === nx && c.cy2 === ny) ||
        (c.cx1 === nx && c.cy1 === ny && c.cx2 === rx && c.cy2 === ry)
      );
      if (!exists) connections.push({ cx1: rx, cy1: ry, cx2: nx, cy2: ny });
    }

    // Remove full wall between connected cells → creates continuous tubes
    for (let conn of connections) {
      let c1x = cellsX[conn.cx1], c1y = cellsY[conn.cy1];
      let c2x = cellsX[conn.cx2], c2y = cellsY[conn.cy2];

      if (conn.cx1 !== conn.cx2) {
        // Horizontal neighbours → remove vertical wall between them
        let wallX = Math.min(c1x.end, c2x.end) + 1;
        let yStart = Math.max(c1y.start, c2y.start);
        let yEnd = Math.min(c1y.end, c2y.end);
        for (let y = yStart; y <= yEnd; y++) {
          for (let d = 0; d < wallThick; d++) {
            if (wallX + d < width - 1) grid[y][wallX + d] = '.';
          }
        }
      } else {
        // Vertical neighbours → remove horizontal wall between them
        let wallY = Math.min(c1y.end, c2y.end) + 1;
        let xStart = Math.max(c1x.start, c2x.start);
        let xEnd = Math.min(c1x.end, c2x.end);
        for (let x = xStart; x <= xEnd; x++) {
          for (let d = 0; d < wallThick; d++) {
            if (wallY + d < height - 1) grid[wallY + d][x] = '.';
          }
        }
      }
    }

    // Bouncy / destructible walls (only on edges touching open space)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (grid[y][x] !== '#') continue;
        let adj = (grid[y - 1][x] === '.' || grid[y + 1][x] === '.' ||
                   grid[y][x - 1] === '.' || grid[y][x + 1] === '.');
        if (!adj) continue;
        if (Math.random() < bouncyChance) grid[y][x] = 'B';
        else if (Math.random() < destructChance) grid[y][x] = 'D';
      }
    }

    // Player in top-left cell
    let pcx = Math.floor((cellsX[0].start + cellsX[0].end) / 2);
    let pcy = Math.floor((cellsY[0].start + cellsY[0].end) / 2);
    grid[pcy][pcx] = 'P';

    // Sources in farthest cells
    let allCells = [];
    for (let r = 0; r < numCY; r++) {
      for (let c = 0; c < numCX; c++) {
        let ccx = Math.floor((cellsX[c].start + cellsX[c].end) / 2);
        let ccy = Math.floor((cellsY[r].start + cellsY[r].end) / 2);
        allCells.push({ col: c, row: r, centerX: ccx, centerY: ccy,
                        dist: Math.abs(ccx - pcx) + Math.abs(ccy - pcy) });
      }
    }
    allCells.sort((a, b) => b.dist - a.dist);

    let srcChars = ['S', 'T', 'U'];
    let virChars = ['V', 'W', 'X'];

    for (let i = 0; i < numSources && i < allCells.length; i++) {
      let cell = allCells[i];
      let t = i % srcChars.length;
      grid[cell.centerY][cell.centerX] = srcChars[t];

      let placed = 0;
      for (let dy = -3; dy <= 3 && placed < virusPerSource; dy++) {
        for (let dx = -3; dx <= 3 && placed < virusPerSource; dx++) {
          if (dx === 0 && dy === 0) continue;
          let vx = cell.centerX + dx, vy = cell.centerY + dy;
          if (vx > 0 && vx < width - 1 && vy > 0 && vy < height - 1 && grid[vy][vx] === '.') {
            grid[vy][vx] = virChars[t];
            placed++;
          }
        }
      }
    }

    let map = grid.map(row => row.join(''));
    return { name, bounces, spawnRate, map };
  }

  static parse(levelData, tileSize) {
    let viruses = [];
    let sources = [];
    let playerStart = { x: 1, y: 1 };
    let map = levelData.map;
    let gridH = map.length;
    let gridW = map[0].length;

    let wallGrid = [];
    for (let y = 0; y < gridH; y++) {
      wallGrid[y] = [];
      for (let x = 0; x < gridW; x++) {
        wallGrid[y][x] = null;
      }
    }

    for (let row = 0; row < gridH; row++) {
      for (let col = 0; col < gridW; col++) {
        let ch = map[row][col];
        switch (ch) {
          case '#': wallGrid[row][col] = new Wall(col, row, tileSize, 'solid'); break;
          case 'B': wallGrid[row][col] = new Wall(col, row, tileSize, 'bouncy'); break;
          case 'D': wallGrid[row][col] = new Wall(col, row, tileSize, 'destructible'); break;
          case 'P': playerStart = { x: col, y: row }; break;
          case 'S': sources.push(new Source(col, row, tileSize, 0, levelData.spawnRate)); break;
          case 'T': sources.push(new Source(col, row, tileSize, 1, levelData.spawnRate)); break;
          case 'U': sources.push(new Source(col, row, tileSize, 2, levelData.spawnRate)); break;
          case 'V': viruses.push(new Virus(col, row, tileSize, 0)); break;
          case 'W': viruses.push(new Virus(col, row, tileSize, 1)); break;
          case 'X': viruses.push(new Virus(col, row, tileSize, 2)); break;
        }
      }
    }

    for (let row = 0; row < gridH; row++) {
      for (let col = 0; col < gridW; col++) {
        let w = wallGrid[row][col];
        if (!w) continue;
        let up    = row > 0          && wallGrid[row - 1][col] !== null;
        let down  = row < gridH - 1  && wallGrid[row + 1][col] !== null;
        let left  = col > 0          && wallGrid[row][col - 1] !== null;
        let right = col < gridW - 1  && wallGrid[row][col + 1] !== null;
        w.setBoxChar(up, down, left, right);
      }
    }

    return { wallGrid, viruses, sources, playerStart, gridW, gridH, bounces: levelData.bounces, name: levelData.name };
  }
}
