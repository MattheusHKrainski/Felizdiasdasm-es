// js/systems/player.js
// Criação e movimentação do jogador. Compartilhado entre WorldScene,
// HouseScene e Puzzle2Scene.

window.Game = window.Game || {};

(function () {
  'use strict';

  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} [scale] Escala do sprite; padrão é CONFIG.PLAYER_SCALE.
   */
  function create(scene, x, y, scale) {
    return scene.physics.add.sprite(x, y, 'player_sheet', 0)
      .setScale(scale === undefined ? Game.CONFIG.PLAYER_SCALE : scale)
      .setDepth(10)
      .setCollideWorldBounds(true);
  }

  /**
   * Aplica velocidade e escolhe a animação conforme a direção.
   *
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {{x: number, y: number}} direction Já normalizada pelo chamador.
   * @param {number} [speed]
   */
  function move(player, direction, speed) {
    const dx = direction.x;
    const dy = direction.y;
    const velocity = speed === undefined ? Game.CONFIG.PLAYER_SPEED : speed;

    player.setVelocity(dx * velocity, dy * velocity);

    const moving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;
    if (!moving) {
      player.anims.stop();
      player.setFrame(0);
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      player.anims.play('walk_side', true);
      player.setFlipX(dx < 0);
    } else if (dy > 0.1) {
      player.anims.play('walk_down', true);
    } else {
      player.anims.play('walk_up', true);
    }
  }

  /** Para o jogador e congela a animação (usado durante diálogos). */
  function freeze(player) {
    player.setVelocity(0);
    player.anims.pause();
  }

  Game.Player = { create, move, freeze };
})();
