// js/systems/controls.js
// Controles compartilhados: joystick virtual + botão de ação no celular,
// setas/WASD + espaço/enter no desktop.
//
// Antes existia uma cópia do joystick em WorldScene e outra em Puzzle2Scene.

window.Game = window.Game || {};

(function () {
  'use strict';

  const CFG = () => Game.CONFIG;

  /** Direção do teclado normalizada para -1 / 0 / 1 em cada eixo. */
  function createKeyboard(scene) {
    const cursors = scene.input.keyboard.createCursorKeys();
    const keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      action: Phaser.Input.Keyboard.KeyCodes.SPACE,
      action2: Phaser.Input.Keyboard.KeyCodes.ENTER
    });

    const isDown = k => Boolean(k && k.isDown);

    return {
      direction() {
        const x = (isDown(cursors.right) || isDown(keys.right) ? 1 : 0)
                - (isDown(cursors.left) || isDown(keys.left) ? 1 : 0);
        const y = (isDown(cursors.down) || isDown(keys.down) ? 1 : 0)
                - (isDown(cursors.up) || isDown(keys.up) ? 1 : 0);
        return { x, y };
      },
      /** Liga `callback` ao pressionar espaço/enter. */
      onAction(callback) {
        const fire = () => callback();
        keys.action.on('down', fire);
        keys.action2.on('down', fire);
      }
    };
  }

  /**
   * Cria o joystick e o botão de ação.
   *
   * @param {Phaser.Scene} scene
   * @param {{onAction: Function, showActionButton?: boolean}} options
   * @returns {{getDirection: Function, destroy: Function}}
   */
  function create(scene, options) {
    const opts = options || {};
    const W = scene.scale.width;
    const H = scene.scale.height;

    const origin = { x: 70, y: H - 80 };
    const MAX_RADIUS = 36;
    const DEAD_ZONE = 8;

    const base = scene.add.circle(origin.x, origin.y, 40, 0x333355, 0.5)
      .setScrollFactor(0).setDepth(60).setInteractive();
    const stick = scene.add.circle(origin.x, origin.y, 18, 0x8888cc, 0.8)
      .setScrollFactor(0).setDepth(61);

    let dragging = false;
    let touchDir = { x: 0, y: 0 };

    const resetStick = () => {
      dragging = false;
      touchDir = { x: 0, y: 0 };
      stick.setPosition(origin.x, origin.y);
    };

    const onMove = pointer => {
      if (!dragging) return;
      let dx = pointer.x - origin.x;
      let dy = pointer.y - origin.y;
      const dist = Math.hypot(dx, dy);
      if (dist > MAX_RADIUS) {
        dx = (dx / dist) * MAX_RADIUS;
        dy = (dy / dist) * MAX_RADIUS;
      }
      stick.setPosition(origin.x + dx, origin.y + dy);
      const len = Math.hypot(dx, dy);
      touchDir = len > DEAD_ZONE ? { x: dx / len, y: dy / len } : { x: 0, y: 0 };
    };

    base.on('pointerdown', () => { dragging = true; });
    scene.input.on('pointermove', onMove);
    scene.input.on('pointerup', resetStick);
    scene.input.on('pointerupoutside', resetStick);

    let actionButton = null;
    if (opts.showActionButton !== false && typeof opts.onAction === 'function') {
      actionButton = scene.add.text(W - 16, H - 24, ' A ', {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: CFG().FONT,
        backgroundColor: CFG().PALETTE.red,
        padding: { x: 10, y: 6 }
      }).setOrigin(1, 1).setScrollFactor(0).setDepth(60).setInteractive({ useHandCursor: true });

      actionButton.on('pointerdown', () => {
        Game.Audio.sfx('click');
        opts.onAction();
      });
    }

    const keyboard = scene.input.keyboard ? createKeyboard(scene) : null;
    if (keyboard && typeof opts.onAction === 'function') {
      keyboard.onAction(() => {
        Game.Audio.sfx('click');
        opts.onAction();
      });
    }

    return {
      /** Direção combinada (toque tem prioridade sobre o teclado). */
      getDirection() {
        if (touchDir.x !== 0 || touchDir.y !== 0) return touchDir;
        return keyboard ? keyboard.direction() : { x: 0, y: 0 };
      },
      destroy() {
        scene.input.off('pointermove', onMove);
        scene.input.off('pointerup', resetStick);
        scene.input.off('pointerupoutside', resetStick);
        base.destroy();
        stick.destroy();
        if (actionButton) actionButton.destroy();
      }
    };
  }

  Game.Controls = { create };
})();
