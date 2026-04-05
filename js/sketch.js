let game;

function setup() {
  game = new Game(window);
  game.init();
  textFont('Courier New');
}

function draw() {
  game.update();
  game.draw();
}

function keyPressed() {
  game.keyPressed(key, keyCode);
  return false;
}

function mousePressed() {
  game.mousePressed();
}
