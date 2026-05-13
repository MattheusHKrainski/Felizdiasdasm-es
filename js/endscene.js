// js/scenes/EndScene.js
// Cutscene final com a carta do Dia das Mães

var EndScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function () {
    Phaser.Scene.call(this, { key: 'EndScene' });
  },

  create: function () {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;

    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(2000);

    this._step = 0;
    this._cutscenes = [
      { type: 'scene', fn: '_sceneChestOpen' },
      { type: 'scene', fn: '_sceneLetterReveal' },
      { type: 'scene', fn: '_sceneLetter' },
      { type: 'scene', fn: '_sceneEnding' }
    ];

    // Corações caindo no fundo (sempre visíveis)
    this._fallingHearts = [];
    for (var i = 0; i < 16; i++) {
      var fh = this.add.text(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(-H, H),
        Math.random() > 0.5 ? '❤️' : '💕',
        { fontSize: Phaser.Math.Between(12, 28) + 'px', alpha: 0.15 }
      ).setDepth(0);
      this._fallingHearts.push({ obj: fh, speed: Phaser.Math.FloatBetween(0.3, 1.2) });
    }

    this._runStep();
  },

  _runStep: function() {
    if (this._step >= this._cutscenes.length) return;
    var scene = this._cutscenes[this._step];
    this[scene.fn]();
  },

  _nextStep: function() {
    this._step++;
    if (this._step < this._cutscenes.length) {
      this.cameras.main.fadeOut(800);
      var self = this;
      this.time.delayedCall(820, function() {
        self.cameras.main.fadeIn(1000);
        self._clearContent();
        self._runStep();
      });
    }
  },

  _clearContent: function() {
    if (this._content) {
      this._content.forEach(function(obj) {
        if (obj && obj.destroy) obj.destroy();
      });
    }
    this._content = [];
  },

  // ── CENA 1: Baú abrindo ───────────────────────
  _sceneChestOpen: function() {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;
    this._content = [];

    this.cameras.main.setBackgroundColor('#0a0a1a');

    var title = this.add.text(W/2, H*0.15, '⚓ No Porto...', {
      fontSize: '20px',
      color: '#88aaff',
      fontFamily: 'monospace',
      fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(5);
    this._content.push(title);

    // Baú
    var chest = this.add.image(W/2, H*0.42, 'chest')
      .setScale(0.06)
      .setDepth(5);
    this._content.push(chest);

    // Pulsa
    this.tweens.add({
      targets: chest,
      scaleX: 0.065, scaleY: 0.065,
      duration: 600,
      yoyo: true,
      repeat: 2,
      onComplete: function() {
        // Flash de abertura
        self.cameras.main.flash(1000, 255, 220, 180);
        self.cameras.main.shake(500, 0.015);

        // Corações explodindo
        for (var i = 0; i < 12; i++) {
          var angle = (i / 12) * Math.PI * 2;
          var hx = W/2 + Math.cos(angle) * Phaser.Math.Between(40, 120);
          var hy = H*0.42 + Math.sin(angle) * Phaser.Math.Between(30, 80);
          var hobj = self.add.text(hx, hy, '❤️', { fontSize: '20px' }).setDepth(10);
          self._content.push(hobj);
          self.tweens.add({
            targets: hobj,
            x: hx + Math.cos(angle) * 60,
            y: hy + Math.sin(angle) * 60 - 30,
            alpha: 0,
            duration: 1200,
            ease: 'Power2'
          });
        }
      }
    });

    var dialog = this.add.text(W/2, H*0.72,
      '"A bússola vibra...\nO baú se abre lentamente..."',
      {
        fontSize: '15px',
        color: '#ddddff',
        fontFamily: 'monospace',
        align: 'center',
        fontStyle: 'italic'
      }
    ).setOrigin(0.5).setDepth(5).setAlpha(0);
    this._content.push(dialog);

    this.tweens.add({ targets: dialog, alpha: 1, duration: 1000, delay: 1500 });

    var btn = this.add.text(W/2, H*0.88, '[ Toque para continuar ]', {
      fontSize: '13px',
      color: '#888888',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(5).setAlpha(0).setInteractive({ useHandCursor: true });
    this._content.push(btn);
    this.tweens.add({ targets: btn, alpha: 1, duration: 800, delay: 3000 });
    this.tweens.add({ targets: btn, alpha: 0.3, duration: 700, yoyo: true, repeat: -1, delay: 3000 });

    btn.on('pointerdown', function() { self._nextStep(); });
  },

  // ── CENA 2: Carta sendo revelada ─────────────
  _sceneLetterReveal: function() {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;
    this._content = [];

    this.cameras.main.setBackgroundColor('#0d0a05');

    var subtitle = this.add.text(W/2, H*0.1, '✉️ Uma carta dentro do baú...', {
      fontSize: '16px',
      color: '#ddbb88',
      fontFamily: 'monospace',
      fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(5);
    this._content.push(subtitle);

    // Carta (retângulo estilo papel)
    var paper = this.add.rectangle(W/2, H*0.48, W*0.78, H*0.52, 0xfff8e8)
      .setStrokeStyle(2, 0xd4aa60).setDepth(5).setScale(0.1);
    this._content.push(paper);

    this.tweens.add({
      targets: paper,
      scaleX: 1, scaleY: 1,
      duration: 1200,
      ease: 'Back.easeOut'
    });

    // Lacre
    var seal = this.add.text(W/2, H*0.48, '❤️', { fontSize: '36px' })
      .setOrigin(0.5).setDepth(6).setAlpha(0);
    this._content.push(seal);

    this.tweens.add({ targets: seal, alpha: 1, duration: 600, delay: 1000,
      onComplete: function() {
        self.tweens.add({
          targets: seal,
          scaleX: 1.3, scaleY: 1.3,
          duration: 400,
          yoyo: true,
          repeat: 2
        });
      }
    });

    var hint = this.add.text(W/2, H*0.88, '[ Toque para abrir a carta ]', {
      fontSize: '13px', color: '#888888', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(5).setAlpha(0).setInteractive({ useHandCursor: true });
    this._content.push(hint);

    this.tweens.add({ targets: hint, alpha: 1, duration: 800, delay: 2200 });
    hint.on('pointerdown', function() { self._nextStep(); });
  },

  // ── CENA 3: A carta ───────────────────────────
  _sceneLetter: function() {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;
    this._content = [];

    this.cameras.main.setBackgroundColor('#fef9f0');

    // Papel de carta
    var paper = this.add.rectangle(W/2, H/2, W - 20, H - 20, 0xfff8e8)
      .setStrokeStyle(2, 0xd4aa60).setDepth(2);
    this._content.push(paper);

    // Decoração de bordas
    var borderTL = this.add.text(14, 12, '🌸', { fontSize: '18px' }).setDepth(3);
    var borderTR = this.add.text(W - 14, 12, '🌸', { fontSize: '18px' }).setOrigin(1, 0).setDepth(3);
    var borderBL = this.add.text(14, H - 12, '🌸', { fontSize: '18px' }).setOrigin(0, 1).setDepth(3);
    var borderBR = this.add.text(W - 14, H - 12, '🌸', { fontSize: '18px' }).setOrigin(1, 1).setDepth(3);
    this._content.push(borderTL, borderTR, borderBL, borderBR);

    // Conteúdo da carta
    var letterText =
      'Mãe,\n\n' +
      'Escrever isso foi mais difícil\n' +
      'do que qualquer puzzle desse\n' +
      'jogo. Mas aqui vai:\n\n' +
      'Obrigado por cada manhã\n' +
      'que você se levantou antes\n' +
      'de mim. Por cada abraço\n' +
      'quando eu precisei.\n\n' +
      'Por ser minha mãe. ❤️\n\n' +
      'Com amor,\n' +
      'Mattheus 🌸';

    var letter = this.add.text(W/2, H*0.5, letterText, {
      fontSize: '14px',
      color: '#3a2a1a',
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 6,
      wordWrap: { width: W - 50 }
    }).setOrigin(0.5).setDepth(5).setAlpha(0);
    this._content.push(letter);

    this.tweens.add({ targets: letter, alpha: 1, duration: 2000, delay: 400 });

    var btn = this.add.text(W/2, H - 18, '[ Toque para continuar ]', {
      fontSize: '11px', color: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5, 1).setDepth(5).setAlpha(0).setInteractive({ useHandCursor: true });
    this._content.push(btn);

    this.tweens.add({ targets: btn, alpha: 0.8, duration: 800, delay: 3500 });
    btn.on('pointerdown', function() { self._nextStep(); });
  },

  // ── CENA 4: Ending ───────────────────────────
  _sceneEnding: function() {
    var W = this.scale.width;
    var H = this.scale.height;
    var self = this;
    this._content = [];

    this.cameras.main.setBackgroundColor('#0d0a1a');

    var title = this.add.text(W/2, H*0.18, '❤️', { fontSize: '72px' })
      .setOrigin(0.5).setDepth(5).setAlpha(0);
    this._content.push(title);

    this.tweens.add({ targets: title, alpha: 1, duration: 1200,
      onComplete: function() {
        self.tweens.add({
          targets: title,
          scaleX: 1.15, scaleY: 1.15,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    var msg = this.add.text(W/2, H*0.44,
      'Feliz Dia das Mães! 🌸\n\nEspero que tenha\ngostado da aventura!\n\nTe amo! ❤️',
      {
        fontSize: '20px',
        color: '#ffb3c6',
        fontFamily: 'monospace',
        align: 'center',
        lineSpacing: 8,
        stroke: '#3d0a20',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setDepth(5).setAlpha(0);
    this._content.push(msg);

    this.tweens.add({ targets: msg, alpha: 1, duration: 1500, delay: 1000 });

    var btn = this.add.text(W/2, H*0.82, ' VOLTAR À CIDADE ▶ ', {
      fontSize: '17px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#cc2244',
      padding: { x: 16, y: 10 }
    }).setOrigin(0.5).setDepth(5).setAlpha(0).setInteractive({ useHandCursor: true });
    this._content.push(btn);

    this.tweens.add({ targets: btn, alpha: 1, duration: 800, delay: 3000 });
    this.tweens.add({ targets: btn, scaleX: 1.04, scaleY: 1.04, duration: 700, yoyo: true, repeat: -1, delay: 3000, ease: 'Sine.easeInOut' });

    btn.on('pointerdown', function() {
      self.cameras.main.fadeOut(800);
      self.time.delayedCall(820, function() {
        self.scene.start('WorldScene');
      });
    });
  },

  update: function() {
    var H = this.scale.height;
    var W = this.scale.width;
    this._fallingHearts.forEach(function(h) {
      h.obj.y += h.speed;
      if (h.obj.y > H + 30) {
        h.obj.y = -30;
        h.obj.x = Phaser.Math.Between(0, W);
      }
    });
  }
});