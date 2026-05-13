// js/main.js
// ─────────────────────────────────────────
// Carrega todas as scenes via tag <script> no HTML
// (sem ES modules para compatibilidade máxima com GitHub Pages)
// As scenes são declaradas como variáveis globais em cada arquivo

window.addEventListener('load', () => {

  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 360,
    height: 640,
    backgroundColor: '#1a1a2e',
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

    // Ordem das scenes
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
  };

  window.GAME = new Phaser.Game(config);

  // Estado global do jogo
  window.GAME_STATE = {
    hasMapPiece:  false,
    hasKey:       false,
    hasCompass:   false,
    chestOpened:  false,
    puzzle1Done:  false,
    puzzle2Done:  false,
    puzzle3Done:  false,
    npcGreeted:   false   // NPC do fone no final
  };
});