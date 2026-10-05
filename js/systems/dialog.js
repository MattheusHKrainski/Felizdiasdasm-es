// js/systems/dialog.js
// Caixa de diálogo sequencial, usada no WorldScene e no HouseScene.

window.Game = window.Game || {};

(function () {
  'use strict';

  /**
   * Abre uma caixa de diálogo.
   *
   * @param {Phaser.Scene} scene
   * @param {string[]} lines        Uma linha por avanço do jogador.
   * @param {Function} [onClose]    Chamado quando a última linha é dispensada.
   * @returns {{advance: Function, close: Function, readonly isOpen: boolean}}
   */
  function open(scene, lines, onClose) {
    const W = scene.scale.width;
    const H = scene.scale.height;
    const palette = Game.CONFIG.PALETTE;

    let step = 0;
    let finished = false;

    const container = scene.add.container(0, 0).setScrollFactor(0).setDepth(80);

    const background = scene.add.rectangle(W / 2, H - 80, W - 16, 140, palette.dialogBg, 0.93)
      .setStrokeStyle(2, palette.dialogStroke);

    const text = scene.add.text(16, H - 145, '', {
      fontSize: '13px',
      color: palette.textBody,
      fontFamily: Game.CONFIG.FONT,
      wordWrap: { width: W - 36 },
      lineSpacing: 3
    });

    const arrow = scene.add.text(W - 24, H - 20, '▼', {
      fontSize: '11px',
      color: palette.dialogStroke,
      fontFamily: Game.CONFIG.FONT
    });
    scene.tweens.add({ targets: arrow, alpha: 0.1, duration: 500, yoyo: true, repeat: -1 });

    container.add([background, text, arrow]);

    function close() {
      if (finished) return;
      finished = true;
      container.destroy();
      if (typeof onClose === 'function') onClose();
    }

    function advance() {
      if (finished) return;
      if (step >= lines.length) {
        close();
        return;
      }
      text.setText(lines[step]);
      step += 1;
    }

    advance();

    return {
      get isOpen() { return !finished; },
      advance,
      close
    };
  }

  Game.Dialog = { open };
})();
