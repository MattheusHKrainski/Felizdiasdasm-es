// js/scenes/EndScene.js
// Cutscene final em quatro atos: o baú abrindo, a carta revelada,
// a carta em si e a despedida.

class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: Game.CONFIG.SCENE.END });
  }

  create() {
    this.W = Game.CONFIG.WIDTH;
    this.H = Game.CONFIG.HEIGHT;

    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(2000);

    /** Cada ato é um método chamado em sequência. */
    this.acts = ['_actChestOpen', '_actLetterReveal', '_actLetter', '_actEnding'];
    this.actIndex = 0;
    this.content = [];

    this._buildFallingHearts();
    this._runAct();
  }

  _buildFallingHearts() {
    this.fallingHearts = [];
    for (let i = 0; i < 16; i++) {
      const heart = this.add.text(
        Phaser.Math.Between(0, this.W),
        Phaser.Math.Between(-this.H, this.H),
        Math.random() > 0.5 ? '❤️' : '💕',
        { fontSize: Phaser.Math.Between(12, 28) + 'px', alpha: 0.15 }
      ).setDepth(0);
      this.fallingHearts.push({ obj: heart, speed: Phaser.Math.FloatBetween(0.3, 1.2) });
    }
  }

  _runAct() {
    if (this.actIndex >= this.acts.length) return;
    this.content = [];
    this[this.acts[this.actIndex]]();
  }

  /** Avança para o próximo ato com fade. */
  _nextAct() {
    this.actIndex += 1;
    if (this.actIndex >= this.acts.length) return;

    this.cameras.main.fadeOut(800);
    this.time.delayedCall(820, () => {
      this.cameras.main.fadeIn(1000);
      this._clearContent();
      this._runAct();
    });
  }

  _clearContent() {
    this.content.forEach(obj => { if (obj && obj.destroy) obj.destroy(); });
    this.content = [];
  }

  /** Botão discreto "[ Toque para continuar ]" que aparece após `delay` ms. */
  _addContinueHint(y, label, delay, originY) {
    const hint = this.add.text(this.W / 2, y, label, {
      fontSize: '13px',
      color: '#888888',
      fontFamily: Game.CONFIG.FONT
    }).setOrigin(0.5, originY === undefined ? 0.5 : originY).setDepth(5).setAlpha(0)
      .setInteractive({ useHandCursor: true });

    this.content.push(hint);
    // Entra em fade e só depois pulsa — dois tweens no mesmo `alpha` brigariam.
    this.tweens.add({
      targets: hint,
      alpha: 1,
      duration: 800,
      delay,
      onComplete: () => {
        this.tweens.add({ targets: hint, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });
      }
    });
    hint.on('pointerdown', () => {
      Game.Audio.sfx('click');
      this._nextAct();
    });
    return hint;
  }

  // ── ATO 1 — O baú se abre ───────────────────────
  _actChestOpen() {
    const { W, H } = this;
    this.cameras.main.setBackgroundColor('#0a0a1a');

    this.content.push(this.add.text(W / 2, H * 0.15, '⚓ No Porto...', {
      fontSize: '20px',
      color: '#88aaff',
      fontFamily: Game.CONFIG.FONT,
      fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(5));

    const chest = this.add.image(W / 2, H * 0.42, 'chest').setScale(0.06).setDepth(5);
    this.content.push(chest);

    this.tweens.add({
      targets: chest,
      scaleX: 0.065,
      scaleY: 0.065,
      duration: 600,
      yoyo: true,
      repeat: 2,
      onComplete: () => this._burstHearts()
    });

    const caption = this.add.text(W / 2, H * 0.72, '"A bússola vibra...\nO baú se abre lentamente..."', {
      fontSize: '15px',
      color: '#ddddff',
      fontFamily: Game.CONFIG.FONT,
      align: 'center',
      fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(5).setAlpha(0);
    this.content.push(caption);
    this.tweens.add({ targets: caption, alpha: 1, duration: 1000, delay: 1500 });

    this._addContinueHint(H * 0.88, '[ Toque para continuar ]', 3000);
  }

  _burstHearts() {
    const { W, H } = this;
    Game.Audio.sfx('chest');
    this.cameras.main.flash(1000, 255, 220, 180);
    this.cameras.main.shake(500, 0.015);

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = W / 2 + Math.cos(angle) * Phaser.Math.Between(40, 120);
      const y = H * 0.42 + Math.sin(angle) * Phaser.Math.Between(30, 80);

      const heart = this.add.text(x, y, '❤️', { fontSize: '20px' }).setDepth(10);
      this.content.push(heart);
      this.tweens.add({
        targets: heart,
        x: x + Math.cos(angle) * 60,
        y: y + Math.sin(angle) * 60 - 30,
        alpha: 0,
        duration: 1200,
        ease: 'Power2'
      });
    }
  }

  // ── ATO 2 — Uma carta dentro do baú ─────────────
  _actLetterReveal() {
    const { W, H } = this;
    this.cameras.main.setBackgroundColor('#0d0a05');

    this.content.push(this.add.text(W / 2, H * 0.1, '✉️ Uma carta dentro do baú...', {
      fontSize: '16px',
      color: '#ddbb88',
      fontFamily: Game.CONFIG.FONT,
      fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(5));

    const paper = this.add.rectangle(W / 2, H * 0.48, W * 0.78, H * 0.52, 0xfff8e8)
      .setStrokeStyle(2, 0xd4aa60).setDepth(5).setScale(0.1);
    this.content.push(paper);
    this.tweens.add({ targets: paper, scaleX: 1, scaleY: 1, duration: 1200, ease: 'Back.easeOut' });

    const seal = this.add.text(W / 2, H * 0.48, '❤️', { fontSize: '36px' })
      .setOrigin(0.5).setDepth(6).setAlpha(0);
    this.content.push(seal);
    this.tweens.add({
      targets: seal,
      alpha: 1,
      duration: 600,
      delay: 1000,
      onComplete: () => {
        this.tweens.add({ targets: seal, scaleX: 1.3, scaleY: 1.3, duration: 400, yoyo: true, repeat: 2 });
      }
    });

    this._addContinueHint(H * 0.88, '[ Toque para abrir a carta ]', 2200);
  }

  // ── ATO 3 — A carta ─────────────────────────────
  _actLetter() {
    const { W, H } = this;
    this.cameras.main.setBackgroundColor('#fef9f0');

    const paper = this.add.rectangle(W / 2, H / 2, W - 20, H - 20, 0xfff8e8)
      .setStrokeStyle(2, 0xd4aa60).setDepth(2);
    this.content.push(paper);

    const corners = [
      { x: 14, y: 12, ox: 0, oy: 0 },
      { x: W - 14, y: 12, ox: 1, oy: 0 },
      { x: 14, y: H - 12, ox: 0, oy: 1 },
      { x: W - 14, y: H - 12, ox: 1, oy: 1 }
    ];
    corners.forEach(c => {
      this.content.push(
        this.add.text(c.x, c.y, '🌸', { fontSize: '18px' }).setOrigin(c.ox, c.oy).setDepth(3)
      );
    });

    const letter = this.add.text(W / 2, H * 0.5, EndScene.LETTER_TEXT, {
      fontSize: '14px',
      color: '#3a2a1a',
      fontFamily: Game.CONFIG.FONT,
      align: 'center',
      lineSpacing: 6,
      wordWrap: { width: W - 50 }
    }).setOrigin(0.5).setDepth(5).setAlpha(0);
    this.content.push(letter);
    this.tweens.add({ targets: letter, alpha: 1, duration: 2000, delay: 400 });

    this._addContinueHint(H - 18, '[ Toque para continuar ]', 3500, 1);
  }

  // ── ATO 4 — Despedida ───────────────────────────
  _actEnding() {
    const { W, H } = this;
    this.cameras.main.setBackgroundColor('#0d0a1a');

    const heart = this.add.text(W / 2, H * 0.18, '❤️', { fontSize: '72px' })
      .setOrigin(0.5).setDepth(5).setAlpha(0);
    this.content.push(heart);
    this.tweens.add({
      targets: heart,
      alpha: 1,
      duration: 1200,
      onComplete: () => {
        this.tweens.add({
          targets: heart,
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    const message = this.add.text(W / 2, H * 0.44, 'Feliz Dia das Mães! 🌸\n\nEspero que tenha\ngostado da aventura!\n\nTe amo! ❤️', {
      fontSize: '20px',
      color: Game.CONFIG.PALETTE.pink,
      fontFamily: Game.CONFIG.FONT,
      align: 'center',
      lineSpacing: 8,
      stroke: Game.CONFIG.PALETTE.pinkDark,
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(5).setAlpha(0);
    this.content.push(message);
    this.tweens.add({ targets: message, alpha: 1, duration: 1500, delay: 1000 });

    const button = this.add.text(W / 2, H * 0.82, ' VOLTAR À CIDADE ▶ ', {
      fontSize: '17px',
      color: '#ffffff',
      fontFamily: Game.CONFIG.FONT,
      backgroundColor: Game.CONFIG.PALETTE.red,
      padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setDepth(5).setAlpha(0).setInteractive({ useHandCursor: true });
    this.content.push(button);
    this.tweens.add({ targets: button, alpha: 1, duration: 800, delay: 3000 });
    this.tweens.add({
      targets: button,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 700,
      yoyo: true,
      repeat: -1,
      delay: 3000,
      ease: 'Sine.easeInOut'
    });

    button.on('pointerdown', () => {
      Game.Audio.sfx('click');
      this.cameras.main.fadeOut(800);
      this.time.delayedCall(820, () => this.scene.start(Game.CONFIG.SCENE.WORLD));
    });
  }

  update() {
    const { W, H } = this;
    this.fallingHearts.forEach(heart => {
      heart.obj.y += heart.speed;
      if (heart.obj.y > H + 30) {
        heart.obj.y = -30;
        heart.obj.x = Phaser.Math.Between(0, W);
      }
    });
  }
}

/** A carta do Dia das Mães. */
EndScene.LETTER_TEXT = [
  'Mãe,',
  '',
  'Escrever isso foi mais difícil',
  'do que qualquer puzzle desse',
  'jogo. Mas aqui vai:',
  '',
  'Obrigado por cada manhã',
  'que você se levantou antes',
  'de mim. Por cada abraço',
  'quando eu precisei.',
  '',
  'Por ser minha mãe. ❤️',
  '',
  'Com amor,',
  'Mattheus 🌸'
].join('\n');
