// js/config.js
// Constantes globais do jogo. Carregado primeiro, antes de qualquer cena.
// Não usamos ES modules de propósito: o projeto roda direto no GitHub Pages.

window.Game = window.Game || {};

/**
 * Dimensões e afins. Tudo em pixels do canvas lógico (360x640).
 */
Game.CONFIG = Object.freeze({
  WIDTH: 360,
  HEIGHT: 640,
  BACKGROUND: '#1a1a2e',

  /** Tamanho de um tile do mapa, em pixels. */
  TILE: 32,

  /** Mundo do WorldScene em tiles -> 1280 x 1760 px. */
  WORLD_COLS: 40,
  WORLD_ROWS: 55,

  /** Velocidade de caminhada do jogador. */
  PLAYER_SPEED: 100,
  /** Escala do sprite (a folha original tem frames de 384x341). */
  PLAYER_SCALE: 0.038,

  /** Distância máxima, em px, para interagir com um NPC ou objeto. */
  INTERACT_RANGE: 60,

  /** Quantos acertos o quiz da floresta exige para liberar o caminho. */
  QUIZ_MIN_SCORE: 2,

  /** Tempo do puzzle da montanha, em segundos. */
  HEART_HUNT_SECONDS: 60,

  /** Chaves das cenas — evita "strings mágicas" espalhadas pelo código. */
  SCENE: Object.freeze({
    BOOT: 'BootScene',
    MENU: 'MenuScene',
    HOUSE: 'HouseScene',
    WORLD: 'WorldScene',
    PUZZLE_QUIZ: 'Puzzle1Scene',
    PUZZLE_HEARTS: 'Puzzle2Scene',
    PUZZLE_LOVE: 'Puzzle3Scene',
    END: 'EndScene',
    CREDITS: 'CreditsScene'
  }),

  /** Paleta compartilhada. */
  PALETTE: Object.freeze({
    pink: '#ffb3c6',
    pinkDark: '#3d0a20',
    red: '#cc2244',
    textDim: '#998899',
    textBody: '#ffffff',
    hudBg: 0x000022,
    dialogBg: 0x000033,
    dialogStroke: 0xff88aa
  }),

  /** Fonte usada em todo o jogo. */
  FONT: 'monospace'
});
