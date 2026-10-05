// js/systems/hud.js
// Barra fixa no topo da tela. O WorldScene usa para mostrar os itens coletados.

window.Game = window.Game || {};

(function () {
  'use strict';

  /**
   * @param {Phaser.Scene} scene
   * @param {string} initialText
   * @param {{height?: number}} [options]
   * @returns {{setText: Function, destroy: Function}}
   */
  function create(scene, initialText, options) {
    const opts = options || {};
    const W = scene.scale.width;
    const height = opts.height || 44;
    const palette = Game.CONFIG.PALETTE;

    const background = scene.add.rectangle(W / 2, height / 2, W, height, palette.hudBg, 0.75)
      .setScrollFactor(0).setDepth(50);

    const text = scene.add.text(10, 8, initialText, {
      fontSize: '10px',
      color: '#ffddee',
      fontFamily: Game.CONFIG.FONT,
      wordWrap: { width: W - 20 }
    }).setScrollFactor(0).setDepth(51);

    return {
      setText(value) {
        if (text.text !== value) text.setText(value);
      },
      destroy() {
        background.destroy();
        text.destroy();
      }
    };
  }

  Game.Hud = { create };
})();
