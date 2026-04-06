# VIRUS - ASCII Arcade

A retro ASCII shooter inspired by the classic DOS game *Virus*. Built with [p5.js](https://p5js.org/).

Navigate procedurally generated maze-like maps, hunt down virus sources, and destroy every last virus — before they overwhelm you.

## Play

Open `index.html` in a browser, or host it on any static server (e.g. GitHub Pages).

## Controls

| Action | Keys |
|--------|------|
| Move | **W A S D** |
| Shoot | **Arrow keys** |

Movement and shooting are independent — you can run in one direction while firing in another.

## Gameplay

- Each level is a large scrolling map of corridors rendered in box-drawing characters.
- **Virus sources** continuously spawn viruses. Destroy the sources first, then clean up.
- Bullets bounce off walls up to 3 times.
- **Friendly fire is on** — your own bullets can kill you.
- A minimap in the corner shows the full layout, sources, and viruses.
- 5 levels of increasing size and difficulty.

## Tech

Pure client-side JavaScript — no build step, no dependencies beyond p5.js (loaded from CDN).

```
index.html          Entry point
js/
  sketch.js         p5.js setup and draw loop
  Game.js           Game state, camera, collisions, HUD
  Player.js         Movement, aiming, shooting, health
  Bullet.js         Projectile movement, bouncing, animation
  Virus.js          Enemy AI and movement
  Source.js          Virus spawner logic
  Wall.js           Wall tiles with box-drawing characters
  Level.js          Procedural maze generation and level configs
  Sound.js          Retro sound effects via Web Audio API
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings > Pages**.
3. Set source to the **main** branch and root folder.
4. Your game will be live at `https://<username>.github.io/<repo>/`.
