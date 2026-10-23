// js/main.js
// Ponto de entrada: monta a configuração do Phaser e liga o jogo.
// Deve ser o último <script> do index.html.

window.addEventListener('load', () => {
  const CFG = Game.CONFIG;

  window.GAME = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-container',
    width: CFG.WIDTH,
    height: CFG.HEIGHT,
    backgroundColor: CFG.BACKGROUND,
    pixelArt: true,

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },

    scene: [
      BootScene,
      MenuScene,
      HouseScene,
      WorldScene,
      Puzzle1Scene,
      Puzzle2Scene,
      Puzzle3Scene,
      EndScene,
      CreditsScene
    ]
  });

  Game.State.reset();
});
